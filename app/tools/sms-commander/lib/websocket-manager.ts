/**
 * WebSocket Connection Manager
 *
 * Manages WebSocket connections for broadcasting real-time updates.
 * Uses a simple in-memory store for connections (works for single-instance).
 * For production scaling, consider using Durable Objects.
 *
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 */

import type { Message, ThreadSummary } from "./types";

/**
 * WebSocket message types.
 */
export interface WSMessage {
    type: "message" | "threads_refresh" | "ping" | "pong";
    data?: unknown;
}

/** Maximum number of concurrent connections handled by this instance. */
const MAX_CONNECTIONS = 8;
/** Interval for sending heartbeat pings (milliseconds). */
const HEARTBEAT_INTERVAL_MS = 30000;
/** Maximum time to wait for a pong response before disconnecting (milliseconds). */
const HEARTBEAT_TIMEOUT_MS = HEARTBEAT_INTERVAL_MS * 2;

/**
 * Context attached to each registered connection.
 */
interface ConnectionContext {
    clientId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
}

interface ConnectionMetadata extends ConnectionContext {
    connectedAt: number;
    lastHeartbeatAt: number;
}

interface ConnectionReservation {
    commit(): void;
    cancel(): void;
}

const connections = new Set<WebSocket>();
const connectionMetadata = new WeakMap<WebSocket, ConnectionMetadata>();
const heartbeatTimers = new WeakMap<WebSocket, ReturnType<typeof setInterval>>();

let pendingReservations = 0;

/**
 * Attempt to reserve capacity for a new connection. Callers must invoke either
 * `commit` after the connection is fully established or `cancel` if the
 * handshake fails so the reservation count stays accurate.
 */
export function reserveConnectionSlot(): ConnectionReservation | null {
    if (connections.size + pendingReservations >= MAX_CONNECTIONS) {
        return null;
    }

    pendingReservations += 1;
    let settled = false;

    return {
        commit() {
            if (!settled) {
                pendingReservations -= 1;
                settled = true;
            }
        },
        cancel() {
            if (!settled) {
                pendingReservations -= 1;
                settled = true;
            }
        },
    };
}

/**
 * Add a WebSocket connection to the manager.
 */
export function addConnection(
    ws: WebSocket,
    context: ConnectionContext
): void {
    connections.add(ws);
    connectionMetadata.set(ws, {
        ...context,
        connectedAt: Date.now(),
        lastHeartbeatAt: Date.now(),
    });

    const cleanup = () => cleanupConnection(ws);

    ws.addEventListener("close", cleanup);
    ws.addEventListener("error", cleanup);
    ws.addEventListener("message", (event) => handleIncomingMessage(ws, event));

    const heartbeatTimer = setInterval(() => sendHeartbeat(ws), HEARTBEAT_INTERVAL_MS);
    heartbeatTimers.set(ws, heartbeatTimer);
}

/**
 * Broadcast a message to all connected clients.
 */
export function broadcast(message: WSMessage): void {
    const messageStr = JSON.stringify(message);
    for (const ws of connections) {
        try {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(messageStr);
            } else {
                cleanupConnection(ws);
            }
        } catch {
            cleanupConnection(ws);
        }
    }
}

/**
 * Broadcast a new message to all clients.
 */
export function broadcastMessage(message: Message, counterpart: string): void {
    broadcast({
        type: "message",
        data: {
            message,
            counterpart,
        },
    });
}

/**
 * Broadcast thread updates to all clients.
 */
export function broadcastThreads(threads: ThreadSummary[]): void {
    broadcast({
        type: "threads_refresh",
        data: { threads },
    });
}

/**
 * Handle incoming messages from the client.
 */
function handleIncomingMessage(ws: WebSocket, event: MessageEvent) {
    const metadata = connectionMetadata.get(ws);
    if (!metadata) {
        return;
    }

    if (typeof event.data !== "string") {
        return;
    }

    try {
        const message = JSON.parse(event.data) as WSMessage;
        if (message.type === "pong") {
            metadata.lastHeartbeatAt = Date.now();
        }
    } catch {
        // Ignore malformed payloads
    }
}

/**
 * Send heartbeat ping frames to keep the connection alive.
 */
function sendHeartbeat(ws: WebSocket): void {
    const metadata = connectionMetadata.get(ws);
    if (!metadata) {
        cleanupConnection(ws);
        return;
    }

    if (Date.now() - metadata.lastHeartbeatAt > HEARTBEAT_TIMEOUT_MS) {
        try {
            ws.close(1011, "Heartbeat timeout");
        } catch {
            // ignore
        } finally {
            cleanupConnection(ws);
        }
        return;
    }

    if (ws.readyState !== WebSocket.OPEN) {
        cleanupConnection(ws);
        return;
    }

    try {
        ws.send(JSON.stringify({ type: "ping" }));
    } catch {
        cleanupConnection(ws);
    }
}

/**
 * Remove the connection and clear any associated timers/metadata.
 */
function cleanupConnection(ws: WebSocket): void {
    if (!connections.has(ws)) {
        return;
    }

    connections.delete(ws);
    connectionMetadata.delete(ws);

    const timer = heartbeatTimers.get(ws);
    if (timer) {
        clearInterval(timer);
        heartbeatTimers.delete(ws);
    }
}


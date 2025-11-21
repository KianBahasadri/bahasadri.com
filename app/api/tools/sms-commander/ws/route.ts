/**
 * SMS Commander - WebSocket API Route
 *
 * Handles WebSocket upgrade requests for real-time message updates.
 * Uses Cloudflare Workers native WebSocket support.
 *
 * @see ../../../../tools/sms-commander/lib/websocket-manager.ts - Connection manager
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 */

import {
    addConnection,
    reserveConnectionSlot,
} from "../../../../tools/sms-commander/lib/websocket-manager";
import { validateWebsocketAuthToken } from "../../../../tools/sms-commander/lib/websocketAuth";

/**
 * Cloudflare Workers WebSocket type with accept method.
 */
interface CloudflareWebSocket extends WebSocket {
    accept(): void;
}

export const runtime = "edge";

/**
 * GET handler for WebSocket upgrade requests.
 *
 * @param request - Incoming HTTP request (with Upgrade header)
 * @returns Response with WebSocket upgrade
 */
export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    console.log("[WS] Upgrade request received", {
        path: url.pathname,
        headers: Object.fromEntries(request.headers.entries()),
        hasWebSocketPair: !!(globalThis as any).WebSocketPair,
        isSecure: url.protocol === "https:",
    });

    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
    }

    const token = url.searchParams.get("token");
    const validation = await validateWebsocketAuthToken(token);
    if (!validation.valid) {
        return new Response(validation.error ?? "Unauthorized", {
            status: 401,
        });
    }

    const reservation = reserveConnectionSlot();
    if (!reservation) {
        return new Response("Too many WebSocket connections", { status: 429 });
    }

    // Cloudflare Workers WebSocketPair (available at runtime)
    const WebSocketPair = (
        globalThis as unknown as {
            WebSocketPair: new () => {
                0: CloudflareWebSocket;
                1: CloudflareWebSocket;
            };
        }
    ).WebSocketPair;

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const connectionContext = {
        clientId: validation.payload?.nonce ?? crypto.randomUUID(),
        ipAddress: request.headers.get("cf-connecting-ip"),
        userAgent: request.headers.get("user-agent"),
    };

    try {
        server.accept();
        addConnection(server, connectionContext);
        reservation.commit();
    } catch (error) {
        reservation.cancel();
        console.error("Failed to register WebSocket connection:", error);
        return new Response("Failed to register WebSocket connection", {
            status: 500,
        });
    }

    return new Response(null, {
        status: 101,
        // @ts-expect-error - Cloudflare Workers specific Response property
        webSocket: client,
    });
}

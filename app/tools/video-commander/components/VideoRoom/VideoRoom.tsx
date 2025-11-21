"use client";

/**
 * VideoRoom Component
 *
 * Main video conferencing component that automatically connects to the global
 * room and handles WebRTC connections using Cloudflare RealtimeKit.
 *
 * Type: Client Component (requires browser APIs: WebRTC, MediaDevices)
 *
 * Architecture:
 * 1. Request media permissions (camera/microphone)
 * 2. Fetch global room ID from backend
 * 3. Generate participant authentication token
 * 4. Initialize RealtimeKit SDK (PLACEHOLDER - actual implementation pending SDK)
 * 5. Manage local/remote participants and media tracks
 * 6. Handle error states and reconnection
 *
 * @see [PLAN.md](../../PLAN.md) - Planning and documentation
 * @see [types.ts](../../lib/types.ts) - Type definitions
 * @see [docs/COMPONENTS.md](../../../../../docs/COMPONENTS.md) - Component patterns
 * @see [docs/AI_AGENT_STANDARDS.md](../../../../../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 * @see [docs/CONTENT_STYLE.md](../../../../../docs/CONTENT_STYLE.md) - Content style guide
 * @see https://developers.cloudflare.com/realtime/llms-full.txt - Cloudflare Realtime API documentation
 */

import { useState, useEffect, useRef, useCallback } from "react";
import ParticipantGrid from "../ParticipantGrid/ParticipantGrid";
import Controls from "../Controls/Controls";
import styles from "./VideoRoom.module.css";
import type { Participant, RoomState } from "../../lib/types";

/**
 * VideoRoom Component
 *
 * Automatically connects to the global room on mount and handles:
 * 1. Request media permissions
 * 2. Get global room ID
 * 3. Connect to RealtimeKit
 * 4. Manage participants
 * 5. Handle errors
 *
 * @returns JSX element representing the video room
 */
export default function VideoRoom() {
    // Room and connection state
    const [roomState, setRoomState] = useState<RoomState>("idle");
    const [roomId, setRoomId] = useState<string>("");
    const [authToken, setAuthToken] = useState<string>("");

    // Participant management
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Media stream state
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // Refs for tracking component lifecycle
    const hasInitializedRef = useRef(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const realtimeKitInstanceRef = useRef<unknown>(null);

    /**
     * Updates local video element when stream changes
     */
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    /**
     * Auto-connect to global room on mount
     */
    useEffect(() => {
        if (hasInitializedRef.current) {
            return;
        }
        hasInitializedRef.current = true;
        connectToGlobalRoom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Cleans up resources when component unmounts or on disconnect
     */
    const cleanupResources = useCallback(() => {
        // Stop all local media tracks
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                track.stop();
            });
            setLocalStream(null);
        }

        // TODO: Disconnect from RealtimeKit SDK if initialized
        if (realtimeKitInstanceRef.current) {
            console.log(
                "Disconnecting from RealtimeKit (placeholder - SDK integration pending)"
            );
            realtimeKitInstanceRef.current = null;
        }

        // Reset state
        setParticipants([]);
        setRoomId("");
        setAuthToken("");
    }, [localStream]);

    /**
     * Requests camera and microphone permissions
     *
     * @returns Promise resolving to MediaStream or null
     */
    const requestMediaPermissions = useCallback(
        async (): Promise<MediaStream | null> => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                    },
                });
                return stream;
            } catch (err) {
                console.error("Failed to get media permissions:", err);
                const errorMsg =
                    err instanceof Error ? err.message : "Camera/mic access denied";
                setError(`Media permission denied: ${errorMsg}`);
                return null;
            }
        },
        []
    );

    /**
     * Fetches the global room ID from backend
     *
     * @returns Promise resolving to room ID
     * @throws {Error} If the request fails
     */
    const fetchGlobalRoomId = useCallback(async (): Promise<string> => {
        try {
            const response = await fetch(
                "/api/tools/video-commander/global-room"
            );

            if (!response.ok) {
                const errorData = (await response.json()) as { error?: string };
                throw new Error(
                    errorData.error || `HTTP ${response.status} getting global room`
                );
            }

            const data = (await response.json()) as { room_id: string };
            return data.room_id;
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to fetch global room";
            throw new Error(`Global room fetch error: ${errorMsg}`);
        }
    }, []);

    /**
     * Generates participant authentication token from backend
     *
     * @param meetingId - Meeting ID
     * @param participantName - Participant name
     * @returns Promise resolving to authentication token
     * @throws {Error} If the request fails
     */
    const generateToken = useCallback(
        async (
            meetingId: string,
            participantName: string
        ): Promise<string> => {
            try {
                const response = await fetch(
                    "/api/tools/video-commander/token",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            meeting_id: meetingId,
                            name: participantName,
                        }),
                    }
                );

                if (!response.ok) {
                    const errorData = (await response.json()) as {
                        error?: string;
                    };
                    throw new Error(
                        errorData.error || `HTTP ${response.status} generating token`
                    );
                }

                const data = (await response.json()) as { auth_token: string };
                return data.auth_token;
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : "Failed to generate token";
                throw new Error(`Token generation error: ${errorMsg}`);
            }
        },
        []
    );

    /**
     * Initializes RealtimeKit SDK connection
     *
     * TODO: Implement actual RealtimeKit SDK initialization when SDK is available
     * Currently a placeholder showing the expected flow.
     *
     * @param token - Authentication token
     * @param meetingId - Meeting ID
     * @throws {Error} If SDK initialization fails
     */
    const initializeRealtimeKit = useCallback(
        async (token: string, meetingId: string): Promise<void> => {
            try {
                // PLACEHOLDER: This is where we would initialize the actual RealtimeKit SDK
                // Example (once SDK is available):
                /*
                const RealtimeKit = (await import('@cloudflare/realtime-kit')).default;
                const instance = new RealtimeKit({
                    token,
                    meetingId,
                    onRemoteParticipantJoined: (participant) => { ... },
                    onRemoteParticipantLeft: (participantId) => { ... },
                    onRemoteTrack: (track) => { ... },
                });
                await instance.connect();
                realtimeKitInstanceRef.current = instance;
                */

                console.log(
                    "RealtimeKit SDK initialization: placeholder (actual SDK integration pending)",
                    {
                        token: token.substring(0, 20) + "...",
                        meetingId,
                    }
                );

                // For now, simulate successful connection
                realtimeKitInstanceRef.current = {
                    connected: true,
                    meetingId,
                };
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : "SDK initialization failed";
                throw new Error(`RealtimeKit SDK error: ${errorMsg}`);
            }
        },
        []
    );

    /**
     * Connects to the global room
     *
     * Flow:
     * 1. Request media permissions
     * 2. Fetch global room ID
     * 3. Generate authentication token
     * 4. Initialize RealtimeKit SDK
     * 5. Add local participant
     */
    const connectToGlobalRoom = useCallback(async () => {
        setRoomState("connecting");
        setError(null);

        try {
            // Step 1: Request media permissions
            console.log("Step 1/4: Requesting media permissions...");
            const stream = await requestMediaPermissions();
            if (!stream) {
                setRoomState("error");
                return;
            }
            setLocalStream(stream);

            // Step 2: Fetch global room ID
            console.log("Step 2/4: Fetching global room ID...");
            const globalRoomId = await fetchGlobalRoomId();
            setRoomId(globalRoomId);

            // Step 3: Generate authentication token
            console.log("Step 3/4: Generating authentication token...");
            const token = await generateToken(globalRoomId, "Participant");
            setAuthToken(token);

            // Step 4: Initialize RealtimeKit SDK
            console.log("Step 4/4: Initializing RealtimeKit SDK...");
            await initializeRealtimeKit(token, globalRoomId);

            // Step 5: Add local participant
            console.log("Connection successful, adding local participant");
            const localParticipant: Participant = {
                id: "local",
                name: "You",
                videoEnabled: isVideoEnabled,
                audioEnabled: isAudioEnabled,
                stream,
                isLocal: true,
            };

            setParticipants([localParticipant]);
            setRoomState("connected");
        } catch (err) {
            console.error("Failed to connect to global room:", err);
            const errorMsg =
                err instanceof Error ? err.message : "Connection failed";
            setError(errorMsg);
            setRoomState("error");
            cleanupResources();
        }
    }, [
        requestMediaPermissions,
        fetchGlobalRoomId,
        generateToken,
        initializeRealtimeKit,
        isVideoEnabled,
        isAudioEnabled,
        cleanupResources,
    ]);

    /**
     * Leaves the current room and reconnects
     */
    const handleLeaveRoom = useCallback(() => {
        cleanupResources();
        hasInitializedRef.current = false;
        setRoomState("idle");
        connectToGlobalRoom();
    }, [cleanupResources, connectToGlobalRoom]);

    /**
     * Toggles video on/off
     */
    const handleToggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !isVideoEnabled;
                setIsVideoEnabled(!isVideoEnabled);

                // Update participant state
                setParticipants((prev) =>
                    prev.map((p) =>
                        p.id === "local" ? { ...p, videoEnabled: !isVideoEnabled } : p
                    )
                );
            }
        }
    }, [isVideoEnabled, localStream]);

    /**
     * Toggles audio on/off
     */
    const handleToggleAudio = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !isAudioEnabled;
                setIsAudioEnabled(!isAudioEnabled);

                // Update participant state
                setParticipants((prev) =>
                    prev.map((p) =>
                        p.id === "local" ? { ...p, audioEnabled: !isAudioEnabled } : p
                    )
                );
            }
        }
    }, [isAudioEnabled, localStream]);

    return (
        <div className={styles.container}>
            {roomState === "idle" && (
                <div className={styles.loadingSection}>
                    <p>Initializing video room...</p>
                    <p className={styles.loadingSubtext}>
                        Requesting camera and microphone access
                    </p>
                </div>
            )}

            {roomState === "connecting" && (
                <div className={styles.loadingSection}>
                    <p>Connecting to global room...</p>
                    <p className={styles.loadingSubtext}>
                        Setting up media streams and generating authentication token
                    </p>
                </div>
            )}

            {roomState === "connected" && (
                <div className={styles.videoSection}>
                    <div className={styles.roomInfo}>
                        <p className={styles.roomId}>Connected to Global Room</p>
                        <p className={styles.roomStatus}>
                            {participants.length} participant
                            {participants.length !== 1 ? "s" : ""} connected
                        </p>
                    </div>

                    <ParticipantGrid participants={participants} />

                    <Controls
                        isVideoEnabled={isVideoEnabled}
                        isAudioEnabled={isAudioEnabled}
                        onToggleVideo={handleToggleVideo}
                        onToggleAudio={handleToggleAudio}
                        onLeave={handleLeaveRoom}
                    />
                </div>
            )}

            {roomState === "error" && error && (
                <div className={styles.errorSection}>
                    <p className={styles.errorTitle}>Connection Error</p>
                    <p className={styles.errorText}>{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            hasInitializedRef.current = false;
                            connectToGlobalRoom();
                        }}
                        className={styles.retryButton}
                    >
                        Retry Connection
                    </button>
                </div>
            )}
        </div>
    );
}

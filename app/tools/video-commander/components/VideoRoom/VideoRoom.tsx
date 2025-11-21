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
 * 4. Initialize RealtimeKit SDK and join meeting
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
import type { RTKParticipant } from "@cloudflare/realtimekit";
import ParticipantGrid from "../ParticipantGrid/ParticipantGrid";
import Controls from "../Controls/Controls";
import styles from "./VideoRoom.module.css";
import type { Participant, RoomState } from "../../lib/types";

type RealtimeKitModule = typeof import("@cloudflare/realtimekit");
type RealtimeKitMeetingInstance = Awaited<
    ReturnType<RealtimeKitModule["default"]["init"]>
>;

const generateParticipantId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    const buffer = new Uint8Array(16);
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
        crypto.getRandomValues(buffer);
    } else {
        for (let i = 0; i < buffer.length; i += 1) {
            buffer[i] = Math.floor(Math.random() * 256);
        }
    }

    return Array.from(buffer)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
};

const createMediaStream = (
    videoTrack?: MediaStreamTrack,
    audioTrack?: MediaStreamTrack
): MediaStream | undefined => {
    const tracks: MediaStreamTrack[] = [];
    if (videoTrack) {
        tracks.push(videoTrack);
    }
    if (audioTrack) {
        tracks.push(audioTrack);
    }

    if (tracks.length === 0) {
        return undefined;
    }

    const stream = new MediaStream();
    tracks.forEach((track) => stream.addTrack(track));
    return stream;
};

const mapParticipantsFromMeeting = (
    meeting: RealtimeKitMeetingInstance
): Participant[] => {
    const localParticipant: Participant = {
        id: meeting.self.id || "local",
        name: meeting.self.name || "You",
        stream: createMediaStream(meeting.self.videoTrack, meeting.self.audioTrack),
        videoEnabled: Boolean(meeting.self.videoEnabled),
        audioEnabled: Boolean(meeting.self.audioEnabled),
        isLocal: true,
    };

    const remoteParticipants = meeting.participants.joined
        .toArray()
        .filter((participant) => participant.id !== meeting.self.id)
        .map((participant) => ({
            id: participant.id,
            name: participant.name || "Participant",
            stream: createMediaStream(participant.videoTrack, participant.audioTrack),
            videoEnabled: Boolean(participant.videoEnabled),
            audioEnabled: Boolean(participant.audioEnabled),
            isLocal: false,
        }));

    return [localParticipant, ...remoteParticipants];
};

/**
 * VideoRoom Component
 *
 * Automatically connects to the global room on mount and handles:
 * 1. Fetching/creating a meeting
 * 2. Generating a participant token
 * 3. Initializing the RealtimeKit SDK
 * 4. Managing local and remote media tracks
 *
 * @returns JSX element representing the video room
 */
export default function VideoRoom() {
    const [roomState, setRoomState] = useState<RoomState>("idle");
    const [roomId, setRoomId] = useState<string>("");
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [participantId] = useState<string>(() => generateParticipantId());
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);

    const hasInitializedRef = useRef(false);
    const meetingRef = useRef<RealtimeKitMeetingInstance | null>(null);
    const meetingListenersCleanupRef = useRef<(() => void) | null>(null);
    const remoteParticipantListenersRef = useRef<Map<string, () => void>>(
        new Map()
    );

    /**
     * Cleans up resources when component unmounts or on disconnect
     */
    const detachRemoteParticipantListeners = useCallback(
        (participantId?: string) => {
            if (participantId) {
                const cleanup = remoteParticipantListenersRef.current.get(
                    participantId
                );
                if (cleanup) {
                    cleanup();
                    remoteParticipantListenersRef.current.delete(participantId);
                }
                return;
            }

            remoteParticipantListenersRef.current.forEach((cleanup) => cleanup());
            remoteParticipantListenersRef.current.clear();
        },
        []
    );

    const updateParticipantsFromMeeting = useCallback(() => {
        const meeting = meetingRef.current;
        if (!meeting) {
            setParticipants([]);
            return;
        }

        const mappedParticipants = mapParticipantsFromMeeting(meeting);
        setParticipants(mappedParticipants);
        setIsVideoEnabled(Boolean(meeting.self.videoEnabled));
        setIsAudioEnabled(Boolean(meeting.self.audioEnabled));
    }, []);

    const registerRemoteParticipantListeners = useCallback(
        (participant: RTKParticipant | undefined) => {
            if (!participant) {
                return;
            }

            detachRemoteParticipantListeners(participant.id);

            const cleanup = () => {
                participant.removeListener("videoUpdate", updateParticipantsFromMeeting);
                participant.removeListener("audioUpdate", updateParticipantsFromMeeting);
                participant.removeListener(
                    "screenShareUpdate",
                    updateParticipantsFromMeeting
                );
            };

            participant.on("videoUpdate", updateParticipantsFromMeeting);
            participant.on("audioUpdate", updateParticipantsFromMeeting);
            participant.on("screenShareUpdate", updateParticipantsFromMeeting);

            remoteParticipantListenersRef.current.set(participant.id, cleanup);
        },
        [detachRemoteParticipantListeners, updateParticipantsFromMeeting]
    );

    const cleanupResources = useCallback(async () => {
        meetingListenersCleanupRef.current?.();
        meetingListenersCleanupRef.current = null;
        detachRemoteParticipantListeners();

        const meeting = meetingRef.current;
        meetingRef.current = null;

        if (meeting) {
            try {
                await meeting.leave();
            } catch (leaveError) {
                console.error("Failed to leave RealtimeKit meeting:", leaveError);
            }
        }

        setParticipants([]);
        setRoomId("");
        setIsAudioEnabled(false);
        setIsVideoEnabled(false);
    }, [detachRemoteParticipantListeners]);

    const attachMeetingListeners = useCallback(
        (meeting: RealtimeKitMeetingInstance) => {
            const handleParticipantJoined = (participant: RTKParticipant) => {
                registerRemoteParticipantListeners(participant);
                updateParticipantsFromMeeting();
            };

            const handleParticipantLeft = (participant: RTKParticipant) => {
                detachRemoteParticipantListeners(participant.id);
                updateParticipantsFromMeeting();
            };

            const handleParticipantsUpdate = () => {
                updateParticipantsFromMeeting();
            };

            meeting.participants.joined.on(
                "participantJoined",
                handleParticipantJoined
            );
            meeting.participants.joined.on("participantLeft", handleParticipantLeft);
            meeting.participants.joined.on(
                "participantsUpdate",
                handleParticipantsUpdate
            );
            meeting.self.on("videoUpdate", updateParticipantsFromMeeting);
            meeting.self.on("audioUpdate", updateParticipantsFromMeeting);

            meeting.participants.joined
                .toArray()
                .filter((participant) => participant.id !== meeting.self.id)
                .forEach(registerRemoteParticipantListeners);

            meetingListenersCleanupRef.current = () => {
                meeting.participants.joined.removeListener(
                    "participantJoined",
                    handleParticipantJoined
                );
                meeting.participants.joined.removeListener(
                    "participantLeft",
                    handleParticipantLeft
                );
                meeting.participants.joined.removeListener(
                    "participantsUpdate",
                    handleParticipantsUpdate
                );
                meeting.self.removeListener("videoUpdate", updateParticipantsFromMeeting);
                meeting.self.removeListener("audioUpdate", updateParticipantsFromMeeting);
                detachRemoteParticipantListeners();
            };

            updateParticipantsFromMeeting();
        },
        [
            detachRemoteParticipantListeners,
            registerRemoteParticipantListeners,
            updateParticipantsFromMeeting,
        ]
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
            participantName: string,
            participantIdValue: string
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
                            custom_participant_id: participantIdValue,
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

            const data = (await response.json()) as { auth_token?: string; token?: string };
            return data.auth_token ?? data.token ?? "";
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : "Failed to generate token";
                throw new Error(`Token generation error: ${errorMsg}`);
            }
        },
        []
    );

    /**
     * Connects to the global room
     *
     * Flow:
     * 1. Fetch global room ID
     * 2. Generate authentication token
     * 3. Initialize RealtimeKit SDK
     * 4. Join the meeting and enable media
     */
    const connectToGlobalRoom = useCallback(async () => {
        setRoomState("connecting");
        setError(null);
        setParticipants([]);

        try {
            const globalRoomId = await fetchGlobalRoomId();
            setRoomId(globalRoomId);

            const token = await generateToken(
                globalRoomId,
                "Participant",
                participantId
            );
            if (!token) {
                throw new Error("RealtimeKit did not return an auth token.");
            }

            const { default: RealtimeKit } = await import("@cloudflare/realtimekit");
            const meeting = await RealtimeKit.init({
                authToken: token,
                defaults: {
                    audio: false,
                    video: false,
                },
            });

            meetingRef.current = meeting;
            attachMeetingListeners(meeting);

            await meeting.join();

            try {
                await meeting.self.enableAudio();
            } catch (audioError) {
                console.warn("RealtimeKit audio enable failed:", audioError);
            }

            try {
                await meeting.self.enableVideo();
            } catch (videoError) {
                console.warn("RealtimeKit video enable failed:", videoError);
            }

            updateParticipantsFromMeeting();
            setRoomState("connected");
        } catch (err) {
            console.error("Failed to connect to global room:", err);
            const errorMsg =
                err instanceof Error ? err.message : "Connection failed";
            setError(errorMsg);
            setRoomState("error");
            await cleanupResources();
        }
    }, [
        attachMeetingListeners,
        cleanupResources,
        fetchGlobalRoomId,
        generateToken,
        participantId,
        updateParticipantsFromMeeting,
    ]);

    /**
     * Auto-connect to global room on mount
     */
    useEffect(() => {
        if (hasInitializedRef.current) {
            return;
        }
        hasInitializedRef.current = true;
        void connectToGlobalRoom();
    }, [connectToGlobalRoom]);

    useEffect(() => {
        return () => {
            void cleanupResources();
        };
    }, [cleanupResources]);

    /**
     * Leaves the current room and reconnects
     */
    const handleLeaveRoom = useCallback(() => {
        void cleanupResources().finally(() => {
            hasInitializedRef.current = false;
            setRoomState("idle");
            void connectToGlobalRoom();
        });
    }, [cleanupResources, connectToGlobalRoom]);

    /**
     * Toggles video on/off
     */
    const handleToggleVideo = useCallback(() => {
        const meeting = meetingRef.current;
        if (!meeting) {
            setError("RealtimeKit session is not ready yet.");
            return;
        }

        const toggle = async () => {
            try {
                if (meeting.self.videoEnabled) {
                    await meeting.self.disableVideo();
                } else {
                    await meeting.self.enableVideo();
                }
                updateParticipantsFromMeeting();
            } catch (videoError) {
                const message =
                    videoError instanceof Error
                        ? videoError.message
                        : "Unable to toggle video";
                setError(message);
            }
        };

        void toggle();
    }, [updateParticipantsFromMeeting]);

    /**
     * Toggles audio on/off
     */
    const handleToggleAudio = useCallback(() => {
        const meeting = meetingRef.current;
        if (!meeting) {
            setError("RealtimeKit session is not ready yet.");
            return;
        }

        const toggle = async () => {
            try {
                if (meeting.self.audioEnabled) {
                    await meeting.self.disableAudio();
                } else {
                    await meeting.self.enableAudio();
                }
                updateParticipantsFromMeeting();
            } catch (audioError) {
                const message =
                    audioError instanceof Error
                        ? audioError.message
                        : "Unable to toggle audio";
                setError(message);
            }
        };

        void toggle();
    }, [updateParticipantsFromMeeting]);

    return (
        <div className={styles.container}>
            {roomState === "idle" && (
                <div className={styles.loadingSection}>
                    <p>Initializing video room...</p>
                    <p className={styles.loadingSubtext}>
                        Preparing Cloudflare Realtime routing
                    </p>
                </div>
            )}

            {roomState === "connecting" && (
                <div className={styles.loadingSection}>
                    <p>Connecting to global room...</p>
                    <p className={styles.loadingSubtext}>
                        Generating tokens and joining the SFU
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

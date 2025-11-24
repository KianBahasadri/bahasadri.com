import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import RealtimeKit from "@cloudflare/realtimekit";
import type { Participant, RoomState } from "../../../../types/video-call";
import { createSession, generateToken } from "../../../../lib/api";
import ParticipantGrid from "../ParticipantGrid/ParticipantGrid";
import Controls from "../Controls/Controls";
import SessionList from "../SessionList/SessionList";
import MeetingsDropdown from "../MeetingsDropdown/MeetingsDropdown";
import styles from "./VideoRoom.module.css";

interface VideoRoomProps {
    readonly participantName?: string;
}

export default function VideoRoom({
    participantName,
}: VideoRoomProps): React.JSX.Element {
    const [roomState, setRoomState] = useState<RoomState>("idle");
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meetingRef = useRef<any>(null);
    const localVideoTrackRef = useRef<MediaStreamTrack | null>(null);
    const localAudioTrackRef = useRef<MediaStreamTrack | null>(null);

    const createSessionMutation = useMutation({
        mutationFn: async (_?: string) => await createSession(_),
    });

    const generateTokenMutation = useMutation({
        mutationFn: async (params: { meetingId: string; name?: string }) =>
            await generateToken(params.meetingId, params.name),
    });

    const getRealtimeKitConfig = useCallback(() => {
        const accountId = import.meta.env["VITE_CLOUDFLARE_ACCOUNT_ID"];
        const orgId = import.meta.env["VITE_CLOUDFLARE_REALTIME_ORG_ID"];

        if (!accountId || !orgId) {
            throw new Error(
                "RealtimeKit configuration missing. Please set VITE_CLOUDFLARE_ACCOUNT_ID and VITE_CLOUDFLARE_REALTIME_ORG_ID environment variables."
            );
        }

        return { accountId, appId: orgId };
    }, []);

    const requestMediaPermissions =
        useCallback(async (): Promise<MediaStream> => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: videoEnabled,
                    audio: audioEnabled,
                });
                return stream;
            } catch (error_) {
                const errorMessage =
                    error_ instanceof Error
                        ? error_.message
                        : "Failed to access camera/microphone";
                throw new Error(
                    `Permission denied: ${errorMessage}. Please allow camera and microphone access.`
                );
            }
        }, [videoEnabled, audioEnabled]);

    const cleanupMedia = useCallback(() => {
        if (localVideoTrackRef.current) {
            localVideoTrackRef.current.stop();
            localVideoTrackRef.current = null;
        }
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.stop();
            localAudioTrackRef.current = null;
        }
        if (localStream) {
            for (const track of localStream.getTracks()) {
                track.stop();
            }
            setLocalStream(null);
        }
    }, [localStream]);

    const addParticipant = useCallback(
        (remoteParticipant: Participant): void => {
            setParticipants((prev) => {
                if (prev.some((prevP) => prevP.id === remoteParticipant.id)) {
                    return prev;
                }
                return [...prev, remoteParticipant];
            });
        },
        []
    );

    const removeParticipant = useCallback((id: string): void => {
        setParticipants((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const setupEventHandlers = useCallback(
        (client: {
            on?: (event: string, handler: (...args: unknown[]) => void) => void;
            addEventListener?: (
                event: string,
                handler: (e: Event) => void
            ) => void;
        }): void => {
            const handleParticipantJoined = (participant: unknown): void => {
                const p = participant as {
                    id?: string;
                    name?: string;
                    videoTrack?: MediaStreamTrack;
                    audioTrack?: MediaStreamTrack;
                };
                const participantId =
                    p.id ?? `participant-${String(Date.now())}`;
                const remoteParticipant: Participant = {
                    id: participantId,
                    name: p.name ?? "Participant",
                    videoEnabled: true,
                    audioEnabled: true,
                };

                if (p.videoTrack) {
                    const tracks: MediaStreamTrack[] = [p.videoTrack];
                    const remoteStream = new MediaStream(tracks);
                    if (p.audioTrack) {
                        remoteStream.addTrack(p.audioTrack);
                    }
                    remoteParticipant.stream = remoteStream;
                }

                addParticipant(remoteParticipant);
            };

            const handleParticipantLeft = (participantId: unknown): void => {
                const id =
                    typeof participantId === "string"
                        ? participantId
                        : String(participantId);
                removeParticipant(id);
            };

            const handleError = (err: unknown): void => {
                setError(`Meeting error: ${String(err)}`);
                setRoomState("error");
            };

            if (client.on) {
                client.on("participantJoined", handleParticipantJoined);
                client.on("participantLeft", handleParticipantLeft);
                client.on("error", handleError);
            } else if (client.addEventListener) {
                const handleJoinedEvent = (e: Event): void => {
                    const detail = (e as { detail?: unknown }).detail;
                    handleParticipantJoined(detail ?? e);
                };
                const handleLeftEvent = (e: Event): void => {
                    const detail = (e as { detail?: unknown }).detail;
                    handleParticipantLeft(detail ?? e);
                };
                const handleErrorEvent = (e: Event): void => {
                    const detail = (e as { detail?: unknown }).detail;
                    handleError(detail ?? e);
                };
                client.addEventListener("participantJoined", handleJoinedEvent);
                client.addEventListener("participantLeft", handleLeftEvent);
                client.addEventListener("error", handleErrorEvent);
            }
        },
        [addParticipant, removeParticipant]
    );

    const initializeMediaStream =
        useCallback(async (): Promise<MediaStream> => {
            const stream = await requestMediaPermissions();
            setLocalStream(stream);

            const videoTrack = stream.getVideoTracks()[0];
            const audioTrack = stream.getAudioTracks()[0];
            if (videoTrack) localVideoTrackRef.current = videoTrack;
            if (audioTrack) localAudioTrackRef.current = audioTrack;

            return stream;
        }, [requestMediaPermissions]);

    const joinMeetingClient = useCallback(
        async (
            client: { join: (meetingId?: string) => Promise<void> | void },
            meetingId: string
        ): Promise<void> => {
            if (typeof client.join === "function") {
                const joinResult = client.join(meetingId);
                if (joinResult instanceof Promise) {
                    await joinResult;
                }
            }
        },
        []
    );

    const handleJoinMeeting = useCallback(
        async (targetMeetingId: string) => {
            try {
                setRoomState("connecting");
                setError(null);

                const stream = await initializeMediaStream();
                const videoTrack = stream.getVideoTracks()[0];
                const audioTrack = stream.getAudioTracks()[0];

                const tokenResponse = await generateTokenMutation.mutateAsync({
                    meetingId: targetMeetingId,
                    ...(participantName ? { name: participantName } : {}),
                });

                const config = getRealtimeKitConfig();
                const meeting = (
                    RealtimeKit as {
                        init: (config: {
                            accountId: string;
                            appId: string;
                            authToken: string;
                        }) => Promise<object> | object;
                    }
                ).init({
                    accountId: config.accountId,
                    appId: config.appId,
                    authToken: tokenResponse.auth_token,
                });

                const meetingClient =
                    meeting instanceof Promise ? await meeting : meeting;
                meetingRef.current = meetingClient;

                const client = meetingClient as {
                    join: (meetingId?: string) => Promise<void> | void;
                };
                await joinMeetingClient(client, targetMeetingId);

                const localParticipant: Participant = {
                    id: "local",
                    name: participantName ?? "You",
                    videoEnabled: videoTrack?.enabled ?? false,
                    audioEnabled: audioTrack?.enabled ?? false,
                    stream,
                };

                setParticipants([localParticipant]);
                setRoomState("connected");

                const eventClient = meetingClient as {
                    on?: (
                        event: string,
                        handler: (...args: unknown[]) => void
                    ) => void;
                    addEventListener?: (
                        event: string,
                        handler: (e: Event) => void
                    ) => void;
                };
                setupEventHandlers(eventClient);
            } catch (error_) {
                cleanupMedia();
                const errorMessage =
                    error_ instanceof Error
                        ? error_.message
                        : "Failed to join meeting";
                setError(errorMessage);
                setRoomState("error");
            }
        },
        [
            participantName,
            initializeMediaStream,
            generateTokenMutation,
            getRealtimeKitConfig,
            joinMeetingClient,
            cleanupMedia,
            setupEventHandlers,
        ]
    );

    const handleCreateCall = useCallback(async () => {
        try {
            setRoomState("connecting");
            setError(null);

            const sessionResponse = await createSessionMutation.mutateAsync(
                undefined
            );
            await handleJoinMeeting(sessionResponse.meeting_id);
        } catch (error_) {
            const errorMessage =
                error_ instanceof Error
                    ? error_.message
                    : "Failed to create call";
            setError(errorMessage);
            setRoomState("error");
        }
    }, [createSessionMutation, handleJoinMeeting]);

    const handleToggleVideo = useCallback(() => {
        if (localVideoTrackRef.current) {
            localVideoTrackRef.current.enabled =
                !localVideoTrackRef.current.enabled;
            setVideoEnabled(localVideoTrackRef.current.enabled);
            setParticipants((prev) =>
                prev.map((p) =>
                    p.id === "local"
                        ? {
                              ...p,
                              videoEnabled:
                                  localVideoTrackRef.current?.enabled ?? false,
                          }
                        : p
                )
            );
        }
    }, []);

    const handleToggleAudio = useCallback(() => {
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.enabled =
                !localAudioTrackRef.current.enabled;
            setAudioEnabled(localAudioTrackRef.current.enabled);
            setParticipants((prev) =>
                prev.map((p) =>
                    p.id === "local"
                        ? {
                              ...p,
                              audioEnabled:
                                  localAudioTrackRef.current?.enabled ?? false,
                          }
                        : p
                )
            );
        }
    }, []);

    const handleLeave = useCallback(() => {
        if (meetingRef.current) {
            const client = meetingRef.current as {
                leave?: () => void | Promise<void>;
            };
            if (typeof client.leave === "function") {
                const result = client.leave();
                if (result instanceof Promise) {
                    result.catch(() => {
                        // Ignore leave errors
                    });
                }
            }
            meetingRef.current = null;
        }
        cleanupMedia();
        setParticipants([]);
        setRoomState("idle");
        setError(null);
    }, [cleanupMedia]);

    useEffect(() => {
        return (): void => {
            handleLeave();
        };
    }, [handleLeave]);

    if (roomState === "idle") {
        return (
            <div className={styles["container"]}>
                <div className={styles["idleState"]}>
                    <h2 className={styles["title"]}>Video Call Interface</h2>
                    <div className={styles["buttonGroup"]}>
                        <button
                            type="button"
                            className={styles["createButton"]}
                            onClick={() => {
                                void handleCreateCall();
                            }}
                            disabled={createSessionMutation.isPending}
                        >
                            {createSessionMutation.isPending
                                ? "Connecting..."
                                : "Create New Call"}
                        </button>
                        <MeetingsDropdown
                            onSelectMeeting={(meetingId) => {
                                void handleJoinMeeting(meetingId);
                            }}
                        />
                    </div>
                    {error === null ? null : (
                        <div className={styles["error"]}>{error}</div>
                    )}
                    <SessionList
                        onJoinSession={(meetingId) => {
                            void handleJoinMeeting(meetingId);
                        }}
                    />
                </div>
            </div>
        );
    }

    if (roomState === "connecting") {
        return (
            <div className={styles["container"]}>
                <div className={styles["connectingState"]}>
                    <div className={styles["spinner"]}>⏳</div>
                    <p>Establishing connection... 📡</p>
                </div>
            </div>
        );
    }

    if (roomState === "error") {
        return (
            <div className={styles["container"]}>
                <div className={styles["errorState"]}>
                    <h2 className={styles["errorTitle"]}>
                        Connection Error 💔
                    </h2>
                    <p className={styles["errorMessage"]}>
                        {error ?? "Unknown error"}
                    </p>
                    <button
                        type="button"
                        className={styles["retryButton"]}
                        onClick={() => {
                            void handleCreateCall();
                        }}
                    >
                        Retry
                    </button>
                    <button
                        type="button"
                        className={styles["backButton"]}
                        onClick={() => {
                            handleLeave();
                            setRoomState("idle");
                        }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles["container"]}>
            <ParticipantGrid participants={participants} />
            <Controls
                videoEnabled={videoEnabled}
                audioEnabled={audioEnabled}
                onToggleVideo={handleToggleVideo}
                onToggleAudio={handleToggleAudio}
                onLeave={handleLeave}
            />
        </div>
    );
}

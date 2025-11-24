import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import RealtimeKit from "@cloudflare/realtimekit";
import type { Participant, RoomState } from "../../../../types/video-call";
import { createSession, generateToken } from "../../../../lib/api";
import ParticipantGrid from "../ParticipantGrid/ParticipantGrid";
import Controls from "../Controls/Controls";
import styles from "./VideoRoom.module.css";

interface VideoRoomProps {
    participantName?: string;
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
        mutationFn: (_?: string) => createSession(_),
    });

    const generateTokenMutation = useMutation({
        mutationFn: (params: {
            meetingId: string;
            name?: string;
        }) => generateToken(params.meetingId, params.name),
    });

    const getRealtimeKitConfig = useCallback(() => {
        const accountId = import.meta.env["VITE_CLOUDFLARE_ACCOUNT_ID"];
        const appId = import.meta.env["VITE_CLOUDFLARE_REALTIME_APP_ID"];

        if (!accountId || !appId) {
            throw new Error(
                "RealtimeKit configuration missing. Please set VITE_CLOUDFLARE_ACCOUNT_ID and VITE_CLOUDFLARE_REALTIME_APP_ID environment variables."
            );
        }

        return { accountId, appId };
    }, []);

    const requestMediaPermissions = useCallback(async (): Promise<MediaStream> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoEnabled,
                audio: audioEnabled,
            });
            return stream;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
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
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
        }
    }, [localStream]);

    const handleJoinMeeting = useCallback(
        async (targetMeetingId: string) => {
            try {
                setRoomState("connecting");
                setError(null);

                const stream = await requestMediaPermissions();
                setLocalStream(stream);

                const videoTrack = stream.getVideoTracks()[0];
                const audioTrack = stream.getAudioTracks()[0];
                if (videoTrack) localVideoTrackRef.current = videoTrack;
                if (audioTrack) localAudioTrackRef.current = audioTrack;

                const tokenResponse = await generateTokenMutation.mutateAsync({
                    meetingId: targetMeetingId,
                    ...(participantName ? { name: participantName } : {}),
                });

                const config = getRealtimeKitConfig();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const meeting = (RealtimeKit as any).init({
                    accountId: config.accountId,
                    appId: config.appId,
                    authToken: tokenResponse.auth_token,
                }) as Promise<unknown> | unknown;

                const meetingClient = meeting instanceof Promise ? await meeting : meeting;
                meetingRef.current = meetingClient;

                if (typeof meetingClient === "object" && meetingClient !== null) {
                    const client = meetingClient as { join: (meetingId?: string) => Promise<void> | void };
                    if (typeof client.join === "function") {
                        const joinResult = client.join(targetMeetingId);
                        if (joinResult instanceof Promise) {
                            await joinResult;
                        }
                    }
                }

                const localParticipant: Participant = {
                    id: "local",
                    name: participantName || "You",
                    videoEnabled: !!videoTrack && videoTrack.enabled,
                    audioEnabled: !!audioTrack && audioTrack.enabled,
                    stream,
                };

                setParticipants([localParticipant]);
                setRoomState("connected");

                if (typeof meetingClient === "object" && meetingClient !== null) {
                    const client = meetingClient as {
                        on?: (event: string, handler: (...args: unknown[]) => void) => void;
                        addEventListener?: (event: string, handler: (e: Event) => void) => void;
                    };

                    const handleParticipantJoined = (participant: unknown): void => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const p = participant as any;
                        const remoteParticipant: Participant = {
                            id: p?.id || `participant-${Date.now()}`,
                            name: p?.name || `Participant`,
                            videoEnabled: true,
                            audioEnabled: true,
                        };

                        if (p?.videoTrack) {
                            const remoteStream = new MediaStream([p.videoTrack]);
                            if (p?.audioTrack) {
                                remoteStream.addTrack(p.audioTrack);
                            }
                            remoteParticipant.stream = remoteStream;
                        }

                        setParticipants((prev) => {
                            if (prev.some((prevP) => prevP.id === remoteParticipant.id)) {
                                return prev;
                            }
                            return [...prev, remoteParticipant];
                        });
                    };

                    const handleParticipantLeft = (participantId: unknown): void => {
                        const id = typeof participantId === "string" ? participantId : String(participantId);
                        setParticipants((prev) => prev.filter((p) => p.id !== id));
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
                        client.addEventListener("participantJoined", (e: Event) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            handleParticipantJoined((e as any).detail || e);
                        });
                        client.addEventListener("participantLeft", (e: Event) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            handleParticipantLeft((e as any).detail || e);
                        });
                        client.addEventListener("error", (e: Event) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            handleError((e as any).detail || e);
                        });
                    }
                }
            } catch (err) {
                cleanupMedia();
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to join meeting";
                setError(errorMessage);
                setRoomState("error");
            }
        },
        [
            participantName,
            requestMediaPermissions,
            generateTokenMutation,
            getRealtimeKitConfig,
            cleanupMedia,
        ]
    );

    const handleCreateCall = useCallback(async () => {
        try {
            setRoomState("connecting");
            setError(null);

            const sessionResponse = await createSessionMutation.mutateAsync(undefined);
            await handleJoinMeeting(sessionResponse.meeting_id);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to create call";
            setError(errorMessage);
            setRoomState("error");
        }
    }, [createSessionMutation, handleJoinMeeting]);

    const handleToggleVideo = useCallback(() => {
        if (localVideoTrackRef.current) {
            localVideoTrackRef.current.enabled = !localVideoTrackRef.current.enabled;
            setVideoEnabled(localVideoTrackRef.current.enabled);
            setParticipants((prev) =>
                prev.map((p) =>
                    p.id === "local"
                        ? { ...p, videoEnabled: localVideoTrackRef.current?.enabled ?? false }
                        : p
                )
            );
        }
    }, []);

    const handleToggleAudio = useCallback(() => {
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.enabled = !localAudioTrackRef.current.enabled;
            setAudioEnabled(localAudioTrackRef.current.enabled);
            setParticipants((prev) =>
                prev.map((p) =>
                    p.id === "local"
                        ? { ...p, audioEnabled: localAudioTrackRef.current?.enabled ?? false }
                        : p
                )
            );
        }
    }, []);

    const handleLeave = useCallback(() => {
        if (meetingRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const client = meetingRef.current as { leave?: () => void | Promise<void> };
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
        return () => {
            handleLeave();
        };
    }, [handleLeave]);

    if (roomState === "idle") {
        return (
            <div className={styles["container"]}>
                <div className={styles["idleState"]}>
                    <h2 className={styles["title"]}>
                        Video Call Interface 💾📹
                    </h2>
                    <p className={styles["description"]}>
                        Initialize connection protocol... 🔌
                    </p>
                    <button
                        type="button"
                        className={styles["createButton"]}
                        onClick={handleCreateCall}
                        disabled={createSessionMutation.isPending}
                    >
                        {createSessionMutation.isPending
                            ? "Connecting..."
                            : "Create New Call"}
                    </button>
                    {error && <div className={styles["error"]}>{error}</div>}
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
                    <h2 className={styles["errorTitle"]}>Connection Error 💔</h2>
                    <p className={styles["errorMessage"]}>{error || "Unknown error"}</p>
                    <button
                        type="button"
                        className={styles["retryButton"]}
                        onClick={handleCreateCall}
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


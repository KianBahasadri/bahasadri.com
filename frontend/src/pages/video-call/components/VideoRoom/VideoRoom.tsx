import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    RealtimeKitProvider,
    useRealtimeKitClient,
    useRealtimeKitMeeting,
    useRealtimeKitSelector,
} from "@cloudflare/realtimekit-react";
import type { Participant, RoomState } from "../../../../types/video-call";
import {
    generateToken,
} from "../../../../lib/api";
import ParticipantGrid from "../ParticipantGrid/ParticipantGrid";
import Controls from "../Controls/Controls";
import MeetingsList from "../MeetingsList/MeetingsList";
import AllMeetingsList from "../AllMeetingsList/AllMeetingsList";
import styles from "./VideoRoom.module.css";

interface VideoRoomProps {
    readonly participantName?: string;
}

function InMeetingRoom({ participantName }: VideoRoomProps): React.JSX.Element {
    const meetingContext = useRealtimeKitMeeting();
    const meetingClient = meetingContext.meeting;

    const self = useRealtimeKitSelector((m) => m.self);
    const activeParticipants = useRealtimeKitSelector((m) =>
        m.participants.active.toArray()
    );
    const videoEnabled = useRealtimeKitSelector((m) => m.self.videoEnabled);
    const audioEnabled = useRealtimeKitSelector((m) => m.self.audioEnabled);

    const [participants, setParticipants] = useState<Participant[]>([]);
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    useEffect(() => {
        const localParticipant: Participant = {
            id: "local",
            name: participantName || self.name || "You",
            videoEnabled: self.videoEnabled,
            audioEnabled: self.audioEnabled,
        };

        const remoteParticipants: Participant[] = activeParticipants.map(
            (p) => {
                const participantName = p.name || `Participant ${p.id}`;
                return {
                    id: p.id,
                    name: participantName,
                    videoEnabled: p.videoEnabled,
                    audioEnabled: p.audioEnabled,
                };
            }
        );

        setParticipants([localParticipant, ...remoteParticipants]);
    }, [self, activeParticipants, participantName]);

    useEffect(() => {
        const currentVideoRefs = videoRefs.current;
        const localVideoElement = currentVideoRefs.get("local");
        if (localVideoElement && self.videoTrack) {
            meetingClient.self.registerVideoElement(localVideoElement);
        }

        const currentActiveParticipants = activeParticipants;
        for (const participant of currentActiveParticipants) {
            const videoElement = currentVideoRefs.get(participant.id);
            if (videoElement && participant.videoTrack) {
                participant.registerVideoElement(videoElement);
            }
        }

        return (): void => {
            const cleanupLocalVideo = currentVideoRefs.get("local");
            if (cleanupLocalVideo) {
                meetingClient.self.deregisterVideoElement(cleanupLocalVideo);
            }

            for (const participant of currentActiveParticipants) {
                const cleanupVideo = currentVideoRefs.get(participant.id);
                if (cleanupVideo) {
                    participant.deregisterVideoElement(cleanupVideo);
                }
            }
        };
    }, [meetingClient, self, activeParticipants]);

    const handleToggleVideo = useCallback(() => {
        if (meetingClient.self.videoEnabled) {
            void meetingClient.self.disableVideo();
        } else {
            void meetingClient.self.enableVideo();
        }
    }, [meetingClient]);

    const handleToggleAudio = useCallback(() => {
        if (meetingClient.self.audioEnabled) {
            void meetingClient.self.disableAudio();
        } else {
            void meetingClient.self.enableAudio();
        }
    }, [meetingClient]);

    const handleLeave = useCallback((): void => {
        void meetingClient.leave();
    }, [meetingClient]);

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

export default function VideoRoom({
    participantName,
}: VideoRoomProps): React.JSX.Element {
    const [roomState, setRoomState] = useState<RoomState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [meeting, setMeeting] = useState<
        ReturnType<typeof useRealtimeKitClient>[0] | null
    >(null);

    const [, initMeeting] = useRealtimeKitClient();

    const generateTokenMutation = useMutation({
        mutationFn: async (params: {
            meetingId: string;
            name?: string;
            presetName?: string;
        }) => await generateToken(params.meetingId, params.name, undefined, params.presetName),
    });


    const handleJoinMeeting = useCallback(
        async (targetMeetingId: string, presetName?: string) => {
            try {
                setRoomState("connecting");
                setError(null);

                const tokenResponse = await generateTokenMutation.mutateAsync({
                    meetingId: targetMeetingId,
                    ...(participantName ? { name: participantName } : {}),
                    ...(presetName ? { presetName } : {}),
                });

                const initializedMeeting = await initMeeting({
                    authToken: tokenResponse.auth_token,
                    defaults: {
                        audio: true,
                        video: true,
                    },
                });

                if (initializedMeeting) {
                    const joinMethod =
                        initializedMeeting.join.bind(initializedMeeting);
                    await joinMethod();
                    setMeeting(initializedMeeting);
                    setRoomState("connected");
                }
            } catch (error_) {
                const errorMessage =
                    error_ instanceof Error
                        ? error_.message
                        : "Failed to join meeting";
                setError(errorMessage);
                setRoomState("error");
            }
        },
        [participantName, generateTokenMutation, initMeeting]
    );


    const handleLeave = useCallback(() => {
        if (meeting) {
            void meeting.leave();
            setMeeting(null);
        }
        setRoomState("idle");
        setError(null);
    }, [meeting]);

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
                    {error === null ? null : (
                        <div className={styles["error"]}>{error}</div>
                    )}
                    <div className={styles["listsContainer"]}>
                        <MeetingsList
                            onJoinMeeting={(meetingId) => {
                                void handleJoinMeeting(meetingId);
                            }}
                        />
                        <AllMeetingsList
                            onJoinMeeting={(meetingId) => {
                                void handleJoinMeeting(meetingId);
                            }}
                        />
                    </div>
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

    if (roomState === "connected" && meeting) {
        return (
            <RealtimeKitProvider value={meeting}>
                {participantName ? (
                    <InMeetingRoom participantName={participantName} />
                ) : (
                    <InMeetingRoom />
                )}
            </RealtimeKitProvider>
        );
    }

    return (
        <div className={styles["container"]}>
            <div className={styles["idleState"]}>
                <p>Loading...</p>
            </div>
        </div>
    );
}

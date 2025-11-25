import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { useMutation } from "@tanstack/react-query";
import {
    RealtimeKitProvider,
    useRealtimeKitClient,
    useRealtimeKitMeeting,
    useRealtimeKitSelector,
} from "@cloudflare/realtimekit-react";
import {
    RtkUiProvider,
    RtkDialogManager,
    RtkSetupScreen,
    RtkEndedScreen,
    RtkSimpleGrid,
    RtkMeetingTitle,
    RtkClock,
    RtkParticipantCount,
    RtkMicToggle,
    RtkCameraToggle,
    RtkLeaveButton,
    RtkParticipantsAudio,
    RtkSpinner,
} from "@cloudflare/realtimekit-react-ui";
import type { RoomState } from "../../../../types/video-call";
import { generateToken } from "../../../../lib/api";
import MeetingsList from "../MeetingsList/MeetingsList";
import AllMeetingsList from "../AllMeetingsList/AllMeetingsList";
import IceTestStatus from "../IceTestStatus/IceTestStatus";
import { useIceServerTest } from "../../hooks/useIceServerTest";
import styles from "./VideoRoom.module.css";

interface VideoRoomProps {
    readonly participantName?: string;
    readonly meetingId?: string;
    readonly showMeetingList?: boolean;
    readonly onLeave?: () => void;
}

function InMeetingRoom(): React.JSX.Element {
    const { meeting } = useRealtimeKitMeeting();
    const activeParticipants = useRealtimeKitSelector((m) =>
        m.participants.active.toArray()
    );
    const pinnedParticipants = useRealtimeKitSelector((m) =>
        m.participants.pinned.toArray()
    );

    const participants = useMemo(() => {
        const self = meeting.self;
        return [
            ...pinnedParticipants,
            ...activeParticipants.filter(
                (p) => !pinnedParticipants.includes(p)
            ),
            self,
        ];
    }, [pinnedParticipants, activeParticipants, meeting.self]);

    return (
        <div className={styles["container"]}>
            <RtkParticipantsAudio meeting={meeting} />
            <header className={styles["header"]}>
                <div className={styles["headerLeft"]}>
                    <RtkMeetingTitle
                        meeting={meeting}
                        className={styles["meetingTitle"] ?? ""}
                    />
                </div>
                <div className={styles["headerRight"]}>
                    <RtkParticipantCount
                        meeting={meeting}
                        className={styles["participantCount"] ?? ""}
                    />
                    <RtkClock
                        meeting={meeting}
                        className={styles["clock"] ?? ""}
                    />
                </div>
            </header>
            <main className={styles["gridContainer"]}>
                <RtkSimpleGrid
                    participants={participants}
                    meeting={meeting}
                    gap={12}
                    aspectRatio="16:9"
                />
            </main>
            <footer className={styles["controls"]}>
                <RtkMicToggle meeting={meeting} />
                <RtkCameraToggle meeting={meeting} />
                <RtkLeaveButton />
            </footer>
        </div>
    );
}

function MeetingContent(): React.JSX.Element {
    const { meeting } = useRealtimeKitMeeting();
    const roomState = useRealtimeKitSelector((m) => m.self.roomState);
    const roomJoined = useRealtimeKitSelector((m) => m.self.roomJoined);

    if (roomState === "ended" || roomState === "left") {
        return <RtkEndedScreen meeting={meeting} />;
    }

    if (roomState === "joined" && roomJoined) {
        return <InMeetingRoom />;
    }

    return <RtkSetupScreen meeting={meeting} />;
}

export default function VideoRoom({
    participantName,
    meetingId,
    showMeetingList = false,
    onLeave,
}: VideoRoomProps): React.JSX.Element {
    const [roomState, setRoomState] = useState<RoomState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [meeting, setMeeting] = useState<
        ReturnType<typeof useRealtimeKitClient>[0] | null
    >(null);
    const joiningRef = useRef<string | null>(null);

    const [, initMeeting] = useRealtimeKitClient();

    // Test ICE server connectivity on page load
    const iceTest = useIceServerTest();

    const generateTokenMutation = useMutation({
        mutationFn: async (params: {
            meetingId: string;
            name?: string;
            presetName?: string;
        }) =>
            await generateToken(
                params.meetingId,
                params.name,
                undefined,
                params.presetName
            ),
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
                        audio: false,
                        video: false,
                    },
                    modules: {
                        devTools: {
                            logs: false,
                        },
                    },
                });

                if (initializedMeeting) {
                    setMeeting(initializedMeeting);
                    await initializedMeeting.joinRoom();
                }
            } catch (error_) {
                joiningRef.current = null;
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
        joiningRef.current = null;
        setRoomState("idle");
        setError(null);
        if (onLeave) {
            onLeave();
        }
    }, [meeting, onLeave]);

    useEffect(() => {
        if (
            meetingId &&
            roomState === "idle" &&
            !meeting &&
            joiningRef.current !== meetingId
        ) {
            joiningRef.current = meetingId;
            void handleJoinMeeting(meetingId);
        }
    }, [meetingId, roomState, meeting, handleJoinMeeting]);

    useEffect(() => {
        return (): void => {
            handleLeave();
        };
    }, [handleLeave]);

    if (roomState === "idle" && showMeetingList) {
        return (
            <div className={styles["container"]}>
                <div className={styles["idleState"]}>
                    <h2 className={styles["title"]}>Video Call Interface</h2>
                    <IceTestStatus
                        status={iceTest.status}
                        hasStun={iceTest.hasStun}
                        error={iceTest.error}
                        isFirefox={iceTest.isFirefox}
                        onRetry={iceTest.retest}
                    />
                    {error === null ? null : (
                        <div className={styles["error"]}>{error}</div>
                    )}
                    <div className={styles["listsContainer"]}>
                        <MeetingsList />
                        <AllMeetingsList />
                    </div>
                </div>
            </div>
        );
    }

    if (roomState === "idle" && !showMeetingList) {
        return (
            <div className={styles["container"]}>
                <div className={styles["idleState"]}>
                    <RtkSpinner className={styles["spinner"] ?? ""} />
                    <p>Preparing to join...</p>
                </div>
            </div>
        );
    }

    if (roomState === "connecting") {
        return (
            <div className={styles["container"]}>
                <div className={styles["connectingState"]}>
                    <RtkSpinner className={styles["spinner"] ?? ""} />
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
            <RealtimeKitProvider
                value={meeting}
                fallback={
                    <div className={styles["container"]}>
                        <div className={styles["connectingState"]}>
                            <RtkSpinner className={styles["spinner"] ?? ""} />
                            <p>Joining room... 📡</p>
                        </div>
                    </div>
                }
            >
                <RtkUiProvider meeting={meeting} showSetupScreen>
                    <RtkDialogManager meeting={meeting} />
                    <MeetingContent />
                </RtkUiProvider>
            </RealtimeKitProvider>
        );
    }

    return (
        <div className={styles["container"]}>
            <div className={styles["idleState"]}>
                <RtkSpinner className={styles["spinner"] ?? ""} />
                <p>Loading...</p>
            </div>
        </div>
    );
}

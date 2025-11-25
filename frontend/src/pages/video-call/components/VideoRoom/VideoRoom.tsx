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
    console.log("[VideoRoom] InMeetingRoom: Component rendering");
    const { meeting } = useRealtimeKitMeeting();
    console.log("[VideoRoom] InMeetingRoom: Meeting object:", meeting);
    const activeParticipants = useRealtimeKitSelector((m) =>
        m.participants.active.toArray()
    );
    console.log(
        "[VideoRoom] InMeetingRoom: Active participants:",
        activeParticipants
    );
    const pinnedParticipants = useRealtimeKitSelector((m) =>
        m.participants.pinned.toArray()
    );
    console.log(
        "[VideoRoom] InMeetingRoom: Pinned participants:",
        pinnedParticipants
    );

    const participants = useMemo(() => {
        const self = meeting.self;
        const result = [
            ...pinnedParticipants,
            ...activeParticipants.filter(
                (p) => !pinnedParticipants.includes(p)
            ),
            self,
        ];
        console.log(
            "[VideoRoom] InMeetingRoom: Computed participants:",
            result
        );
        return result;
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
    console.log("[VideoRoom] MeetingContent: Component rendering");
    const { meeting } = useRealtimeKitMeeting();
    const roomState = useRealtimeKitSelector((m) => m.self.roomState);
    const roomJoined = useRealtimeKitSelector((m) => m.self.roomJoined);
    console.log(
        "[VideoRoom] MeetingContent: roomState:",
        roomState,
        "roomJoined:",
        roomJoined
    );

    if (roomState === "ended" || roomState === "left") {
        console.log("[VideoRoom] MeetingContent: Showing ended screen");
        return <RtkEndedScreen meeting={meeting} />;
    }

    if (roomState === "joined" && roomJoined) {
        console.log("[VideoRoom] MeetingContent: Showing in-meeting room");
        return <InMeetingRoom />;
    }

    console.log("[VideoRoom] MeetingContent: Showing setup screen");
    return (
        <div className={styles["setupScreenWrapper"]}>
            <RtkSetupScreen meeting={meeting} size="sm" />
        </div>
    );
}

export default function VideoRoom({
    participantName,
    meetingId,
    showMeetingList = false,
    onLeave,
}: VideoRoomProps): React.JSX.Element {
    console.log("[VideoRoom] Component rendering with props:", {
        participantName,
        meetingId,
        showMeetingList,
        hasOnLeave: !!onLeave,
    });
    const [roomState, setRoomState] = useState<RoomState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [meeting, setMeeting] = useState<
        ReturnType<typeof useRealtimeKitClient>[0] | null
    >(null);
    const joiningRef = useRef<string | null>(null);
    const isMountedRef = useRef(true);
    const isJoiningRef = useRef(false);

    console.log("[VideoRoom] Current state:", {
        roomState,
        error,
        hasMeeting: !!meeting,
        joiningRef: joiningRef.current,
    });

    const [, initMeeting] = useRealtimeKitClient();
    console.log("[VideoRoom] initMeeting function available:", !!initMeeting);

    // Test ICE server connectivity on page load
    const iceTest = useIceServerTest();
    console.log("[VideoRoom] ICE test result:", iceTest);

    const generateTokenMutation = useMutation({
        mutationFn: async (params: {
            meetingId: string;
            name?: string;
            presetName?: string;
        }) => {
            console.log(
                "[VideoRoom] generateTokenMutation: Starting with params:",
                params
            );
            try {
                const result = await generateToken(
                    params.meetingId,
                    params.name,
                    undefined,
                    params.presetName
                );
                console.log(
                    "[VideoRoom] generateTokenMutation: Success, token received:",
                    {
                        hasToken: !!result.auth_token,
                        tokenLength: result.auth_token
                            ? result.auth_token.length
                            : 0,
                    }
                );
                return result;
            } catch (error) {
                console.error(
                    "[VideoRoom] generateTokenMutation: Error:",
                    error
                );
                throw error;
            }
        },
    });

    const handleJoinMeeting = useCallback(
        async (targetMeetingId: string, presetName?: string) => {
            console.log("[VideoRoom] handleJoinMeeting: Called with:", {
                targetMeetingId,
                presetName,
                participantName,
            });

            // Prevent concurrent calls
            if (isJoiningRef.current) {
                console.log(
                    "[VideoRoom] handleJoinMeeting: Already joining, skipping duplicate call"
                );
                return;
            }

            isJoiningRef.current = true;
            try {
                console.log(
                    "[VideoRoom] handleJoinMeeting: Setting state to connecting"
                );
                setRoomState("connecting");
                setError(null);

                console.log(
                    "[VideoRoom] handleJoinMeeting: Requesting token..."
                );
                const tokenResponse = await generateTokenMutation.mutateAsync({
                    meetingId: targetMeetingId,
                    ...(participantName ? { name: participantName } : {}),
                    ...(presetName ? { presetName } : {}),
                });
                console.log(
                    "[VideoRoom] handleJoinMeeting: Token received, initializing meeting..."
                );

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
                console.log(
                    "[VideoRoom] handleJoinMeeting: Meeting initialized:",
                    {
                        hasMeeting: !!initializedMeeting,
                    }
                );

                if (initializedMeeting) {
                    console.log(
                        "[VideoRoom] handleJoinMeeting: Setting meeting state and joining room..."
                    );
                    if (!isMountedRef.current) {
                        console.log(
                            "[VideoRoom] handleJoinMeeting: Component unmounted, cleaning up meeting"
                        );
                        void initializedMeeting.leave();
                        isJoiningRef.current = false;
                        return;
                    }

                    // Set default name to "admin-kun" if none was provided and user has permission
                    if (
                        initializedMeeting.self.permissions
                            .canEditDisplayName &&
                        !initializedMeeting.self.name
                    ) {
                        const nameToSet = participantName ?? "admin-kun";
                        console.log(
                            "[VideoRoom] handleJoinMeeting: Setting participant name:",
                            nameToSet
                        );
                        initializedMeeting.self.setName(nameToSet);
                    } else if (
                        participantName &&
                        initializedMeeting.self.permissions
                            .canEditDisplayName &&
                        initializedMeeting.self.name !== participantName
                    ) {
                        console.log(
                            "[VideoRoom] handleJoinMeeting: Updating participant name from prop"
                        );
                        initializedMeeting.self.setName(participantName);
                    }

                    setMeeting(initializedMeeting);
                    console.log(
                        "[VideoRoom] handleJoinMeeting: Calling joinRoom()..."
                    );
                    await initializedMeeting.joinRoom();
                    console.log(
                        "[VideoRoom] handleJoinMeeting: joinRoom() completed"
                    );
                    if (!isMountedRef.current) {
                        console.log(
                            "[VideoRoom] handleJoinMeeting: Component unmounted after joinRoom, cleaning up"
                        );
                        void initializedMeeting.leave();
                        isJoiningRef.current = false;
                        return;
                    }
                    console.log(
                        "[VideoRoom] handleJoinMeeting: Setting state to connected"
                    );
                    setError(null);
                    setRoomState("connected");
                    isJoiningRef.current = false;
                } else {
                    console.log(
                        "[VideoRoom] handleJoinMeeting: No meeting returned from initMeeting"
                    );
                    if (isMountedRef.current) {
                        setError("Failed to initialize meeting");
                        setRoomState("error");
                    }
                    isJoiningRef.current = false;
                }
            } catch (error_) {
                console.error(
                    "[VideoRoom] handleJoinMeeting: Error occurred:",
                    error_
                );
                joiningRef.current = null;
                isJoiningRef.current = false;
                if (!isMountedRef.current) {
                    console.log(
                        "[VideoRoom] handleJoinMeeting: Component unmounted, skipping error state update"
                    );
                    return;
                }
                const errorMessage =
                    error_ instanceof Error
                        ? error_.message
                        : "Failed to join meeting";
                console.error(
                    "[VideoRoom] handleJoinMeeting: Setting error state:",
                    errorMessage
                );
                setError(errorMessage);
                setRoomState("error");
            }
        },
        [participantName, generateTokenMutation, initMeeting]
    );

    const handleLeave = useCallback(() => {
        console.log(
            "[VideoRoom] handleLeave: Called, current meeting:",
            !!meeting
        );
        if (meeting) {
            console.log("[VideoRoom] handleLeave: Calling meeting.leave()...");
            void meeting.leave();
            setMeeting(null);
            console.log("[VideoRoom] handleLeave: Meeting cleared");
        }
        joiningRef.current = null;
        setRoomState("idle");
        setError(null);
        console.log("[VideoRoom] handleLeave: State reset to idle");
        if (onLeave) {
            console.log("[VideoRoom] handleLeave: Calling onLeave callback");
            onLeave();
        }
    }, [meeting, onLeave]);

    useEffect(() => {
        console.log("[VideoRoom] useEffect (auto-join): Checking conditions:", {
            meetingId,
            roomState,
            hasMeeting: !!meeting,
            joiningRef: joiningRef.current,
        });
        if (
            meetingId &&
            roomState === "idle" &&
            !meeting &&
            joiningRef.current !== meetingId
        ) {
            console.log(
                "[VideoRoom] useEffect (auto-join): Conditions met, joining meeting"
            );
            joiningRef.current = meetingId;
            void handleJoinMeeting(meetingId);
        } else {
            console.log(
                "[VideoRoom] useEffect (auto-join): Conditions not met, skipping join"
            );
        }
    }, [meetingId, roomState, meeting, handleJoinMeeting]);

    useEffect(() => {
        console.log(
            "[VideoRoom] useEffect (cleanup): Setting up cleanup handler"
        );
        isMountedRef.current = true;
        return (): void => {
            console.log(
                "[VideoRoom] useEffect (cleanup): Component unmounting, cleaning up resources"
            );
            isMountedRef.current = false;
            // Only clean up meeting resources, don't call handleLeave which navigates away
            if (meeting) {
                console.log(
                    "[VideoRoom] useEffect (cleanup): Leaving meeting on unmount"
                );
                void meeting.leave();
            }
            // Clear joining ref to prevent re-join attempts
            joiningRef.current = null;
        };
    }, [meeting]);

    console.log("[VideoRoom] Render: Current state check:", {
        roomState,
        showMeetingList,
        hasMeeting: !!meeting,
        error,
    });

    if (roomState === "idle" && showMeetingList) {
        console.log(
            "[VideoRoom] Render: Rendering idle state with meeting list"
        );
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
        console.log(
            "[VideoRoom] Render: Rendering idle state without meeting list"
        );
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
        console.log("[VideoRoom] Render: Rendering connecting state");
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
        console.log("[VideoRoom] Render: Rendering error state:", error);
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
                            console.log(
                                "[VideoRoom] Render: Go Back button clicked"
                            );
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
        console.log(
            "[VideoRoom] Render: Rendering connected state with RealtimeKitProvider"
        );
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

    console.log("[VideoRoom] Render: Rendering fallback loading state");
    return (
        <div className={styles["container"]}>
            <div className={styles["idleState"]}>
                <RtkSpinner className={styles["spinner"] ?? ""} />
                <p>Loading...</p>
            </div>
        </div>
    );
}

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
import { useIceServerTest } from "../../hooks/use-ice-server-test";
import styles from "./VideoRoom.module.css";

interface VideoRoomProps {
    readonly participantName?: string;
    readonly meetingId?: string;
    readonly showMeetingList?: boolean;
    readonly onLeave?: () => void;
}

function InMeetingRoom(): React.JSX.Element {
    console.warn("[VideoRoom] InMeetingRoom: Component rendering");
    const { meeting } = useRealtimeKitMeeting();
    console.warn("[VideoRoom] InMeetingRoom: Meeting object:", meeting);
    const activeParticipants = useRealtimeKitSelector((m) =>
        m.participants.active.toArray()
    );
    console.warn(
        "[VideoRoom] InMeetingRoom: Active participants:",
        activeParticipants
    );
    const pinnedParticipants = useRealtimeKitSelector((m) =>
        m.participants.pinned.toArray()
    );
    console.warn(
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
        console.warn(
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

interface MeetingContentProps {
    readonly onLeave?: (() => void) | undefined;
}

function MeetingContent({ onLeave }: MeetingContentProps): React.JSX.Element {
    console.warn("[VideoRoom] MeetingContent: Component rendering");
    const { meeting } = useRealtimeKitMeeting();
    const roomState = useRealtimeKitSelector((m) => m.self.roomState);
    const roomJoined = useRealtimeKitSelector((m) => m.self.roomJoined);
    const participantName = useRealtimeKitSelector((m) => m.self.name);
    const canEditDisplayName = useRealtimeKitSelector(
        (m) => m.self.permissions.canEditDisplayName
    );

    // Track roomState changes
    useEffect(() => {
        console.warn(
            "[VideoRoom] MeetingContent: roomState changed:",
            roomState,
            "roomJoined:",
            roomJoined,
            "participantName:",
            participantName
        );

        if (roomState === "init") {
            console.warn(
                "[VideoRoom] MeetingContent: Room state is 'init' - setup screen visible, waiting for join button click"
            );
        }

        if (roomState === "joined" && roomJoined) {
            console.warn(
                "[VideoRoom] MeetingContent: Successfully joined room!",
                {
                    roomState,
                    roomJoined,
                    participantName,
                    hasMeeting: !!meeting,
                }
            );
        }
    }, [roomState, roomJoined, participantName, meeting]);

    // Navigate away when leaving the meeting
    useEffect(() => {
        if ((roomState === "ended" || roomState === "left") && onLeave) {
            console.warn(
                "[VideoRoom] MeetingContent: Room ended/left, calling onLeave callback"
            );
            onLeave();
        }
    }, [roomState, onLeave]);

    // Track participant name changes
    useEffect(() => {
        if (participantName) {
            console.warn(
                "[VideoRoom] MeetingContent: Participant name set/changed:",
                participantName,
                "canEditDisplayName:",
                canEditDisplayName
            );
        }
    }, [participantName, canEditDisplayName]);

    console.warn("[VideoRoom] MeetingContent: Current state:", {
        roomState,
        roomJoined,
        participantName,
        canEditDisplayName,
        hasMeeting: !!meeting,
    });

    if (roomState === "ended" || roomState === "left") {
        console.warn("[VideoRoom] MeetingContent: Showing ended screen");
        return <RtkEndedScreen meeting={meeting} />;
    }

    if (roomState === "joined" && roomJoined) {
        console.warn("[VideoRoom] MeetingContent: Showing in-meeting room");
        return <InMeetingRoom />;
    }

    console.warn(
        "[VideoRoom] MeetingContent: Showing setup screen (waiting for join button click)"
    );
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
    console.warn("[VideoRoom] Component rendering with props:", {
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

    console.warn("[VideoRoom] Current state:", {
        roomState,
        error,
        hasMeeting: !!meeting,
        joiningRef: joiningRef.current,
    });

    const [, initMeeting] = useRealtimeKitClient();
    console.warn("[VideoRoom] initMeeting function available:", !!initMeeting);

    // Test ICE server connectivity on page load
    const iceTest = useIceServerTest();
    console.warn("[VideoRoom] ICE test result:", iceTest);

    const generateTokenMutation = useMutation({
        mutationFn: async (params: {
            meetingId: string;
            name?: string;
            presetName?: string;
        }) => {
            console.warn(
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
                console.warn(
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
            console.warn("[VideoRoom] handleJoinMeeting: Called with:", {
                targetMeetingId,
                presetName,
                participantName,
            });

            // Prevent concurrent calls
            if (isJoiningRef.current) {
                console.warn(
                    "[VideoRoom] handleJoinMeeting: Already joining, skipping duplicate call"
                );
                return;
            }

            isJoiningRef.current = true;
            try {
                console.warn(
                    "[VideoRoom] handleJoinMeeting: Setting state to connecting"
                );
                setRoomState("connecting");
                setError(null);

                console.warn(
                    "[VideoRoom] handleJoinMeeting: Requesting token..."
                );
                const tokenResponse = await generateTokenMutation.mutateAsync({
                    meetingId: targetMeetingId,
                    ...(participantName ? { name: participantName } : {}),
                    ...(presetName ? { presetName } : {}),
                });
                console.warn(
                    "[VideoRoom] handleJoinMeeting: Token received, initializing meeting..."
                );

                console.warn(
                    "[VideoRoom] handleJoinMeeting: Calling initMeeting with token...",
                    {
                        tokenLength: tokenResponse.auth_token?.length || 0,
                        hasToken: !!tokenResponse.auth_token,
                    }
                );
                const initStartTime = Date.now();
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
                const initDuration = Date.now() - initStartTime;
                console.warn(
                    "[VideoRoom] handleJoinMeeting: Meeting initialized:",
                    {
                        hasMeeting: !!initializedMeeting,
                        initDuration: `${String(initDuration)}ms`,
                        initialRoomState: initializedMeeting?.self.roomState,
                        initialName: initializedMeeting?.self.name,
                        canEditName:
                            initializedMeeting?.self.permissions
                                .canEditDisplayName,
                    }
                );

                if (initializedMeeting) {
                    console.warn(
                        "[VideoRoom] handleJoinMeeting: Setting meeting state and joining room..."
                    );
                    if (!isMountedRef.current) {
                        console.warn(
                            "[VideoRoom] handleJoinMeeting: Component unmounted, cleaning up meeting"
                        );
                        void initializedMeeting.leave();
                        isJoiningRef.current = false;
                        return;
                    }

                    // Set default name to "admin-kun" if none was provided and user has permission
                    console.warn(
                        "[VideoRoom] handleJoinMeeting: Checking participant name...",
                        {
                            currentName: initializedMeeting.self.name,
                            participantNameProp: participantName,
                            canEditDisplayName:
                                initializedMeeting.self.permissions
                                    .canEditDisplayName,
                        }
                    );
                    if (
                        initializedMeeting.self.permissions
                            .canEditDisplayName &&
                        !initializedMeeting.self.name
                    ) {
                        const nameToSet = participantName ?? "admin-kun";
                        console.warn(
                            "[VideoRoom] handleJoinMeeting: Setting participant name (no name currently set):",
                            nameToSet
                        );
                        initializedMeeting.self.setName(nameToSet);
                        console.warn(
                            "[VideoRoom] handleJoinMeeting: Name set, new name:",
                            initializedMeeting.self.name
                        );
                    } else if (
                        participantName &&
                        initializedMeeting.self.permissions
                            .canEditDisplayName &&
                        initializedMeeting.self.name !== participantName
                    ) {
                        console.warn(
                            "[VideoRoom] handleJoinMeeting: Updating participant name from prop:",
                            {
                                oldName: initializedMeeting.self.name,
                                newName: participantName,
                            }
                        );
                        initializedMeeting.self.setName(participantName);
                        console.warn(
                            "[VideoRoom] handleJoinMeeting: Name updated, current name:",
                            initializedMeeting.self.name
                        );
                    } else {
                        console.warn(
                            "[VideoRoom] handleJoinMeeting: No name change needed",
                            {
                                currentName: initializedMeeting.self.name,
                                participantNameProp: participantName,
                            }
                        );
                    }

                    setMeeting(initializedMeeting);
                    console.warn(
                        "[VideoRoom] handleJoinMeeting: Meeting set in state, about to call joinRoom()...",
                        {
                            currentName: initializedMeeting.self.name,
                            canEditName:
                                initializedMeeting.self.permissions
                                    .canEditDisplayName,
                            roomState: initializedMeeting.self.roomState,
                        }
                    );
                    console.warn(
                        "[VideoRoom] handleJoinMeeting: Calling joinRoom()..."
                    );
                    const joinStartTime = Date.now();
                    await initializedMeeting.joinRoom();
                    const joinDuration = Date.now() - joinStartTime;
                    console.warn(
                        "[VideoRoom] handleJoinMeeting: joinRoom() completed",
                        {
                            duration: `${String(joinDuration)}ms`,
                            newRoomState: initializedMeeting.self.roomState,
                            roomJoined: initializedMeeting.self.roomJoined,
                        }
                    );
                    if (!isMountedRef.current) {
                        console.warn(
                            "[VideoRoom] handleJoinMeeting: Component unmounted after joinRoom, cleaning up"
                        );
                        void initializedMeeting.leave();
                        isJoiningRef.current = false;
                        return;
                    }
                    console.warn(
                        "[VideoRoom] handleJoinMeeting: Setting state to connected"
                    );
                    setError(null);
                    setRoomState("connected");
                    isJoiningRef.current = false;
                } else {
                    console.warn(
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
                    console.warn(
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
        console.warn(
            "[VideoRoom] handleLeave: Called, current meeting:",
            !!meeting
        );
        if (meeting) {
            console.warn("[VideoRoom] handleLeave: Calling meeting.leave()...");
            void meeting.leave();
            setMeeting(null);
            console.warn("[VideoRoom] handleLeave: Meeting cleared");
        }
        joiningRef.current = null;
        setRoomState("idle");
        setError(null);
        console.warn("[VideoRoom] handleLeave: State reset to idle");
        if (onLeave) {
            console.warn("[VideoRoom] handleLeave: Calling onLeave callback");
            onLeave();
        }
    }, [meeting, onLeave]);

    useEffect(() => {
        console.warn("[VideoRoom] useEffect (auto-join): Checking conditions:", {
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
            console.warn(
                "[VideoRoom] useEffect (auto-join): Conditions met, joining meeting"
            );
            joiningRef.current = meetingId;
            void handleJoinMeeting(meetingId);
        } else {
            console.warn(
                "[VideoRoom] useEffect (auto-join): Conditions not met, skipping join"
            );
        }
    }, [meetingId, roomState, meeting, handleJoinMeeting]);

    useEffect(() => {
        console.warn(
            "[VideoRoom] useEffect (cleanup): Setting up cleanup handler"
        );
        isMountedRef.current = true;
        return (): void => {
            console.warn(
                "[VideoRoom] useEffect (cleanup): Component unmounting, cleaning up resources"
            );
            isMountedRef.current = false;
            // Only clean up meeting resources, don't call handleLeave which navigates away
            if (meeting) {
                console.warn(
                    "[VideoRoom] useEffect (cleanup): Leaving meeting on unmount"
                );
                void meeting.leave();
            }
            // Clear joining ref to prevent re-join attempts
            joiningRef.current = null;
        };
    }, [meeting]);

    console.warn("[VideoRoom] Render: Current state check:", {
        roomState,
        showMeetingList,
        hasMeeting: !!meeting,
        error,
    });

    if (roomState === "idle" && showMeetingList) {
        console.warn(
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
        console.warn(
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
        console.warn("[VideoRoom] Render: Rendering connecting state");
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
        console.warn("[VideoRoom] Render: Rendering error state:", error);
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
                            console.warn(
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
        console.warn(
            "[VideoRoom] Render: Rendering connected state with RealtimeKitProvider",
            {
                meetingRoomState: meeting.self.roomState,
                meetingRoomJoined: meeting.self.roomJoined,
                participantName: meeting.self.name,
            }
        );
        console.warn(
            "[VideoRoom] Render: Setup screen is now available - join button should be visible"
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
                    <MeetingContent onLeave={onLeave} />
                </RtkUiProvider>
            </RealtimeKitProvider>
        );
    }

    console.warn("[VideoRoom] Render: Rendering fallback loading state");
    return (
        <div className={styles["container"]}>
            <div className={styles["idleState"]}>
                <RtkSpinner className={styles["spinner"] ?? ""} />
                <p>Loading...</p>
            </div>
        </div>
    );
}

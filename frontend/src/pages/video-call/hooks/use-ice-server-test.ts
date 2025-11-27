import { useState, useEffect, useCallback, useRef } from "react";

export type IceTestStatus =
    | "pending"
    | "testing"
    | "success"
    | "warning"
    | "failed";

export interface IceTestResult {
    status: IceTestStatus;
    hasStun: boolean;
    hasTurn: boolean;
    candidateTypes: string[];
    error: string | null;
    isFirefox: boolean;
}

const ICE_TEST_TIMEOUT_MS = 10_000;

// Public STUN servers for basic connectivity test
const TEST_ICE_SERVERS: RTCIceServer[] = [
    { urls: "stun:stun.cloudflare.com:3478" },
    { urls: "stun:stun.l.google.com:19302" },
];

/**
 * Hook to test ICE server connectivity on page load.
 * This helps diagnose WebRTC connection issues before users attempt to join a meeting.
 */
export function useIceServerTest(): IceTestResult & { retest: () => void } {
    console.warn("[useIceServerTest] Hook initializing");
    const isFirefox =
        typeof navigator !== "undefined" &&
        navigator.userAgent.toLowerCase().includes("firefox");
    console.warn("[useIceServerTest] Browser detection:", {
        isFirefox,
        userAgent:
            typeof navigator === "undefined" ? "N/A" : navigator.userAgent,
    });

    const [result, setResult] = useState<IceTestResult>({
        status: "pending",
        hasStun: false,
        hasTurn: false,
        candidateTypes: [],
        error: null,
        isFirefox,
    });
    console.warn("[useIceServerTest] Initial state:", result);
    
    const isRunningRef = useRef(false);

    const runTest = useCallback(async () => {
        // Prevent multiple simultaneous tests
        if (isRunningRef.current) {
            console.warn(
                "[useIceServerTest] runTest: Test already running, skipping"
            );
            return;
        }
        
        console.warn("[useIceServerTest] runTest: Starting ICE test");
        isRunningRef.current = true;
        setResult({
            status: "testing",
            hasStun: false,
            hasTurn: false,
            candidateTypes: [],
            error: null,
            isFirefox,
        });

        const candidateTypes = new Set<string>();
        let hasStun = false;
        let hasTurn = false;

        let pc: RTCPeerConnection | null = null;
        let mediaStream: MediaStream | null = null;

        try {
            // Request media permission first - Firefox requires this to unlock
            // network interfaces for proper ICE candidate gathering
            console.warn(
                "[useIceServerTest] runTest: Requesting media permissions..."
            );
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                console.warn(
                    "[useIceServerTest] runTest: Media permission granted"
                );
            } catch (error) {
                // If permission denied, continue anyway - test may still partially work
                console.warn(
                    "[useIceServerTest] runTest: Media permission denied, ICE test may be limited:",
                    error
                );
            }

            console.warn(
                "[useIceServerTest] runTest: Creating RTCPeerConnection with servers:",
                TEST_ICE_SERVERS
            );
            pc = new RTCPeerConnection({
                iceServers: TEST_ICE_SERVERS,
            });

            // Create a data channel to trigger ICE gathering
            console.warn("[useIceServerTest] runTest: Creating data channel");
            pc.createDataChannel("ice-test");

            // Capture pc in a const for use in callbacks
            const peerConnection = pc;

            const gatheringComplete = new Promise<void>((resolve, reject) => {
                console.warn(
                    "[useIceServerTest] runTest: Setting up gathering promise with timeout:",
                    ICE_TEST_TIMEOUT_MS
                );
                const timeout = setTimeout(() => {
                    console.warn(
                        "[useIceServerTest] runTest: Timeout reached, candidateTypes:",
                        [...candidateTypes]
                    );
                    // If we gathered some candidates, consider it a partial success
                    if (candidateTypes.size > 0) {
                        console.warn(
                            "[useIceServerTest] runTest: Timeout but has candidates, resolving"
                        );
                        resolve();
                    } else {
                        console.error(
                            "[useIceServerTest] runTest: Timeout with no candidates, rejecting"
                        );
                        reject(
                            new Error(
                                "ICE gathering timed out with no candidates"
                            )
                        );
                    }
                }, ICE_TEST_TIMEOUT_MS);

                peerConnection.onicecandidate = (event): void => {
                    if (event.candidate) {
                        const candidate = event.candidate;
                        console.warn(
                            "[useIceServerTest] runTest: ICE candidate received:",
                            {
                                type: candidate.type,
                                protocol: candidate.protocol,
                                address: candidate.address,
                            }
                        );
                        if (candidate.type) {
                            candidateTypes.add(candidate.type);
                        }

                        // Check candidate types
                        if (candidate.type === "srflx") {
                            hasStun = true;
                            console.warn(
                                "[useIceServerTest] runTest: STUN candidate detected"
                            );
                        }
                        if (candidate.type === "relay") {
                            hasTurn = true;
                            console.warn(
                                "[useIceServerTest] runTest: TURN candidate detected"
                            );
                        }
                    } else {
                        // ICE gathering complete (null candidate)
                        console.warn(
                            "[useIceServerTest] runTest: ICE gathering complete (null candidate)"
                        );
                        clearTimeout(timeout);
                        resolve();
                    }
                };

                peerConnection.onicegatheringstatechange = (): void => {
                    console.warn(
                        "[useIceServerTest] runTest: ICE gathering state changed:",
                        peerConnection.iceGatheringState
                    );
                    if (peerConnection.iceGatheringState === "complete") {
                        console.warn(
                            "[useIceServerTest] runTest: ICE gathering state is complete"
                        );
                        clearTimeout(timeout);
                        resolve();
                    }
                };

                // Handle connection failures
                peerConnection.oniceconnectionstatechange = (): void => {
                    console.warn(
                        "[useIceServerTest] runTest: ICE connection state changed:",
                        peerConnection.iceConnectionState
                    );
                    if (peerConnection.iceConnectionState === "failed") {
                        console.error(
                            "[useIceServerTest] runTest: ICE connection failed"
                        );
                        clearTimeout(timeout);
                        reject(new Error("ICE connection failed"));
                    }
                };
            });

            // Create and set local description to start ICE gathering
            console.warn("[useIceServerTest] runTest: Creating offer...");
            const offer = await pc.createOffer();
            console.warn(
                "[useIceServerTest] runTest: Offer created, setting local description..."
            );
            await pc.setLocalDescription(offer);
            console.warn(
                "[useIceServerTest] runTest: Local description set, waiting for gathering..."
            );

            // Wait for gathering to complete
            console.warn(
                "[useIceServerTest] runTest: Waiting for gathering to complete..."
            );
            await gatheringComplete;
            console.warn("[useIceServerTest] runTest: Gathering complete");

            // We expect at least host candidates, and ideally srflx (STUN) candidates
            const hasHostCandidates = candidateTypes.has("host");
            console.warn(
                "[useIceServerTest] runTest: Final candidate analysis:",
                {
                    hasHostCandidates,
                    hasStun,
                    hasTurn,
                    candidateTypes: [...candidateTypes],
                }
            );

            // Firefox is stricter about TURN - warn if no STUN on Firefox
            if (hasHostCandidates || hasStun) {
                // On Firefox without STUN, this may still fail in the actual call
                const firefoxWarning = isFirefox && !hasStun;
                console.warn(
                    "[useIceServerTest] runTest: Test success (with possible Firefox warning):",
                    firefoxWarning
                );
                setResult({
                    status: firefoxWarning ? "warning" : "success",
                    hasStun,
                    hasTurn,
                    candidateTypes: [...candidateTypes],
                    error: firefoxWarning
                        ? "Firefox may require TURN servers for video calls on this network"
                        : null,
                    isFirefox,
                });
            } else {
                console.error(
                    "[useIceServerTest] runTest: Test failed - no viable candidates"
                );
                setResult({
                    status: "failed",
                    hasStun,
                    hasTurn,
                    candidateTypes: [...candidateTypes],
                    error: "No viable ICE candidates found. WebRTC may not work on this network.",
                    isFirefox,
                });
            }
        } catch (error) {
            console.error("[useIceServerTest] runTest: Test error:", error);
            setResult({
                status: "failed",
                hasStun,
                hasTurn,
                candidateTypes: [...candidateTypes],
                error:
                    error instanceof Error ? error.message : "ICE test failed",
                isFirefox,
            });
        } finally {
            // Always clean up the peer connection
            console.warn("[useIceServerTest] runTest: Cleaning up...");
            if (pc) {
                console.warn(
                    "[useIceServerTest] runTest: Closing peer connection"
                );
                pc.close();
            }
            // Stop all media tracks
            if (mediaStream) {
                console.warn(
                    "[useIceServerTest] runTest: Stopping media tracks"
                );
                for (const track of mediaStream.getTracks()) track.stop();
            }
            console.warn("[useIceServerTest] runTest: Cleanup complete");
            isRunningRef.current = false;
        }
    }, [isFirefox]);

    useEffect(() => {
        console.warn("[useIceServerTest] useEffect: Running initial test");
        void runTest();
        // Cleanup: mark as not running when component unmounts
        return (): void => {
            isRunningRef.current = false;
        };
    }, [runTest]);

    console.warn("[useIceServerTest] Hook returning result:", result);
    return {
        ...result,
        retest: (): void => {
            console.warn("[useIceServerTest] retest: Manual retest triggered");
            void runTest();
        },
    };
}

import { useState, useEffect, useCallback } from "react";

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

const ICE_TEST_TIMEOUT_MS = 10000;

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
    const isFirefox =
        typeof navigator !== "undefined" &&
        navigator.userAgent.toLowerCase().includes("firefox");

    const [result, setResult] = useState<IceTestResult>({
        status: "pending",
        hasStun: false,
        hasTurn: false,
        candidateTypes: [],
        error: null,
        isFirefox,
    });

    const runTest = useCallback(async () => {
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
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
            } catch {
                // If permission denied, continue anyway - test may still partially work
                console.warn(
                    "Media permission denied, ICE test may be limited"
                );
            }

            pc = new RTCPeerConnection({
                iceServers: TEST_ICE_SERVERS,
            });

            // Create a data channel to trigger ICE gathering
            pc.createDataChannel("ice-test");

            // Capture pc in a const for use in callbacks
            const peerConnection = pc;

            const gatheringComplete = new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    // If we gathered some candidates, consider it a partial success
                    if (candidateTypes.size > 0) {
                        resolve();
                    } else {
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
                        if (candidate.type) {
                            candidateTypes.add(candidate.type);
                        }

                        // Check candidate types
                        if (candidate.type === "srflx") {
                            hasStun = true;
                        }
                        if (candidate.type === "relay") {
                            hasTurn = true;
                        }
                    } else {
                        // ICE gathering complete (null candidate)
                        clearTimeout(timeout);
                        resolve();
                    }
                };

                peerConnection.onicegatheringstatechange = (): void => {
                    if (peerConnection.iceGatheringState === "complete") {
                        clearTimeout(timeout);
                        resolve();
                    }
                };

                // Handle connection failures
                peerConnection.oniceconnectionstatechange = (): void => {
                    if (peerConnection.iceConnectionState === "failed") {
                        clearTimeout(timeout);
                        reject(new Error("ICE connection failed"));
                    }
                };
            });

            // Create and set local description to start ICE gathering
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Wait for gathering to complete
            await gatheringComplete;

            // We expect at least host candidates, and ideally srflx (STUN) candidates
            const hasHostCandidates = candidateTypes.has("host");

            // Firefox is stricter about TURN - warn if no STUN on Firefox
            if (hasHostCandidates || hasStun) {
                // On Firefox without STUN, this may still fail in the actual call
                const firefoxWarning = isFirefox && !hasStun;
                setResult({
                    status: firefoxWarning ? "warning" : "success",
                    hasStun,
                    hasTurn,
                    candidateTypes: Array.from(candidateTypes),
                    error: firefoxWarning
                        ? "Firefox may require TURN servers for video calls on this network"
                        : null,
                    isFirefox,
                });
            } else {
                setResult({
                    status: "failed",
                    hasStun,
                    hasTurn,
                    candidateTypes: Array.from(candidateTypes),
                    error: "No viable ICE candidates found. WebRTC may not work on this network.",
                    isFirefox,
                });
            }
        } catch (error) {
            setResult({
                status: "failed",
                hasStun,
                hasTurn,
                candidateTypes: Array.from(candidateTypes),
                error:
                    error instanceof Error ? error.message : "ICE test failed",
                isFirefox,
            });
        } finally {
            // Always clean up the peer connection
            if (pc) {
                pc.close();
            }
            // Stop all media tracks
            if (mediaStream) {
                mediaStream.getTracks().forEach((track) => track.stop());
            }
        }
    }, [isFirefox]);

    useEffect(() => {
        void runTest();
    }, [runTest]);

    return {
        ...result,
        retest: runTest,
    };
}

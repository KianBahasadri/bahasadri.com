import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    RtkMeeting,
    RtkSpinner,
    RtkDialogManager,
} from "@cloudflare/realtimekit-react-ui";
import {
    useRealtimeKitClient,
    RealtimeKitProvider,
} from "@cloudflare/realtimekit-react";
import { generateToken } from "../../lib/api";
import styles from "./VideoCall.module.css";

export default function VideoCallBasic(): React.JSX.Element {
    const { meetingId } = useParams<{ meetingId: string }>();
    const navigate = useNavigate();
    const [meeting, initMeeting] = useRealtimeKitClient();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!meetingId) {
            navigate("/video-call");
            return;
        }

        if (initializedRef.current) {
            return;
        }
        initializedRef.current = true;

        const initializeMeeting = async (): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);

                const tokenResponse = await generateToken(meetingId);

                if (!tokenResponse.auth_token) {
                    throw new Error("No auth token received");
                }

                // Setting audio/video to true makes the SDK request media permissions
                // during initialization, BEFORE establishing WebRTC connections.
                // This is critical for Firefox which blocks ICE candidate gathering
                // until media permissions are granted (privacy feature to prevent IP leakage).
                await initMeeting({
                    authToken: tokenResponse.auth_token,
                    defaults: {
                        audio: true,
                        video: true,
                    },
                });

                setIsLoading(false);
            } catch (err) {
                console.error("Failed to initialize meeting:", err);
                setError(err instanceof Error ? err.message : "Failed to join meeting");
                setIsLoading(false);
            }
        };

        initializeMeeting().catch(() => {
            // Error already handled in try-catch
        });
    }, [meetingId, initMeeting, navigate]);

    if (isLoading) {
        return (
            <div className={styles["page"]}>
                <div className={styles["loadingContainer"]}>
                    <RtkSpinner />
                    <p>Joining meeting...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles["page"]}>
                <div className={styles["errorContainer"]}>
                    <h2>Failed to join meeting</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate("/video-call")}>Go Back</button>
                </div>
            </div>
        );
    }

    if (!meeting) {
        return (
            <div className={styles["page"]}>
                <div className={styles["loadingContainer"]}>
                    <RtkSpinner />
                    <p>Initializing...</p>
                </div>
            </div>
        );
    }

    return (
        <RealtimeKitProvider value={meeting}>
            <RtkDialogManager meeting={meeting} />
            <RtkMeeting meeting={meeting} />
        </RealtimeKitProvider>
    );
}

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoRoom from "./components/VideoRoom/VideoRoom";
import NetworkMesh from "./components/NetworkMesh/NetworkMesh";
import styles from "./VideoCall.module.css";

export default function VideoCallRoom(): React.JSX.Element {
    const { meetingId } = useParams<{ meetingId: string }>();
    const navigate = useNavigate();

    const handleLeave = (): void => {
        navigate("/video-call");
    };

    if (!meetingId) {
        navigate("/video-call");
        return <></>;
    }

    return (
        <div className={styles["page"]}>
            <NetworkMesh />
            <VideoRoom meetingId={meetingId} onLeave={handleLeave} />
        </div>
    );
}


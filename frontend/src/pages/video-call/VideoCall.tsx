import React from "react";
import VideoRoom from "./components/VideoRoom/VideoRoom";
import NetworkMesh from "./components/NetworkMesh/NetworkMesh";
import styles from "./VideoCall.module.css";

export default function VideoCall(): React.JSX.Element {
    return (
        <div className={styles["page"]}>
            <NetworkMesh />
            <VideoRoom />
        </div>
    );
}


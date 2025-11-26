import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMovieStream } from "../../lib/api";
import styles from "./MoviePlayer.module.css";

const queryKeys = {
    stream: (movieId: number) => ["movies-on-demand", "stream", movieId] as const,
};

export default function MoviePlayer(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const movieId = id ? parseInt(id, 10) : 0;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data: streamData, isLoading } = useQuery({
        queryKey: queryKeys.stream(movieId),
        queryFn: async () => await getMovieStream(movieId),
        enabled: movieId > 0,
    });

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        const handleDurationChange = () => {
            setDuration(video.duration);
        };

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        const handleVolumeChange = () => {
            setVolume(video.volume);
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("durationchange", handleDurationChange);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("volumechange", handleVolumeChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("durationchange", handleDurationChange);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("volumechange", handleVolumeChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        if (showControls) {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }

        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [showControls]);

    const handlePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newTime = parseFloat(e.target.value);
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
    };

    const handleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;

        if (!document.fullscreenElement) {
            video.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
    };

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return "0:00";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    if (isLoading) {
        return (
            <div className={styles["container"]}>
                <div className={styles["loading"]}>Loading stream...</div>
            </div>
        );
    }

    if (!streamData) {
        return (
            <div className={styles["container"]}>
                <div className={styles["error"]}>
                    Failed to load stream. The movie may not be ready yet.
                </div>
                <button
                    className={styles["backButton"]}
                    onClick={() => {
                        navigate(`/movies-on-demand/movies/${movieId}`);
                    }}
                >
                    Back to Movie Details
                </button>
            </div>
        );
    }

    return (
        <div
            className={styles["container"]}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                setShowControls(false);
            }}
        >
            <video
                ref={videoRef}
                src={streamData.stream_url}
                className={styles["video"]}
                preload="metadata"
                onClick={handlePlayPause}
            />
            {showControls && (
                <div className={styles["controls"]}>
                    <div className={styles["controlsTop"]}>
                        <button
                            className={styles["backButton"]}
                            onClick={() => {
                                navigate(`/movies-on-demand/movies/${movieId}`);
                            }}
                        >
                            ← Back
                        </button>
                    </div>
                    <div className={styles["progressContainer"]}>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className={styles["progressBar"]}
                            aria-label="Seek"
                        />
                        <div className={styles["timeDisplay"]}>
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                    <div className={styles["controlsBottom"]}>
                        <button
                            className={styles["controlButton"]}
                            onClick={handlePlayPause}
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? "⏸" : "▶"}
                        </button>
                        <div className={styles["volumeContainer"]}>
                            <span>🔊</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className={styles["volumeBar"]}
                                aria-label="Volume"
                            />
                        </div>
                        <button
                            className={styles["controlButton"]}
                            onClick={handleFullscreen}
                            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                            {isFullscreen ? "⤓" : "⤢"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


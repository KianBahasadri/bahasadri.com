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
    const movieId = id ? Number.parseInt(id, 10) : 0;

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

        const handleTimeUpdate = (): void => {
            setCurrentTime(video.currentTime);
        };

        const handleDurationChange = (): void => {
            setDuration(video.duration);
        };

        const handlePlay = (): void => {
            setIsPlaying(true);
        };

        const handlePause = (): void => {
            setIsPlaying(false);
        };

        const handleVolumeChange = (): void => {
            setVolume(video.volume);
        };

        const handleFullscreenChange = (): void => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("durationchange", handleDurationChange);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("volumechange", handleVolumeChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return (): void => {
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

        return (): void => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [showControls]);

    const handlePlayPause = (): void => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(() => {
                // Ignore play errors
            });
        } else {
            video.pause();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const video = videoRef.current;
        if (!video) return;

        const newTime = Number.parseFloat(e.target.value);
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = Number.parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
    };

    const handleFullscreen = (): void => {
        const video = videoRef.current;
        if (!video) return;

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {
                // Ignore fullscreen errors
            });
        } else {
            video.requestFullscreen().catch(() => {
                // Ignore fullscreen errors
            });
        }
    };

    const handleMouseMove = (): void => {
        setShowControls(true);
    };

    const formatTime = (seconds: number): string => {
        if (Number.isNaN(seconds)) return "0:00";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${String(hours)}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${String(minutes)}:${secs.toString().padStart(2, "0")}`;
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
                        const result = navigate(`/movies-on-demand/movies/${String(movieId)}`);
                        if (result instanceof Promise) {
                            result.catch(() => {
                                // Navigation errors are handled by React Router
                            });
                        }
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
            >
                <track kind="captions" />
            </video>
            {showControls ? (
                <div className={styles["controls"]}>
                    <div className={styles["controlsTop"]}>
                        <button
                            className={styles["backButton"]}
                            onClick={() => {
                                const result = navigate(`/movies-on-demand/movies/${String(movieId)}`);
                                if (result instanceof Promise) {
                                    result.catch(() => {
                                        // Navigation errors are handled by React Router
                                    });
                                }
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
            ) : null}
        </div>
    );
}


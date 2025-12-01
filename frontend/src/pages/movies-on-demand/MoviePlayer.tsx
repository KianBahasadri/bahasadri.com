import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMovieStream, getMovieDetails } from "../../lib/api";
import { getImageUrl } from "../../lib/tmdb";
import styles from "./MoviePlayer.module.css";

const queryKeys = {
    stream: (movieId: number) =>
        ["movies-on-demand", "stream", movieId] as const,
    details: (movieId: number) =>
        ["movies-on-demand", "details", movieId] as const,
};

export default function MoviePlayer(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const movieId = id ? Number.parseInt(id, 10) : 0;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showPlaybackMenu, setShowPlaybackMenu] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        data: streamData,
        isLoading,
        error,
    } = useQuery({
        queryKey: queryKeys.stream(movieId),
        queryFn: async () => await getMovieStream(movieId),
        enabled: movieId > 0,
        retry: 1,
    });

    const { data: movieDetails } = useQuery({
        queryKey: queryKeys.details(movieId),
        queryFn: async () => await getMovieDetails(movieId),
        enabled: movieId > 0,
    });

    // Reset controls timeout
    const resetControlsTimeout = useCallback((): void => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        setShowControls(true);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
                setShowPlaybackMenu(false);
            }, 3000);
        }
    }, [isPlaying]);

    // Video event handlers
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = (): void => {
            if (!isSeeking) {
                setCurrentTime(video.currentTime);
            }
        };

        const handleDurationChange = (): void => {
            setDuration(video.duration);
        };

        const handleProgress = (): void => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(
                    video.buffered.length - 1
                );
                setBuffered(bufferedEnd);
            }
        };

        const handleLoadedData = (): void => {
            setIsLoaded(true);
            setDuration(video.duration);
        };

        const handlePlay = (): void => {
            setIsPlaying(true);
            setIsLoaded(true);
        };

        const handlePause = (): void => {
            setIsPlaying(false);
        };

        const handleVolumeChange = (): void => {
            setVolume(video.volume);
            setIsMuted(video.muted);
        };

        const handleFullscreenChange = (): void => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleEnded = (): void => {
            setIsPlaying(false);
            setShowControls(true);
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("durationchange", handleDurationChange);
        video.addEventListener("progress", handleProgress);
        video.addEventListener("loadeddata", handleLoadedData);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("volumechange", handleVolumeChange);
        video.addEventListener("ended", handleEnded);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return (): void => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("durationchange", handleDurationChange);
            video.removeEventListener("progress", handleProgress);
            video.removeEventListener("loadeddata", handleLoadedData);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("volumechange", handleVolumeChange);
            video.removeEventListener("ended", handleEnded);
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, [isSeeking]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.target instanceof HTMLInputElement) return;

            const video = videoRef.current;
            if (!video) return;

            switch (e.key) {
                case " ":
                case "k":
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    resetControlsTimeout();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    video.currentTime = Math.min(
                        duration,
                        video.currentTime + 10
                    );
                    resetControlsTimeout();
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    video.volume = Math.min(1, video.volume + 0.1);
                    resetControlsTimeout();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    video.volume = Math.max(0, video.volume - 0.1);
                    resetControlsTimeout();
                    break;
                case "m":
                    e.preventDefault();
                    video.muted = !video.muted;
                    resetControlsTimeout();
                    break;
                case "f":
                    e.preventDefault();
                    handleFullscreen();
                    break;
                case "Escape":
                    if (isFullscreen) {
                        document.exitFullscreen().catch(() => {});
                    }
                    break;
                case "j":
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    resetControlsTimeout();
                    break;
                case "l":
                    e.preventDefault();
                    video.currentTime = Math.min(
                        duration,
                        video.currentTime + 10
                    );
                    resetControlsTimeout();
                    break;
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    e.preventDefault();
                    video.currentTime =
                        (Number.parseInt(e.key, 10) / 10) * duration;
                    resetControlsTimeout();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return (): void => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [duration, isFullscreen, resetControlsTimeout]);

    // Auto-hide controls
    useEffect(() => {
        return (): void => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    const handlePlayPause = (): void => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
        resetControlsTimeout();
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        const video = videoRef.current;
        const progress = progressRef.current;
        if (!video || !progress) return;

        const rect = progress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleProgressMouseDown = (): void => {
        setIsSeeking(true);
    };

    const handleProgressMouseUp = (): void => {
        setIsSeeking(false);
    };

    const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        const video = videoRef.current;
        if (!video) return;

        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.volume = Math.max(0, Math.min(1, percent));
        video.muted = false;
    };

    const handleMuteToggle = (): void => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
    };

    const handleFullscreen = (): void => {
        const container = containerRef.current;
        if (!container) return;

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        } else {
            container.requestFullscreen().catch(() => {});
        }
    };

    const handleMouseMove = (): void => {
        resetControlsTimeout();
    };

    const handleMouseLeave = (): void => {
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
                setShowPlaybackMenu(false);
            }, 1000);
        }
    };

    const handleSkipBack = (): void => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, video.currentTime - 10);
        resetControlsTimeout();
    };

    const handleSkipForward = (): void => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.min(duration, video.currentTime + 10);
        resetControlsTimeout();
    };

    const handlePlaybackRateChange = (rate: number): void => {
        const video = videoRef.current;
        if (!video) return;
        video.playbackRate = rate;
        setPlaybackRate(rate);
        setShowPlaybackMenu(false);
    };

    const handleVolumeAreaEnter = (): void => {
        if (volumeTimeoutRef.current) {
            clearTimeout(volumeTimeoutRef.current);
        }
        setShowVolumeSlider(true);
    };

    const handleVolumeAreaLeave = (): void => {
        volumeTimeoutRef.current = setTimeout(() => {
            setShowVolumeSlider(false);
        }, 300);
    };

    const formatTime = (seconds: number): string => {
        if (Number.isNaN(seconds) || !Number.isFinite(seconds)) return "0:00";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${String(hours)}:${minutes
                .toString()
                .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${String(minutes)}:${secs.toString().padStart(2, "0")}`;
    };

    const getVolumeIcon = (): string => {
        if (isMuted || volume === 0) return "🔇";
        if (volume < 0.3) return "🔈";
        if (volume < 0.7) return "🔉";
        return "🔊";
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

    const navigateBack = (): void => {
        const result = navigate(`/movies-on-demand/movies/${String(movieId)}`);
        if (result instanceof Promise) {
            result.catch(() => {});
        }
    };

    if (isLoading) {
        return (
            <div className={styles["container"]}>
                <div className={styles["loadingOverlay"]}>
                    <div className={styles["spinner"]} />
                    <span>Loading stream...</span>
                </div>
            </div>
        );
    }

    if (error || !streamData) {
        return (
            <div className={styles["container"]}>
                <div className={styles["errorOverlay"]}>
                    <div className={styles["errorIcon"]}>⚠️</div>
                    <h2>Unable to Load Stream</h2>
                    <p>
                        The movie may still be downloading or is not available
                        yet.
                    </p>
                    <button
                        className={styles["errorButton"]}
                        onClick={navigateBack}
                    >
                        ← Back to Movie Details
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`${styles["container"]} ${
                showControls ? "" : styles["hideCursor"]
            }`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={streamData.stream_url}
                className={styles["video"]}
                preload="metadata"
                onClick={handlePlayPause}
                onDoubleClick={handleFullscreen}
            >
                <track kind="captions" />
            </video>

            {/* Center Play Button Overlay */}
            {!isPlaying && isLoaded && (
                <button
                    className={styles["centerPlayButton"]}
                    onClick={handlePlayPause}
                    aria-label="Play"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            )}

            {/* Loading Spinner when buffering */}
            {!isLoaded && streamData && (
                <div className={styles["bufferingOverlay"]}>
                    <div className={styles["spinner"]} />
                </div>
            )}

            {/* Controls Overlay */}
            <div
                className={`${styles["controlsWrapper"]} ${
                    showControls ? styles["visible"] : ""
                }`}
            >
                {/* Top Bar */}
                <div className={styles["topBar"]}>
                    <button
                        className={styles["backButton"]}
                        onClick={navigateBack}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="24"
                            height="24"
                        >
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                        <span>Back</span>
                    </button>
                    {movieDetails && (
                        <div className={styles["movieInfo"]}>
                            <span className={styles["movieTitle"]}>
                                {movieDetails.title}
                            </span>
                            {movieDetails.release_date && (
                                <span className={styles["movieYear"]}>
                                    ({movieDetails.release_date.slice(0, 4)})
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className={styles["bottomControls"]}>
                    {/* Progress Bar */}
                    <div
                        ref={progressRef}
                        className={styles["progressContainer"]}
                        onClick={handleProgressClick}
                        onMouseDown={handleProgressMouseDown}
                        onMouseUp={handleProgressMouseUp}
                    >
                        <div className={styles["progressTrack"]}>
                            <div
                                className={styles["progressBuffered"]}
                                style={{ width: `${String(bufferedPercent)}%` }}
                            />
                            <div
                                className={styles["progressFilled"]}
                                style={{ width: `${String(progressPercent)}%` }}
                            />
                            <div
                                className={styles["progressThumb"]}
                                style={{ left: `${String(progressPercent)}%` }}
                            />
                        </div>
                    </div>

                    {/* Control Buttons Row */}
                    <div className={styles["controlsRow"]}>
                        {/* Left Controls */}
                        <div className={styles["leftControls"]}>
                            <button
                                className={styles["controlButton"]}
                                onClick={handlePlayPause}
                                aria-label={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                ) : (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            <button
                                className={styles["controlButton"]}
                                onClick={handleSkipBack}
                                aria-label="Skip back 10 seconds"
                                title="Skip back 10s (J)"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                    <text
                                        x="12"
                                        y="15"
                                        fontSize="6"
                                        textAnchor="middle"
                                        fill="currentColor"
                                    >
                                        10
                                    </text>
                                </svg>
                            </button>

                            <button
                                className={styles["controlButton"]}
                                onClick={handleSkipForward}
                                aria-label="Skip forward 10 seconds"
                                title="Skip forward 10s (L)"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                                    <text
                                        x="12"
                                        y="15"
                                        fontSize="6"
                                        textAnchor="middle"
                                        fill="currentColor"
                                    >
                                        10
                                    </text>
                                </svg>
                            </button>

                            <div
                                className={styles["volumeArea"]}
                                onMouseEnter={handleVolumeAreaEnter}
                                onMouseLeave={handleVolumeAreaLeave}
                            >
                                <button
                                    className={styles["controlButton"]}
                                    onClick={handleMuteToggle}
                                    aria-label={isMuted ? "Unmute" : "Mute"}
                                    title="Mute (M)"
                                >
                                    <span className={styles["volumeIcon"]}>
                                        {getVolumeIcon()}
                                    </span>
                                </button>
                                <div
                                    className={`${styles["volumeSlider"]} ${
                                        showVolumeSlider
                                            ? styles["visible"]
                                            : ""
                                    }`}
                                >
                                    <div
                                        className={styles["volumeTrack"]}
                                        onClick={handleVolumeClick}
                                    >
                                        <div
                                            className={styles["volumeFilled"]}
                                            style={{
                                                width: `${String(
                                                    isMuted ? 0 : volume * 100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <span className={styles["timeDisplay"]}>
                                {formatTime(currentTime)} /{" "}
                                {formatTime(duration)}
                            </span>
                        </div>

                        {/* Right Controls */}
                        <div className={styles["rightControls"]}>
                            <div className={styles["playbackRateContainer"]}>
                                <button
                                    className={styles["controlButton"]}
                                    onClick={() => {
                                        setShowPlaybackMenu(!showPlaybackMenu);
                                    }}
                                    aria-label="Playback speed"
                                    title="Playback speed"
                                >
                                    <span
                                        className={styles["playbackRateText"]}
                                    >
                                        {playbackRate}x
                                    </span>
                                </button>
                                {showPlaybackMenu && (
                                    <div className={styles["playbackMenu"]}>
                                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(
                                            (rate) => (
                                                <button
                                                    key={rate}
                                                    className={`${
                                                        styles["playbackOption"]
                                                    } ${
                                                        playbackRate === rate
                                                            ? styles["active"]
                                                            : ""
                                                    }`}
                                                    onClick={() => {
                                                        handlePlaybackRateChange(
                                                            rate
                                                        );
                                                    }}
                                                >
                                                    {rate}x
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                className={styles["controlButton"]}
                                onClick={handleFullscreen}
                                aria-label={
                                    isFullscreen
                                        ? "Exit fullscreen"
                                        : "Enter fullscreen"
                                }
                                title="Fullscreen (F)"
                            >
                                {isFullscreen ? (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                                    </svg>
                                ) : (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Poster background when not loaded */}
            {!isLoaded && movieDetails?.backdrop_path && (
                <div
                    className={styles["posterBackground"]}
                    style={{
                        backgroundImage: `url(${getImageUrl(
                            movieDetails.backdrop_path,
                            "original"
                        )})`,
                    }}
                />
            )}
        </div>
    );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../../lib/tmdb";
import type { WatchHistoryItem } from "../../../../types/movies-on-demand";
import styles from "./WatchHistoryList.module.css";

interface WatchHistoryListProps {
    movies: WatchHistoryItem[];
    isLoading: boolean;
    onMovieClick: (movieId: number) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

export default function WatchHistoryList({
    movies,
    isLoading,
    onMovieClick,
    onLoadMore,
    hasMore,
}: WatchHistoryListProps): React.JSX.Element {
    const navigate = useNavigate();

    const handleMovieClick = (movieId: number) => {
        onMovieClick(movieId);
        navigate(`/movies-on-demand/movies/${movieId}`);
    };

    if (isLoading && movies.length === 0) {
        return (
            <div className={styles["container"]}>
                <div className={styles["grid"]}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className={styles["skeleton"]} />
                    ))}
                </div>
            </div>
        );
    }

    if (movies.length === 0) {
        return (
            <div className={styles["empty"]}>
                <p>No watch history yet. Start watching movies to see them here!</p>
            </div>
        );
    }

    return (
        <div className={styles["container"]}>
            <div className={styles["grid"]}>
                {movies.map((movie) => {
                    const posterUrl = getImageUrl(movie.poster_path, "w500");
                    const isDeleted = movie.status === "deleted";

                    return (
                        <div
                            key={movie.movie_id}
                            className={styles["card"]}
                            onClick={() => {
                                if (!isDeleted) {
                                    handleMovieClick(movie.movie_id);
                                }
                            }}
                            role={isDeleted ? undefined : "button"}
                            tabIndex={isDeleted ? undefined : 0}
                        >
                            <div className={styles["posterContainer"]}>
                                <img
                                    src={posterUrl}
                                    alt={`${movie.title} poster`}
                                    className={styles["poster"]}
                                    loading="lazy"
                                />
                                {isDeleted ? <div className={styles["deletedBadge"]}>
                                        Deleted
                                    </div> : null}
                            </div>
                            <div className={styles["info"]}>
                                <h3 className={styles["title"]}>{movie.title}</h3>
                                <p className={styles["watchedDate"]}>
                                    {formatDate(movie.last_watched_at)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            {hasMore && onLoadMore ? <div className={styles["loadMoreContainer"]}>
                    <button
                        className={styles["loadMoreButton"]}
                        onClick={onLoadMore}
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : "Load More"}
                    </button>
                </div> : null}
        </div>
    );
}


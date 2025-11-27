import React from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../../lib/tmdb";
import JobStatusDisplay from "../JobStatusDisplay/JobStatusDisplay";
import type { Movie, JobStatus } from "../../../../types/movies-on-demand";
import styles from "./MovieWithJobStatus.module.css";

interface MovieWithJobStatusProps {
    readonly movie: Movie;
    readonly job: JobStatus;
}

export default function MovieWithJobStatus({
    movie,
    job,
}: MovieWithJobStatusProps): React.JSX.Element {
    const navigate = useNavigate();
    const posterUrl = getImageUrl(movie.poster_path, "w500");

    const handleMovieClick = (): void => {
        const result = navigate(`/movies-on-demand/movies/${String(movie.id)}`);
        if (result instanceof Promise) {
            result.catch(() => {
                // Navigation errors are handled by React Router
            });
        }
    };

    const handleWatchClick = (): void => {
        const result = navigate(`/movies-on-demand/movies/${String(movie.id)}/watch`);
        if (result instanceof Promise) {
            result.catch(() => {
                // Navigation errors are handled by React Router
            });
        }
    };

    return (
        <div className={styles["container"]}>
            <div
                className={styles["movieCardWrapper"]}
                onClick={handleMovieClick}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleMovieClick();
                    }
                }}
                role="button"
                tabIndex={0}
            >
                <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    className={styles["poster"]}
                    loading="lazy"
                />
            </div>
            <div className={styles["movieInfo"]}>
                <button
                    type="button"
                    className={styles["title"]}
                    onClick={handleMovieClick}
                >
                    {movie.title}
                </button>
            </div>
            <div className={styles["jobStatusWrapper"]}>
                <JobStatusDisplay
                    job={job}
                    isLoading={false}
                    {...(job.status === "ready" && { onWatchClick: handleWatchClick })}
                />
            </div>
        </div>
    );
}


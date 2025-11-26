import React from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../../lib/tmdb";
import JobStatusDisplay from "../JobStatusDisplay/JobStatusDisplay";
import type { Movie, JobStatus } from "../../../../types/movies-on-demand";
import styles from "./MovieWithJobStatus.module.css";

interface MovieWithJobStatusProps {
    movie: Movie;
    job: JobStatus;
}

export default function MovieWithJobStatus({
    movie,
    job,
}: MovieWithJobStatusProps): React.JSX.Element {
    const navigate = useNavigate();
    const posterUrl = getImageUrl(movie.poster_path, "w500");

    const handleMovieClick = () => {
        navigate(`/movies-on-demand/movies/${movie.id}`);
    };

    const handleWatchClick = () => {
        navigate(`/movies-on-demand/movies/${movie.id}/watch`);
    };

    return (
        <div className={styles["container"]}>
            <div className={styles["movieCardWrapper"]} onClick={handleMovieClick} role="button" tabIndex={0}>
                <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    className={styles["poster"]}
                    loading="lazy"
                />
            </div>
            <div className={styles["movieInfo"]}>
                <h3 className={styles["title"]} onClick={handleMovieClick}>{movie.title}</h3>
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


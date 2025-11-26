import React from "react";
import { getImageUrl } from "../../../../lib/tmdb";
import type { Movie } from "../../../../types/movies-on-demand";
import styles from "./MovieCard.module.css";

interface MovieCardProps {
    movie: Movie;
    onClick?: () => void;
}

export default function MovieCard({
    movie,
    onClick,
}: MovieCardProps): React.JSX.Element {
    const posterUrl = getImageUrl(movie.poster_path, "w500");
    const rating = movie.vote_average
        ? movie.vote_average.toFixed(1)
        : "N/A";

    return (
        <div className={styles["card"]} onClick={onClick} role="button" tabIndex={0}>
            <div className={styles["posterContainer"]}>
                <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    className={styles["poster"]}
                    loading="lazy"
                />
                {movie.vote_average !== undefined && (
                    <div className={styles["rating"]}>{rating}</div>
                )}
            </div>
            <div className={styles["info"]}>
                <h3 className={styles["title"]}>{movie.title}</h3>
                {movie.release_date && (
                    <p className={styles["releaseDate"]}>
                        {new Date(movie.release_date).getFullYear()}
                    </p>
                )}
            </div>
        </div>
    );
}


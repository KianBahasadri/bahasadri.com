import React from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../MovieCard/MovieCard";
import type { Movie } from "../../../../types/movies-on-demand";
import styles from "./MovieList.module.css";

interface MovieListProps {
    movies: Movie[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onMovieClick: (movieId: number) => void;
}

export default function MovieList({
    movies,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onMovieClick,
}: MovieListProps): React.JSX.Element {
    const navigate = useNavigate();

    const handleMovieClick = (movieId: number) => {
        onMovieClick(movieId);
        navigate(`/movies-on-demand/movies/${movieId}`);
    };

    if (isLoading) {
        return (
            <div className={styles["container"]}>
                <div className={styles["grid"]}>
                    {Array.from({ length: 20 }, (_, i) => (
                        <div key={i} className={styles["skeleton"]} />
                    ))}
                </div>
            </div>
        );
    }

    if (movies.length === 0) {
        return (
            <div className={styles["empty"]}>
                <p>No movies found. Try a different search.</p>
            </div>
        );
    }

    return (
        <div className={styles["container"]}>
            <div className={styles["grid"]}>
                {movies.map((movie) => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                        onClick={() => {
                            handleMovieClick(movie.id);
                        }}
                    />
                ))}
            </div>
            {totalPages > 1 && (
                <div className={styles["pagination"]}>
                    <button
                        className={styles["pageButton"]}
                        onClick={() => {
                            onPageChange(currentPage - 1);
                        }}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                    >
                        Previous
                    </button>
                    <span className={styles["pageInfo"]}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className={styles["pageButton"]}
                        onClick={() => {
                            onPageChange(currentPage + 1);
                        }}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}


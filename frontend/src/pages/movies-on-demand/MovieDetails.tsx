import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMovieDetails,
    getMovieReleases,
    getSimilarMovies,
    getJobStatus,
    fetchMovie,
} from "../../lib/api";
import { getImageUrl } from "../../lib/tmdb";
import MovieCard from "./components/MovieCard/MovieCard";
import ReleaseSelector from "./components/ReleaseSelector/ReleaseSelector";
import JobStatusDisplay from "./components/JobStatusDisplay/JobStatusDisplay";
import type { UsenetRelease, FetchMovieRequest, JobStatus } from "../../types/movies-on-demand";
import styles from "./MovieDetails.module.css";

const queryKeys = {
    details: (id: number) => ["movies-on-demand", "details", id] as const,
    releases: (id: number) => ["movies-on-demand", "releases", id] as const,
    similar: (id: number, page: number) =>
        ["movies-on-demand", "similar", id, page] as const,
    jobStatus: (jobId: string) => ["movies-on-demand", "job", jobId] as const,
};

function getRefetchInterval(query: { state: { data?: JobStatus | undefined } }): number | false {
    const data = query.state.data;
    if (!data) {
        return 2000;
    }
    const isComplete = data.status === "ready" || data.status === "error";
    return isComplete ? false : 2000;
}

export default function MovieDetails(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const movieId = id ? Number.parseInt(id, 10) : 0;

    const [fetchMode, setFetchMode] = useState<"auto" | "manual">("auto");
    const [selectedRelease, setSelectedRelease] = useState<UsenetRelease | null>(null);
    const [showReleaseSelector, setShowReleaseSelector] = useState(false);
    const [qualityPreference, setQualityPreference] = useState("1080p");

    const { data: movieDetails, isLoading: isDetailsLoading } = useQuery({
        queryKey: queryKeys.details(movieId),
        queryFn: async () => await getMovieDetails(movieId),
        enabled: movieId > 0,
    });

    const { data: releasesData, isLoading: isReleasesLoading } = useQuery({
        queryKey: queryKeys.releases(movieId),
        queryFn: async () => await getMovieReleases(movieId),
        enabled: movieId > 0 && fetchMode === "manual",
    });

    const { data: similarData } = useQuery({
        queryKey: queryKeys.similar(movieId, 1),
        queryFn: async () => await getSimilarMovies(movieId, 1),
        enabled: movieId > 0,
    });

    const jobId = movieDetails?.job_status?.job_id;
    const {
        data: jobStatus,
        isLoading: isJobStatusLoading,
    } = useQuery({
        queryKey: queryKeys.jobStatus(jobId ?? ""),
        queryFn: async () => await getJobStatus(jobId ?? ""),
        enabled: !!jobId,
        refetchInterval: getRefetchInterval,
    });

    const fetchMovieMutation = useMutation({
        mutationFn: async (request: FetchMovieRequest) => {
            return await fetchMovie(movieId, request);
        },
        onSuccess: (data) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.details(movieId),
            });
            if (data.job_id) {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.jobStatus(data.job_id),
                });
            }
        },
    });

    const handleFetchClick = (): void => {
        if (fetchMode === "manual" && !selectedRelease) {
            setShowReleaseSelector(true);
            return;
        }

        const request: FetchMovieRequest = {
            mode: fetchMode,
            release_id: fetchMode === "manual" ? selectedRelease?.id ?? null : null,
            quality_preference: fetchMode === "auto" ? qualityPreference : null,
        };

        fetchMovieMutation.mutate(request);
    };

    const handleReleaseSelect = (release: UsenetRelease): void => {
        setSelectedRelease(release);
        setShowReleaseSelector(false);
    };

    const handleWatchClick = (): void => {
        const result = navigate(`/movies-on-demand/movies/${String(movieId)}/watch`);
        if (result instanceof Promise) {
            result.catch(() => {
                // Navigation errors are handled by React Router
            });
        }
    };

    const handleSimilarMovieClick = (similarMovieId: number): void => {
        const result = navigate(`/movies-on-demand/movies/${String(similarMovieId)}`);
        if (result instanceof Promise) {
            result.catch(() => {
                // Navigation errors are handled by React Router
            });
        }
    };

    if (isDetailsLoading || !movieDetails) {
        return (
            <div className={styles["container"]}>
                <div className={styles["loading"]}>Loading movie details...</div>
            </div>
        );
    }

    const backdropUrl = getImageUrl(movieDetails.backdrop_path, "original");
    const posterUrl = getImageUrl(movieDetails.poster_path, "w500");
    const imdbUrl = movieDetails.imdb_id
        ? `https://www.imdb.com/title/${movieDetails.imdb_id}/`
        : null;
    const currentJob = jobStatus;
    const isReady = currentJob?.status === "ready";

    const handleBackClick = (): void => {
        const result = navigate("/movies-on-demand");
        if (result instanceof Promise) {
            result.catch(() => {
                // Navigation errors are handled by React Router
            });
        }
    };

    return (
        <div className={styles["container"]}>
            {showReleaseSelector ? (
                <ReleaseSelector
                    releases={releasesData?.releases ?? []}
                    isLoading={isReleasesLoading}
                    onSelect={handleReleaseSelect}
                    onCancel={() => {
                        setShowReleaseSelector(false);
                    }}
                />
            ) : null}
            <div
                className={styles["hero"]}
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url(${backdropUrl})`,
                }}
            >
                <button
                    className={styles["backButton"]}
                    onClick={handleBackClick}
                    aria-label="Back to movies"
                >
                    ← Back to Movies
                </button>
                <div className={styles["heroContent"]}>
                    <img
                        src={posterUrl}
                        alt={`${movieDetails.title} poster`}
                        className={styles["poster"]}
                    />
                    <div className={styles["heroInfo"]}>
                        <h1 className={styles["title"]}>{movieDetails.title}</h1>
                        <div className={styles["meta"]}>
                            {movieDetails.release_date ? (
                                <span>
                                    {new Date(
                                        movieDetails.release_date
                                    ).getFullYear()}
                                </span>
                            ) : null}
                            {movieDetails.runtime ? (
                                <span>{String(movieDetails.runtime)} min</span>
                            ) : null}
                            {movieDetails.vote_average ? (
                                <span>
                                    ⭐ {movieDetails.vote_average.toFixed(1)}
                                </span>
                            ) : null}
                        </div>
                        {movieDetails.genres && movieDetails.genres.length > 0 ? (
                            <div className={styles["genres"]}>
                                {movieDetails.genres.map((genre) => (
                                    <span key={genre.id} className={styles["genre"]}>
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                        {imdbUrl ? (
                            <a
                                className={styles["imdbLink"]}
                                href={imdbUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on IMDb
                            </a>
                        ) : null}
                        {movieDetails.overview ? (
                            <p className={styles["overview"]}>
                                {movieDetails.overview}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className={styles["content"]}>
                <section className={styles["section"]}>
                    <h2 className={styles["sectionTitle"]}>Fetch & Watch</h2>
                    <div className={styles["fetchControls"]}>
                        <div className={styles["modeSelector"]}>
                            <label className={styles["radioLabel"]}>
                                <input
                                    type="radio"
                                    name="fetchMode"
                                    value="auto"
                                    checked={fetchMode === "auto"}
                                    onChange={(e) => {
                                        setFetchMode(
                                            e.target.value as "auto" | "manual"
                                        );
                                    }}
                                />
                                <span>Auto</span>
                            </label>
                            <label className={styles["radioLabel"]}>
                                <input
                                    type="radio"
                                    name="fetchMode"
                                    value="manual"
                                    checked={fetchMode === "manual"}
                                    onChange={(e) => {
                                        setFetchMode(
                                            e.target.value as "auto" | "manual"
                                        );
                                    }}
                                />
                                <span>Manual</span>
                            </label>
                        </div>
                        {fetchMode === "auto" && (
                            <select
                                className={styles["qualitySelect"]}
                                value={qualityPreference}
                                onChange={(e) => {
                                    setQualityPreference(e.target.value);
                                }}
                            >
                                <option value="720p">720p</option>
                                <option value="1080p">1080p</option>
                                <option value="4K">4K</option>
                            </select>
                        )}
                        {fetchMode === "manual" && selectedRelease ? (
                            <div className={styles["selectedRelease"]}>
                                Selected: {selectedRelease.title}
                            </div>
                        ) : null}
                        {fetchMode === "manual" && !selectedRelease && (
                            <button
                                className={styles["selectReleaseButton"]}
                                onClick={() => {
                                    setShowReleaseSelector(true);
                                }}
                            >
                                Select Release
                            </button>
                        )}
                        {!isReady && (
                            <button
                                className={styles["fetchButton"]}
                                onClick={handleFetchClick}
                                disabled={fetchMovieMutation.isPending}
                            >
                                {fetchMovieMutation.isPending
                                    ? "Fetching..."
                                    : "Fetch & Watch"}
                            </button>
                        )}
                    </div>
                    {(() => {
                        if (!currentJob && !jobId) {
                            return null;
                        }
                        const watchClickProps = isReady ? { onWatchClick: handleWatchClick } : {};
                        return (
                            <JobStatusDisplay
                                job={currentJob ?? null}
                                isLoading={isJobStatusLoading}
                                {...watchClickProps}
                            />
                        );
                    })() as React.JSX.Element | null}
                </section>

                {movieDetails.credits && movieDetails.credits.cast.length > 0 ? (
                    <section className={styles["section"]}>
                        <h2 className={styles["sectionTitle"]}>Cast</h2>
                        <div className={styles["castGrid"]}>
                            {movieDetails.credits.cast.slice(0, 12).map((actor) => {
                                const profileUrl = getImageUrl(
                                    actor.profile_path,
                                    "w500"
                                );
                                return (
                                    <div key={actor.id} className={styles["castMember"]}>
                                        <img
                                            src={profileUrl}
                                            alt={actor.name}
                                            className={styles["castPhoto"]}
                                        />
                                        <div className={styles["castInfo"]}>
                                            <p className={styles["castName"]}>
                                                {actor.name}
                                            </p>
                                            <p className={styles["castCharacter"]}>
                                                {actor.character}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ) : null}

                {similarData && similarData.results.length > 0 ? (
                    <section className={styles["section"]}>
                        <h2 className={styles["sectionTitle"]}>Similar Movies</h2>
                        <div className={styles["similarGrid"]}>
                            {similarData.results.slice(0, 8).map((movie) => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                    onClick={() => {
                                        handleSimilarMovieClick(movie.id);
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}


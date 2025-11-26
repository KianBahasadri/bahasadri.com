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
import type { UsenetRelease, FetchMovieRequest } from "../../types/movies-on-demand";
import styles from "./MovieDetails.module.css";

const queryKeys = {
    details: (id: number) => ["movies-on-demand", "details", id] as const,
    releases: (id: number) => ["movies-on-demand", "releases", id] as const,
    similar: (id: number, page: number) =>
        ["movies-on-demand", "similar", id, page] as const,
    jobStatus: (jobId: string) => ["movies-on-demand", "job", jobId] as const,
};

export default function MovieDetails(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const movieId = id ? parseInt(id, 10) : 0;

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
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data?.status === "ready" || data?.status === "error") {
                return false;
            }
            return 2000;
        },
    });

    const fetchMovieMutation = useMutation({
        mutationFn: (request: FetchMovieRequest) =>
            fetchMovie(movieId, request),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.details(movieId),
            });
            if (data.job_id) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.jobStatus(data.job_id),
                });
            }
        },
    });

    const handleFetchClick = () => {
        if (fetchMode === "manual") {
            if (!selectedRelease) {
                setShowReleaseSelector(true);
                return;
            }
        }

        const request: FetchMovieRequest = {
            mode: fetchMode,
            release_id: fetchMode === "manual" ? selectedRelease?.id ?? null : null,
            quality_preference: fetchMode === "auto" ? qualityPreference : null,
        };

        fetchMovieMutation.mutate(request);
    };

    const handleReleaseSelect = (release: UsenetRelease) => {
        setSelectedRelease(release);
        setShowReleaseSelector(false);
    };

    const handleWatchClick = () => {
        navigate(`/movies-on-demand/movies/${movieId}/watch`);
    };

    const handleSimilarMovieClick = (similarMovieId: number) => {
        navigate(`/movies-on-demand/movies/${similarMovieId}`);
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
    const currentJob = jobStatus;
    const isReady = currentJob?.status === "ready";

    const handleBackClick = () => {
        navigate("/movies-on-demand");
    };

    return (
        <div className={styles["container"]}>
            {showReleaseSelector && (
                <ReleaseSelector
                    releases={releasesData?.releases ?? []}
                    isLoading={isReleasesLoading}
                    onSelect={handleReleaseSelect}
                    onCancel={() => {
                        setShowReleaseSelector(false);
                    }}
                />
            )}
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
                            {movieDetails.release_date && (
                                <span>
                                    {new Date(
                                        movieDetails.release_date
                                    ).getFullYear()}
                                </span>
                            )}
                            {movieDetails.runtime && (
                                <span>{movieDetails.runtime} min</span>
                            )}
                            {movieDetails.vote_average && (
                                <span>
                                    ⭐ {movieDetails.vote_average.toFixed(1)}
                                </span>
                            )}
                        </div>
                        {movieDetails.genres && movieDetails.genres.length > 0 && (
                            <div className={styles["genres"]}>
                                {movieDetails.genres.map((genre) => (
                                    <span key={genre.id} className={styles["genre"]}>
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        {movieDetails.overview && (
                            <p className={styles["overview"]}>
                                {movieDetails.overview}
                            </p>
                        )}
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
                        {fetchMode === "manual" && selectedRelease && (
                            <div className={styles["selectedRelease"]}>
                                Selected: {selectedRelease.title}
                            </div>
                        )}
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
                    {(currentJob || jobId) && (
                        <JobStatusDisplay
                            job={currentJob ?? null}
                            isLoading={isJobStatusLoading}
                            {...(isReady && { onWatchClick: handleWatchClick })}
                        />
                    )}
                </section>

                {movieDetails.credits && movieDetails.credits.cast.length > 0 && (
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
                )}

                {similarData && similarData.results.length > 0 && (
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
                )}
            </div>
        </div>
    );
}


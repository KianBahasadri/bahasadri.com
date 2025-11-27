import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    searchMovies,
    getPopularMovies,
    getTopMovies,
    getWatchHistory,
    listActiveJobs,
    getMovieDetails,
} from "../../lib/api";
import MovieSearch from "./components/MovieSearch/MovieSearch";
import MovieList from "./components/MovieList/MovieList";
import WatchHistoryList from "./components/WatchHistoryList/WatchHistoryList";
import JobsList from "./components/JobsList/JobsList";
import type { Movie, JobStatus } from "../../types/movies-on-demand";
import styles from "./MoviesOnDemand.module.css";

const queryKeys = {
    search: (query: string, page: number) =>
        ["movies-on-demand", "search", query, page] as const,
    popular: (page: number) => ["movies-on-demand", "popular", page] as const,
    top: (page: number) => ["movies-on-demand", "top", page] as const,
    history: (limit: number, offset: number) =>
        ["movies-on-demand", "history", limit, offset] as const,
    available: () => ["movies-on-demand", "available"] as const,
};

type ViewType = "search" | "popular" | "top" | "history" | "available";

export default function MoviesOnDemand(): React.JSX.Element {
    const [activeView, setActiveView] = useState<ViewType>("popular");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const historyLimit = 20;
    const [historyOffset, setHistoryOffset] = useState(0);

    const { data: searchData, isLoading: isSearchLoading } = useQuery({
        queryKey: queryKeys.search(searchQuery, currentPage),
        queryFn: async () => await searchMovies(searchQuery, currentPage),
        enabled: activeView === "search" && searchQuery.length > 0,
    });

    const { data: popularData, isLoading: isPopularLoading } = useQuery({
        queryKey: queryKeys.popular(currentPage),
        queryFn: async () => await getPopularMovies(currentPage),
        enabled: activeView === "popular",
    });

    const { data: topData, isLoading: isTopLoading } = useQuery({
        queryKey: queryKeys.top(currentPage),
        queryFn: async () => await getTopMovies(currentPage),
        enabled: activeView === "top",
    });

    const {
        data: historyData,
        isLoading: isHistoryLoading,
    } = useQuery({
        queryKey: queryKeys.history(historyLimit, historyOffset),
        queryFn: async () =>
            await getWatchHistory(historyLimit, historyOffset),
        enabled: activeView === "history",
    });

    const { data: availableData, isLoading: isAvailableLoading } = useQuery({
        queryKey: queryKeys.available(),
        queryFn: async (): Promise<{ movie: Movie; job: JobStatus }[]> => {
            const jobsResponse = await listActiveJobs();
            const sortedJobs = [...jobsResponse.jobs].sort((a: JobStatus, b: JobStatus) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateB - dateA;
            });

            const moviePromises = sortedJobs.map(
                async (job: JobStatus): Promise<{ movie: Movie; job: JobStatus }> => {
                    const movie = await getMovieDetails(job.movie_id);
                    return { movie, job };
                }
            );

            const items = await Promise.all(moviePromises);
            return items;
        },
        enabled: activeView === "available",
        refetchInterval: activeView === "available" ? 5000 : false,
    });

    const handleSearch = (query: string): void => {
        setSearchQuery(query);
        if (query.length > 0) {
            setActiveView("search");
            setCurrentPage(1);
        }
    };

    const handleViewChange = (view: ViewType): void => {
        setActiveView(view);
        setCurrentPage(1);
        setSearchQuery("");
    };

    const handlePageChange = (page: number): void => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    const handleHistoryLoadMore = (): void => {
        setHistoryOffset((prev) => prev + historyLimit);
    };

    const getCurrentMovies = (): Movie[] => {
        switch (activeView) {
            case "search": {
                return searchData?.results ?? [];
            }
            case "popular": {
                return popularData?.results ?? [];
            }
            case "top": {
                return topData?.results ?? [];
            }
            default: {
                return [];
            }
        }
    };

    const getCurrentTotalPages = (): number => {
        switch (activeView) {
            case "search": {
                return searchData?.total_pages ?? 0;
            }
            case "popular": {
                return popularData?.total_pages ?? 0;
            }
            case "top": {
                return topData?.total_pages ?? 0;
            }
            default: {
                return 0;
            }
        }
    };

    const getCurrentIsLoading = (): boolean => {
        switch (activeView) {
            case "search": {
                return isSearchLoading;
            }
            case "popular": {
                return isPopularLoading;
            }
            case "top": {
                return isTopLoading;
            }
            case "available": {
                return isAvailableLoading;
            }
            default: {
                return false;
            }
        }
    };

    const hasMoreHistory =
        historyData &&
        historyData.movies.length < historyData.total;

    return (
        <div className={styles["container"]}>
            <h1 className={styles["title"]}>Movies on Demand</h1>
            <MovieSearch onSearch={handleSearch} />
            <div className={styles["tabs"]}>
                <button
                    className={`${styles["tab"]} ${
                        activeView === "popular" && styles["active"] ? (styles["active"] ?? "") : ""
                    }`}
                    onClick={() => {
                        handleViewChange("popular");
                    }}
                >
                    Popular
                </button>
                <button
                    className={`${styles["tab"]} ${
                        activeView === "top" && styles["active"] ? (styles["active"] ?? "") : ""
                    }`}
                    onClick={() => {
                        handleViewChange("top");
                    }}
                >
                    Top Movies
                </button>
                <button
                    className={`${styles["tab"]} ${
                        activeView === "history" && styles["active"] ? (styles["active"] ?? "") : ""
                    }`}
                    onClick={() => {
                        handleViewChange("history");
                    }}
                >
                    History
                </button>
                <button
                    className={`${styles["tab"]} ${
                        activeView === "available" && styles["active"] ? (styles["active"] ?? "") : ""
                    }`}
                    onClick={() => {
                        handleViewChange("available");
                    }}
                >
                    Available/Downloading
                </button>
            </div>
            {(() => {
                const renderView = (): React.JSX.Element => {
                    if (activeView === "history") {
                        return (
                            <WatchHistoryList
                                movies={historyData?.movies ?? []}
                                isLoading={isHistoryLoading}
                                onMovieClick={() => {
                                    // Navigation handled by WatchHistoryList component
                                }}
                                {...(hasMoreHistory && { onLoadMore: handleHistoryLoadMore })}
                                hasMore={hasMoreHistory ?? false}
                            />
                        );
                    }
                    if (activeView === "available") {
                        return (
                            <JobsList
                                items={availableData ?? []}
                                isLoading={isAvailableLoading}
                            />
                        );
                    }
                    return (
                        <MovieList
                            movies={getCurrentMovies()}
                            isLoading={getCurrentIsLoading()}
                            currentPage={currentPage}
                            totalPages={getCurrentTotalPages()}
                            onPageChange={handlePageChange}
                            onMovieClick={() => {
                                // Navigation handled by MovieList component
                            }}
                        />
                    );
                };
                return renderView();
            })()}
        </div>
    );
}


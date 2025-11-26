import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    searchMovies,
    getPopularMovies,
    getTopMovies,
    getWatchHistory,
} from "../../lib/api";
import MovieSearch from "./components/MovieSearch/MovieSearch";
import MovieList from "./components/MovieList/MovieList";
import WatchHistoryList from "./components/WatchHistoryList/WatchHistoryList";
import styles from "./MoviesOnDemand.module.css";

const queryKeys = {
    search: (query: string, page: number) =>
        ["movies-on-demand", "search", query, page] as const,
    popular: (page: number) => ["movies-on-demand", "popular", page] as const,
    top: (page: number) => ["movies-on-demand", "top", page] as const,
    history: (limit: number, offset: number) =>
        ["movies-on-demand", "history", limit, offset] as const,
};

type ViewType = "search" | "popular" | "top" | "history";

export default function MoviesOnDemand(): React.JSX.Element {
    const [activeView, setActiveView] = useState<ViewType>("popular");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [historyLimit] = useState(20);
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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length > 0) {
            setActiveView("search");
            setCurrentPage(1);
        }
    };

    const handleViewChange = (view: ViewType) => {
        setActiveView(view);
        setCurrentPage(1);
        setSearchQuery("");
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleMovieClick = () => {
        // Navigation handled by MovieList component
    };

    const handleHistoryLoadMore = () => {
        setHistoryOffset((prev) => prev + historyLimit);
    };

    const getCurrentMovies = () => {
        switch (activeView) {
            case "search":
                return searchData?.results ?? [];
            case "popular":
                return popularData?.results ?? [];
            case "top":
                return topData?.results ?? [];
            default:
                return [];
        }
    };

    const getCurrentTotalPages = () => {
        switch (activeView) {
            case "search":
                return searchData?.total_pages ?? 0;
            case "popular":
                return popularData?.total_pages ?? 0;
            case "top":
                return topData?.total_pages ?? 0;
            default:
                return 0;
        }
    };

    const getCurrentIsLoading = () => {
        switch (activeView) {
            case "search":
                return isSearchLoading;
            case "popular":
                return isPopularLoading;
            case "top":
                return isTopLoading;
            default:
                return false;
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
                        activeView === "popular" ? styles["active"] : ""
                    }`}
                    onClick={() => {
                        handleViewChange("popular");
                    }}
                >
                    Popular
                </button>
                <button
                    className={`${styles["tab"]} ${
                        activeView === "top" ? styles["active"] : ""
                    }`}
                    onClick={() => {
                        handleViewChange("top");
                    }}
                >
                    Top Movies
                </button>
                <button
                    className={`${styles["tab"]} ${
                        activeView === "history" ? styles["active"] : ""
                    }`}
                    onClick={() => {
                        handleViewChange("history");
                    }}
                >
                    History
                </button>
            </div>
            {activeView === "history" ? (
                <WatchHistoryList
                    movies={historyData?.movies ?? []}
                    isLoading={isHistoryLoading}
                    onMovieClick={handleMovieClick}
                    {...(hasMoreHistory && { onLoadMore: handleHistoryLoadMore })}
                    hasMore={hasMoreHistory ?? false}
                />
            ) : (
                <MovieList
                    movies={getCurrentMovies()}
                    isLoading={getCurrentIsLoading()}
                    currentPage={currentPage}
                    totalPages={getCurrentTotalPages()}
                    onPageChange={handlePageChange}
                    onMovieClick={handleMovieClick}
                />
            )}
        </div>
    );
}


/**
 * TMDB API client for movies-on-demand feature
 * Uses Bearer token authentication with TMDB_API_KEY
 */

import type {
    TMDBMovie,
    TMDBMovieDetails,
    TMDBSearchResponse,
    Movie,
    MovieDetails,
    MovieSearchResponse,
} from "../types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Make authenticated request to TMDB API
 */
async function tmdbFetch<T>(
    endpoint: string,
    apiKey: string,
    params?: Record<string, string>
): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
    }

    const response = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("NOT_FOUND");
        }
        throw new Error(`TMDB_ERROR: ${String(response.status)}`);
    }

    return response.json() as T;
}

/**
 * Transform TMDB movie to API contract format
 */
function transformMovie(movie: TMDBMovie): Movie {
    return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        popularity: movie.popularity,
        genre_ids: movie.genre_ids,
    };
}

/**
 * Transform TMDB movie details to API contract format
 */
function transformMovieDetails(
    details: TMDBMovieDetails
): Omit<MovieDetails, "job_status"> {
    return {
        id: details.id,
        title: details.title,
        overview: details.overview,
        release_date: details.release_date,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        vote_average: details.vote_average,
        vote_count: details.vote_count,
        popularity: details.popularity,
        genre_ids: details.genre_ids,
        runtime: details.runtime,
        genres: details.genres,
        production_companies: details.production_companies,
        budget: details.budget,
        revenue: details.revenue,
        imdb_id: details.imdb_id,
        credits: details.credits,
    };
}

/**
 * Transform TMDB search response to API contract format
 */
function transformSearchResponse(
    response: TMDBSearchResponse
): MovieSearchResponse {
    return {
        results: response.results.map((movie) => transformMovie(movie)),
        total_results: response.total_results,
        page: response.page,
        total_pages: response.total_pages,
    };
}

/**
 * Search movies by title
 */
export async function searchMovies(
    apiKey: string,
    query: string,
    page = 1
): Promise<MovieSearchResponse> {
    const response = await tmdbFetch<TMDBSearchResponse>(
        "/search/movie",
        apiKey,
        {
            query: encodeURIComponent(query),
            page: String(page),
            include_adult: "true",
        }
    );
    return transformSearchResponse(response);
}

/**
 * Get popular movies
 */
export async function getPopularMovies(
    apiKey: string,
    page = 1
): Promise<MovieSearchResponse> {
    const response = await tmdbFetch<TMDBSearchResponse>(
        "/movie/popular",
        apiKey,
        {
            page: String(page),
        }
    );
    return transformSearchResponse(response);
}

/**
 * Get top rated movies
 */
export async function getTopRatedMovies(
    apiKey: string,
    page = 1
): Promise<MovieSearchResponse> {
    const response = await tmdbFetch<TMDBSearchResponse>(
        "/movie/top_rated",
        apiKey,
        {
            page: String(page),
        }
    );
    return transformSearchResponse(response);
}

/**
 * Get movie details with credits
 */
export async function getMovieDetails(
    apiKey: string,
    movieId: number
): Promise<Omit<MovieDetails, "job_status">> {
    const response = await tmdbFetch<TMDBMovieDetails>(
        `/movie/${String(movieId)}`,
        apiKey,
        { append_to_response: "credits" }
    );
    return transformMovieDetails(response);
}

/**
 * Get similar movies
 */
export async function getSimilarMovies(
    apiKey: string,
    movieId: number,
    page = 1
): Promise<MovieSearchResponse> {
    const response = await tmdbFetch<TMDBSearchResponse>(
        `/movie/${String(movieId)}/similar`,
        apiKey,
        { page: String(page) }
    );
    return transformSearchResponse(response);
}

/**
 * Get IMDb ID for a movie (for NZBGeek searches)
 */
export async function getMovieImdbId(
    apiKey: string,
    movieId: number
): Promise<string | undefined> {
    const details = await tmdbFetch<TMDBMovieDetails>(
        `/movie/${String(movieId)}`,
        apiKey
    );
    return details.imdb_id;
}

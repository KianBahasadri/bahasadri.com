/**
 * Movie Discovery Routes (TMDB)
 * Handles movie search, popular/top-rated lists, movie details, and similar movies
 */

import { Hono } from "hono";
import type { Env } from "../../types/env";
import { withErrorHandling } from "../../lib/error-handling";
import {
    validateSearchQuery,
    validateMovieId,
    validatePage,
} from "../lib/validation";
import {
    searchMovies as tmdbSearchMovies,
    getPopularMovies as tmdbGetPopular,
    getTopRatedMovies as tmdbGetTopRated,
    getMovieDetails as tmdbGetMovieDetails,
    getSimilarMovies as tmdbGetSimilar,
} from "../lib/tmdb";
import type {
    ErrorResponse,
    MovieSearchResponse,
    MovieDetails,
    JobRow,
} from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/movies-on-demand/search
 * Search for movies by title
 */
app.get(
    "/search",
    withErrorHandling(
        async (c) => {
            const query = c.req.query("query");
            const pageParam = c.req.query("page");

            // Validate query
            const queryValidation = validateSearchQuery(query);
            if (!queryValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: queryValidation.error ?? "Invalid query",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            const page = validatePage(pageParam);
            const queryValue = query ?? "";
            const results = await tmdbSearchMovies(
                c.env.TMDB_API_KEY,
                queryValue,
                page
            );

            return c.json<MovieSearchResponse>(results, 200);
        },
        "/api/movies-on-demand/search",
        "GET"
    )
);

/**
 * GET /api/movies-on-demand/popular
 * Get popular movies
 */
app.get(
    "/popular",
    withErrorHandling(
        async (c) => {
            const pageParam = c.req.query("page");
            const page = validatePage(pageParam);

            const apiKey = c.env.TMDB_API_KEY;
            const results = await tmdbGetPopular(apiKey, page);
            return c.json<MovieSearchResponse>(results, 200);
        },
        "/api/movies-on-demand/popular",
        "GET"
    )
);

/**
 * GET /api/movies-on-demand/top
 * Get top-rated movies of all time
 */
app.get(
    "/top",
    withErrorHandling(
        async (c) => {
            const pageParam = c.req.query("page");
            const page = validatePage(pageParam);

            const results = await tmdbGetTopRated(c.env.TMDB_API_KEY, page);
            return c.json<MovieSearchResponse>(results, 200);
        },
        "/api/movies-on-demand/top",
        "GET"
    )
);

/**
 * GET /api/movies-on-demand/movies/:id
 * Get movie details with job status
 */
app.get(
    "/movies/:id",
    withErrorHandling(
        async (c) => {
            const idParam = c.req.param("id");

            // Validate movie ID
            const idValidation = validateMovieId(idParam);
            if (!idValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: idValidation.error ?? "Invalid movie ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            const movieId = idValidation.id;
            if (!movieId) {
                return c.json<ErrorResponse>(
                    {
                        error: "Invalid movie ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            // Get movie details from TMDB
            const movieDetails = await tmdbGetMovieDetails(
                c.env.TMDB_API_KEY,
                movieId
            );

            // Check for active job in D1
            const jobResult = await c.env.MOVIES_D1.prepare(
                `SELECT * FROM jobs WHERE movie_id = ? ORDER BY created_at DESC LIMIT 1`
            )
                .bind(movieId)
                .first();
            const job = jobResult as JobRow | undefined;

            let jobStatus: MovieDetails["job_status"];
            if (job) {
                jobStatus = {
                    job_id: job.job_id,
                    status: job.status,
                    progress: job.progress,
                    error_message: job.error_message,
                };
            }

            const response: MovieDetails = {
                ...movieDetails,
                job_status: jobStatus,
            };

            return c.json<MovieDetails>(response, 200);
        },
        "/api/movies-on-demand/movies/:id",
        "GET"
    )
);

/**
 * GET /api/movies-on-demand/movies/:id/similar
 * Get similar movies
 */
app.get(
    "/movies/:id/similar",
    withErrorHandling(
        async (c) => {
            const idParam = c.req.param("id");
            const pageParam = c.req.query("page");

            // Validate movie ID
            const idValidation = validateMovieId(idParam);
            if (!idValidation.ok) {
                return c.json<ErrorResponse>(
                    {
                        error: idValidation.error ?? "Invalid movie ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }

            const movieId = idValidation.id;
            if (!movieId) {
                return c.json<ErrorResponse>(
                    {
                        error: "Invalid movie ID",
                        code: "INVALID_INPUT",
                    },
                    400
                );
            }
            const page = validatePage(pageParam);

            const results = await tmdbGetSimilar(
                c.env.TMDB_API_KEY,
                movieId,
                page
            );
            return c.json<MovieSearchResponse>(results, 200);
        },
        "/api/movies-on-demand/movies/:id/similar",
        "GET"
    )
);

export default app;


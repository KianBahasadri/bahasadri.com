/**
 * Usenet Release Routes
 * Handles fetching available Usenet releases for movies
 */

import { Hono } from "hono";
import type { Env } from "../../types/env";
import { withErrorHandling } from "../../lib/error-handling";
import { validateMovieId } from "../lib/validation";
import { getMovieImdbId } from "../lib/tmdb";
import { searchReleases } from "../lib/nzbgeek";
import type { ErrorResponse, ReleasesResponse } from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/movies-on-demand/movies/:id/releases
 * Get available Usenet releases for a movie
 */
app.get(
    "/movies/:id/releases",
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

            const movieId = idValidation.id!;

            // Get IMDb ID from TMDB
            const imdbId = await getMovieImdbId(c.env.TMDB_API_KEY, movieId);

            if (!imdbId) {
                // No IMDb ID, return empty releases list
                return c.json<ReleasesResponse>(
                    { releases: [], total: 0 },
                    200
                );
            }

            // Search NZBGeek for releases
            const releases = await searchReleases(
                c.env.NZBGEEK_API_KEY,
                imdbId
            );

            return c.json<ReleasesResponse>(
                { releases, total: releases.length },
                200
            );
        },
        "/api/movies-on-demand/movies/:id/releases",
        "GET"
    )
);

export default app;


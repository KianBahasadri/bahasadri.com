/**
 * Watch History Routes
 * Handles watch history endpoints
 */

import { Hono } from "hono";
import type { Env } from "../../types/env";
import { withErrorHandling } from "../../lib/error-handling";
import { validateLimit, validateOffset } from "../lib/validation";
import type {
    WatchHistoryResponse,
    WatchHistoryRow,
} from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/movies-on-demand/history
 * Get watch history
 */
app.get(
    "/history",
    withErrorHandling(
        async (c) => {
            const limitParam = c.req.query("limit");
            const offsetParam = c.req.query("offset");

            // Validate pagination parameters
            const limitValidation = validateLimit(limitParam, 20, 100);
            const offsetValidation = validateOffset(offsetParam, 0);

            const limit = limitValidation.limit;
            const offset = offsetValidation.offset;

            // Query watch history from D1
            const result = await c.env.MOVIES_D1.prepare(
                `SELECT * FROM watch_history ORDER BY last_watched_at DESC LIMIT ? OFFSET ?`
            )
                .bind(limit, offset)
                .all();

            // Get total count
            const countResultRaw = await c.env.MOVIES_D1.prepare(
                `SELECT COUNT(*) as count FROM watch_history`
            ).first();
            const countResult = countResultRaw as { count: number } | undefined;

            const movies = ((result.results ?? []) as WatchHistoryRow[]).map(
                (row) => ({
                    movie_id: row.movie_id,
                    title: row.title ?? "",
                    poster_path: row.poster_path,
                    last_watched_at: row.last_watched_at,
                    job_id: row.job_id,
                    status: row.status,
                })
            );

            const response: WatchHistoryResponse = {
                movies,
                total: countResult?.count ?? 0,
            };

            return c.json<WatchHistoryResponse>(response, 200);
        },
        "/api/movies-on-demand/history",
        "GET"
    )
);

export default app;


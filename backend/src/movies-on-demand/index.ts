/**
 * Movies on Demand API routes
 * Ephemeral movie streaming service using TMDB, NZBGeek, and Cloudflare infrastructure
 */

import { Hono } from "hono";
import type { Env } from "../types/env";
import discoveryRoutes from "./routes/discovery";
import releasesRoutes from "./routes/releases";
import jobsRoutes from "./routes/jobs";
import streamingRoutes from "./routes/streaming";
import historyRoutes from "./routes/history";
import internalRoutes from "./routes/internal";

const app = new Hono<{ Bindings: Env }>();

// Mount all route modules
app.route("/", discoveryRoutes);
app.route("/", releasesRoutes);
app.route("/", jobsRoutes);
app.route("/", streamingRoutes);
app.route("/", historyRoutes);
app.route("/internal", internalRoutes);

export default app;

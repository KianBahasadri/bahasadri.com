# Movies on Demand - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the Movies on Demand utility. An ephemeral movie streaming service that uses:

-   **TMDB API** for movie discovery and metadata
-   **NZBGeek API** for Usenet release searching
-   **Cloudflare infrastructure** for on-demand acquisition, storage, and streaming
-   **Job queue system** for asynchronous movie downloads and processing
-   **Cloudflare D1** for relational metadata storage and job tracking

Movies are fetched from Usenet on-demand and automatically deleted after viewing.

**Storage choice**: This design uses Cloudflare D1 for metadata and job tracking (relational storage), and R2 for movie files (binary objects). D1 is chosen because the feature requires rich queries (filter by status, expiration checks, sorted pagination, partial updates) which are harder to implement efficiently with KV. KV (and the Workers Cache) can still be used as a short-term cache for hot data.

## Code Location

`backend/src/movies-on-demand/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/movies-on-demand/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## Common Implementation Patterns

**TMDB API Integration:**

-   All TMDB API calls require Bearer token authentication: `Authorization: Bearer {TMDB_API_KEY}`
-   All pagination parameters default to `page=1` if not provided
-   TMDB returns paginated results with 20 items per page
-   Query parameters must be URL-encoded before sending to TMDB

**Input Validation:**

-   All movie IDs must be validated as positive integers
-   All IDs must be validated as integers before use
-   Page numbers default to 1 if not provided or invalid

**Error Mapping:**

-   Error handling and mapping logic is documented in the "Error Codes" section below
-   All endpoints follow standard HTTP request/response flow: extract parameters → validate → process → transform → return

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `GET /api/movies-on-demand/search`

**Handler**: `searchMovies()`

**Description**: Searches for movies using TMDB's search API endpoint.

**Implementation**:

-   Validate query parameter is present and non-empty
-   Call TMDB API: `GET /3/search/movie?query={query}&page={page}`
-   Transform TMDB response to match API contract schema

### `GET /api/movies-on-demand/popular`

**Handler**: `getPopularMovies()`

**Description**: Retrieves popular movies from TMDB's popular movies endpoint.

**Implementation**:

-   Call TMDB API: `GET /3/movie/popular?page={page}`
-   Transform TMDB response to match API contract schema

### `GET /api/movies-on-demand/top`

**Handler**: `getTopMovies()`

**Description**: Retrieves top-rated movies of all time from TMDB's top rated endpoint.

**Implementation**:

-   Call TMDB API: `GET /3/movie/top_rated?page={page}`
-   Transform TMDB response to match API contract schema

### `GET /api/movies-on-demand/movies/{id}`

**Handler**: `getMovieDetails()`

**Description**: Retrieves detailed movie information including cast, crew, production details from TMDB, and current job status if the movie is being fetched or ready.

**Implementation**:

-   Call TMDB API: `GET /3/movie/{id}?append_to_response=credits` (includes cast and crew)
-   Query D1 for the most recent job for this movie ID: `SELECT * FROM jobs WHERE movie_id = ? ORDER BY created_at DESC LIMIT 1`
-   If job exists, include `job_status` in response (job_id, status, progress, error_message)
-   Transform TMDB response to match API contract schema

### `GET /api/movies-on-demand/movies/{id}/releases`

**Handler**: `getMovieReleases()`

**Description**: Retrieves available Usenet releases for a movie from NZBGeek API.

**Implementation**:

-   Get movie details from TMDB to obtain IMDb ID
-   If no IMDb ID, return empty releases list
-   Call NZBGeek API: `GET /api?t=movie&imdbid={imdb_id}&apikey={key}`
-   Parse NZBGeek XML/JSON response
-   Extract release information (ID, title, size, NZB URL)
-   Parse release titles to extract metadata: `Movie.Title.2024.1080p.BluRay.x264-GROUP` (quality, codec, source, group)
-   Sort releases by quality preference (1080p → 720p → 4K → others)
-   Filter for movie releases only and limit to ~20 results

### `POST /api/movies-on-demand/movies/{id}/fetch`

**Handler**: `fetchMovie()`

**Description**: Initiates on-demand acquisition of a movie from Usenet. Creates a job that downloads, prepares, and makes the movie available for streaming. Always starts a download job.

**Implementation**:

-   Parse request body: `mode` (auto/manual), `release_id`, `quality_preference`
-   Validate mode is "auto" or "manual"
-   Validate inputs based on mode:
    -   Manual mode: `release_id` is **required** (return 400 if missing)
    -   Auto mode: `release_id` is optional (will select best release automatically)
-   Select release:
    -   Auto mode: Choose best release based on `quality_preference` (default 1080p)
        -   Prefer quality matching `quality_preference`
        -   Prefer BluRay/WEB-DL over CAM/HDTS
        -   Prefer smaller file sizes within same quality tier
        -   Prefer known release groups
    -   Manual mode: Use specified `release_id`
-   Generate unique job ID: `job_{timestamp}_{random}`
-   Create job record in D1 with status "queued"
-   Enqueue job to Cloudflare Queue for processing
-   Job processing happens asynchronously in Queue consumer (see Queue Consumer section)

### `GET /api/movies-on-demand/jobs/{jobId}`

**Handler**: `getJobStatus()`

**Description**: Retrieves the current status of a movie acquisition job.

**Implementation**:

-   Query D1 for job details: `SELECT * FROM jobs WHERE job_id = ?`
-   Return job status per API contract (job_id, movie_id, status, progress, error_message, release_title, timestamps)

### `GET /api/movies-on-demand/jobs`

**Handler**: `listJobs()`

**Description**: Retrieves a list of all active jobs (queued, downloading, preparing, ready).

**Implementation**:

-   Extract optional `status` query parameter
-   Query D1: `SELECT * FROM jobs WHERE status = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?`
-   If no status provided, include all active statuses (queued, downloading, preparing, ready)
-   Exclude deleted jobs from listing

### `GET /api/movies-on-demand/movies/{id}/stream`

**Handler**: `getMovieStream()`

**Description**: Retrieves the streaming URL for a movie that is ready. Returns a signed URL or direct stream URL from R2.

**Implementation**:

-   Extract `id` from path parameters (can be movie_id or job_id; treat as string to support both formats)
-   Determine if ID is movie_id or job_id:
    -   If starts with "job\_", it's a job_id
    -   Otherwise, assume movie_id and query D1 for the latest job: `SELECT * FROM jobs WHERE movie_id = ? ORDER BY created_at DESC LIMIT 1`
-   Verify job status is "ready"
-   Update `last_watched_at` in the `jobs` table: `UPDATE jobs SET last_watched_at = ?, updated_at = ? WHERE job_id = ?`
-   Generate R2 presigned URL for streaming (R2 key: `movies/{job_id}/movie.{ext}`, expiration: 4 hours)
-   Get content type and file size from R2 metadata

### `GET /api/movies-on-demand/movies/{id}/similar`

**Handler**: `getSimilarMovies()`

**Description**: Retrieves movies similar to the specified movie from TMDB.

**Implementation**:

-   Call TMDB API: `GET /3/movie/{id}/similar?page={page}`
-   Transform TMDB response to match API contract schema

## Data Models

> **Note**: API request/response types are defined in `API_CONTRACT.yml`. This section covers internal data models only.

### D1 Storage Schema

We store job state and metadata in a relational schema in D1. This enables rich queries, indexing, pagination, and reliable updates. The D1 schema (SQLite-compatible) includes the following tables:

```sql
-- Jobs: tracks lifecycle of each fetch/download job
CREATE TABLE IF NOT EXISTS jobs (
    job_id TEXT PRIMARY KEY,
    movie_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    progress REAL,
    release_title TEXT,
    release_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    ready_at TEXT,
    expires_at TEXT,
    last_watched_at TEXT,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_movie_id ON jobs(movie_id);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);

-- Watch history: persisted metadata about movies watched
CREATE TABLE IF NOT EXISTS watch_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    title TEXT,
    poster_path TEXT,
    last_watched_at TEXT NOT NULL,
    job_id TEXT,
    status TEXT
);
CREATE INDEX IF NOT EXISTS idx_watch_last_watched ON watch_history(last_watched_at DESC);

-- Optional: store a cached TMDB metadata row for faster reads
CREATE TABLE IF NOT EXISTS movie_metadata (
    movie_id INTEGER PRIMARY KEY,
    title TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    overview TEXT,
    updated_at TEXT
);
```

**Notes:**

-   Use `jobs.movie_id` to map movies to latest jobs — a separate mapping key is not required.
-   `watch_history` preserves recently watched metadata; it is append-only.
-   Indexes provide efficient filtering (by status, by expiration, by movie_id).

**Job Lifecycle States**:

1. `queued` - Job created, waiting in Queue
2. `downloading` - Downloading from Usenet (progress tracked)
3. `preparing` - Processing/uploading to R2
4. `ready` - Available for streaming
5. `error` - Failed (error_message populated)
6. `deleted` - Expired and removed from R2

### Internal Type Mapping

Map external API responses (TMDB, NZBGeek) to the API contract format. Reference external API documentation for response structures:

-   TMDB API: See `third-party-docs/themoviedb/` for response schemas
-   NZBGeek API: Returns RSS/XML feed with release items (title, size, guid, link)
-   Parse release titles to extract metadata: `Movie.Title.2024.1080p.BluRay.x264-GROUP` (quality, codec, source, group)

## Cloudflare Services

### External API: The Movie Database (TMDB)

**Documentation**: `third-party-docs/themoviedb/`

**Usage**:

-   Search movies via REST API
-   Retrieve popular and top-rated movies
-   Fetch movie details with cast, crew, and IMDb ID
-   Get similar movie recommendations
-   No local storage needed for TMDB data (stateless proxy)

**API Endpoints**:

-   `GET https://api.themoviedb.org/3/search/movie` - Search movies
-   `GET https://api.themoviedb.org/3/movie/popular` - Get popular movies
-   `GET https://api.themoviedb.org/3/movie/top_rated` - Get top-rated movies
-   `GET https://api.themoviedb.org/3/movie/{id}` - Get movie details
-   `GET https://api.themoviedb.org/3/movie/{id}/similar` - Get similar movies

**Configuration**:

-   `TMDB_API_KEY`: TMDB API authentication key (required)

**Authentication**:

-   TMDB API uses Bearer token authentication
-   API key should be sent in `Authorization` header: `Bearer {TMDB_API_KEY}`

### External API: NZBGeek

**Documentation**: Usenet indexer for finding movie releases

**Usage**:

-   Search for movie releases by IMDb ID
-   Get NZB download URLs
-   Returns release metadata (quality, size, source)

**API Endpoints**:

-   `GET https://api.nzbgeek.info/api?t=movie&imdbid={imdb_id}&apikey={key}` - Search releases by IMDb ID

**Configuration**:

-   `NZBGEEK_API_KEY`: NZBGeek API authentication key (required)

**Authentication**:

-   API key passed as query parameter: `apikey={NZBGEEK_API_KEY}`

**Response Format**:

-   Returns RSS/XML feed with release items
-   Each item contains: title, size, guid (release ID), link (NZB URL)

### R2: Movie File Storage

**Binding**: `MOVIES_R2`

**Usage**:

-   Store downloaded movie files temporarily
-   Generate presigned URLs for streaming
-   Automatic cleanup based on TTL/expiration

**Key Structure**:

-   Movie files: `movies/{job_id}/movie.{ext}`
-   Each job gets unique folder

**Operations**:

```typescript
// Store movie file (done by Queue consumer)
await env.MOVIES_R2.put(`movies/${jobId}/movie.mp4`, movieFile, {
    customMetadata: {
        contentType: "video/mp4",
        movieId: String(movieId),
        uploadedAt: new Date().toISOString(),
    },
});

// Generate presigned URL for streaming (4 hour expiration)
const url = await env.MOVIES_R2.createSignedUrl(`movies/${jobId}/movie.mp4`, {
    expiresIn: 14400, // 4 hours in seconds
});

// Get movie file metadata
const object = await env.MOVIES_R2.head(`movies/${jobId}/movie.mp4`);
const size = object.size;
const contentType = object.customMetadata?.contentType;

// Delete expired movie
await env.MOVIES_R2.delete(`movies/${jobId}/movie.mp4`);
```

### D1: Job State and Mappings

**Binding**: `MOVIES_D1`

**Usage**:

-   Store job records and status as relational rows in D1
-   Map movie IDs to job rows via `jobs.movie_id` (no mapping keys required)
-   Track download progress and watch times with reliable updates and indexing

**Operations**:

```typescript
// Insert job record into D1
await env.MOVIES_D1.prepare(
    `INSERT INTO jobs (job_id, movie_id, status, release_title, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
)
    .bind(jobId, movieId, "queued", releaseTitle, createdAt, createdAt)
    .run();

// Concurrency: only one active job per movie
// Use a transaction to enforce uniqueness checks for active jobs
// Typical pattern:
// 1. BEGIN TRANSACTION
// 2. SELECT job_id FROM jobs WHERE movie_id = ? AND status IN ('queued','downloading','preparing','ready') LIMIT 1
// 3. If exists, return existing job_id
// 4. Else INSERT job and COMMIT
// Using a transaction prevents duplicated job creation in concurrent requests

// Get the latest job for a movie
const job = await env.MOVIES_D1.prepare(
    `SELECT * FROM jobs WHERE movie_id = ? ORDER BY created_at DESC LIMIT 1`
)
    .bind(movieId)
    .first();

// Get job by job_id
const job = await env.MOVIES_D1.prepare(`SELECT * FROM jobs WHERE job_id = ?`)
    .bind(jobId)
    .first();

// Update job status and progress
await env.MOVIES_D1.prepare(
    `UPDATE jobs SET status = ?, progress = ?, updated_at = ? WHERE job_id = ?`
)
    .bind(status, progress, updatedAt, jobId)
    .run();

// List jobs with status filter and pagination
const jobs = await env.MOVIES_D1.prepare(
    `SELECT * FROM jobs WHERE status = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?`
)
    .bind(status, limit, offset)
    .all();

// Update last_watched_at when streaming
await env.MOVIES_D1.prepare(
    `UPDATE jobs SET last_watched_at = ?, updated_at = ? WHERE job_id = ?`
)
    .bind(now, now, jobId)
    .run();

// Insert watch history row
await env.MOVIES_D1.prepare(
    `INSERT INTO watch_history (movie_id, title, poster_path, last_watched_at, job_id, status)
     VALUES (?, ?, ?, ?, ?, ?)`
)
    .bind(movieId, title, posterPath, now, jobId, status)
    .run();
```

### Queue: Asynchronous Movie Processing

**Binding**: `MOVIES_QUEUE`

**Usage**:

-   Trigger Container-based movie downloads asynchronously
-   Worker queue handler receives job message and spins up Cloudflare Container
-   Container handles heavy lifting (NZB parsing, Usenet downloads, file processing)

**Message Format**:

-   `job_id`: string
-   `movie_id`: number
-   `release_id`: string
-   `nzb_url`: string
-   `release_title`: string

**Queue Consumer Logic (Worker Handler)**:

-   Receive job message from Queue
-   Update job status to "downloading" (progress: 0%) in D1
-   Spin up Cloudflare Container instance, passing job details (job_id, nzb_url, Usenet credentials, R2 destination)
-   Container handles the rest (see Container Processing Logic below)

**Container Processing Logic**:

-   Download NZB file from NZBGeek URL
-   Parse NZB (XML) to extract Usenet article references
-   Connect to Usenet servers (NNTP protocol) using Usenet client (e.g., SABnzbd, NZBGet)
-   Download movie file from Usenet (track progress, update D1 periodically)
-   Verify and repair using parity data if available
-   Unpack/reconstruct final movie file
-   Update job status to "preparing" in D1
-   Upload movie file to R2 storage: `movies/{job_id}/movie.{ext}`
-   Update job status to "ready" and set expiration timestamp (24 hours after ready) in D1
-   Clean up local temporary data and exit
-   On error: Update job status to "error" with error_message in D1

**Operations**:

```typescript
// Enqueue job
await env.MOVIES_QUEUE.send({
    job_id: jobId,
    movie_id: movieId,
    release_id: releaseId,
    nzb_url: nzbUrl,
    release_title: releaseTitle,
});
```

### Containers: Heavy Movie Processing

**Binding**: `MOVIES_CONTAINER`

**Usage**:

-   Run resource-intensive Usenet downloads and file processing
-   Execute Usenet clients (e.g., SABnzbd, NZBGet) that require full Linux environment
-   Handle binary operations, large file processing, and unpacking
-   Short-lived, job-specific instances that spin up on-demand

**Why Containers**:

-   Workers have CPU/memory limits and cannot easily run binary Usenet clients
-   Containers provide full Linux environment with required runtime dependencies
-   Ephemeral instances scale to zero when not in use

**Container Operations**:

-   Worker queue handler spins up container instance via `getContainer()` API
-   Container receives job details (job_id, nzb_url, Usenet credentials, R2 destination)
-   Container processes job independently and updates D1 status throughout lifecycle
-   Container exits after completion, allowing instance to go idle

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Parse request (query parameters, path parameters, request body)
3. Validate input
4. Process based on endpoint:

   TMDB Discovery:
   - Search movies (GET /search) → Call TMDB API
   - Get popular movies (GET /popular) → Call TMDB API
   - Get top movies (GET /top) → Call TMDB API
    - Get movie details (GET /movies/{id}) → Call TMDB + check D1 for job status
   - Get similar movies (GET /movies/{id}/similar) → Call TMDB API

   Usenet Integration:
   - Get releases (GET /movies/{id}/releases) → Get IMDb ID from TMDB, call NZBGeek
   - Fetch movie (POST /movies/{id}/fetch) → Validate, create job, enqueue to Queue

   Job Management:
    - Get job status (GET /jobs/{jobId}) → Query D1
    - List jobs (GET /jobs) → Query D1 with SQL filters and pagination

   Streaming:
    - Get stream URL (GET /movies/{id}/stream) → Check D1 for ready job, generate R2 presigned URL

5. Transform response to API contract format
6. Return response
```

### Queue Consumer Processing Flow

**Worker Queue Handler:**

1. Receive job message from Queue
2. Update job status to "downloading" (0%) in D1
3. Spin up Cloudflare Container instance with job details
4. Container takes over processing

**Container Processing:**

1. Download NZB file from NZBGeek URL
2. Parse NZB XML to extract Usenet article references
3. Connect to Usenet servers (NNTP protocol) using Usenet client
4. Download movie file parts (update progress in D1 periodically)
5. Verify and repair using parity data if available
6. Reassemble/unpack parts into complete movie file
7. Update job status to "preparing" in D1
8. Upload movie file to R2 storage
9. Update job status to "ready" and set expiration timestamp (24 hours) in D1
10. Clean up local temporary data and exit

On error: Container updates job status to "error" with error_message in D1

### Error Handling

> Error response format is defined in `API_CONTRACT.yml`. Focus on error catching and mapping logic.

```typescript
// Use shared error handler from backend/src/lib/error-handling.ts
import { handleError } from "../lib/error-handling";

app.get("/movies/:id", async (c) => {
    try {
        const movieId = parseInt(c.req.param("id"), 10);
        if (isNaN(movieId)) {
            return c.json(
                { error: "Invalid movie ID", code: "INVALID_INPUT" },
                400
            );
        }

        // Call TMDB API
        const tmdbResponse = await fetch(tmdbUrl, {
            headers: {
                Authorization: `Bearer ${c.env.TMDB_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        if (!tmdbResponse.ok) {
            if (tmdbResponse.status === 404) {
                return c.json(
                    { error: "Movie not found", code: "NOT_FOUND" },
                    404
                );
            }
            return c.json({ error: "TMDB API error", code: "TMDB_ERROR" }, 502);
        }

        const tmdbData = await tmdbResponse.json();

        // Check for active job (query D1 for latest job)
        const job = await c.env.MOVIES_D1.prepare(
            `SELECT * FROM jobs WHERE movie_id = ? ORDER BY created_at DESC LIMIT 1`
        )
            .bind(movieId)
            .first();
        let jobStatus = null;
        if (job) {
            jobStatus = {
                job_id: job.job_id,
                status: job.status,
                progress: job.progress,
                error_message: job.error_message,
            };
        }

        return c.json({
            ...transformTMDBMovie(tmdbData),
            job_status: jobStatus,
        });
    } catch (error) {
        const { response, status } = handleError(error, {
            endpoint: "/api/movies-on-demand/movies/:id",
            method: "GET",
        });
        return c.json(response, status);
    }
});
```

## Validation

> **Note**: Basic validation rules (required fields, types, formats) are defined in `API_CONTRACT.yml`. This section covers implementation-specific validation only.

### Implementation-Specific Validation

```typescript
// Validate search query
function validateSearchQuery(query: string): { ok: boolean; error?: string } {
    if (!query || query.trim().length === 0) {
        return { ok: false, error: "Query parameter 'query' is required" };
    }
    return { ok: true };
}

// Validate movie ID
function validateMovieId(id: string): {
    ok: boolean;
    error?: string;
    id?: number;
} {
    const movieId = parseInt(id, 10);
    if (isNaN(movieId) || movieId <= 0) {
        return { ok: false, error: "Invalid movie ID" };
    }
    return { ok: true, id: movieId };
}

// Validate page number
function validatePage(page: string | null): number {
    if (!page) return 1;
    const pageNum = parseInt(page, 10);
    return isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
}

// Validate fetch mode
function validateFetchMode(
    mode: string,
    releaseId?: string
): {
    ok: boolean;
    error?: string;
} {
    if (mode !== "auto" && mode !== "manual") {
        return { ok: false, error: "Mode must be 'auto' or 'manual'" };
    }
    if (mode === "manual" && !releaseId) {
        return {
            ok: false,
            error: "Manual mode requires 'release_id'. Use GET /releases endpoint first to get available releases.",
        };
    }
    return { ok: true };
}

// Validate quality preference
function validateQualityPreference(quality?: string): boolean {
    if (!quality) return true; // Optional
    return ["720p", "1080p", "4K"].includes(quality);
}
```

### Business Rules

-   Search query must be non-empty (trimmed)
-   Movie ID must be a positive integer
-   Page number defaults to 1 if not provided or invalid
-   All TMDB API calls require valid API key
-   TMDB API rate limits should be respected
-   Fetch mode must be "auto" or "manual"
-   Manual mode **requires** `release_id` parameter (clients must call GET /releases first)
-   Auto mode selects best release based on quality preference
-   Quality preference must be "720p", "1080p", or "4K" (defaults to "1080p")
-   Movies expire 24 hours after becoming ready
-   Only one active job per movie (prevent duplicate downloads)
-   Job IDs must be unique (use timestamp + random for uniqueness)

## Security Considerations

### Authentication

-   No user authentication required for discovery endpoints (TMDB data is public)
-   Consider adding authentication for fetch/streaming endpoints (optional)
-   API keys stored securely in Cloudflare Workers environment variables

### Authorization

-   Consider rate limiting fetch requests to prevent abuse
-   Consider usage quotas per IP/user if authentication added
-   Monitor Queue consumer for resource exhaustion

### Input Sanitization

-   URL-encode query parameters before sending to TMDB and NZBGeek
-   Validate and sanitize movie IDs (must be integers)
-   Validate page numbers (must be positive integers)
-   Validate job IDs match expected format (prevent path traversal)
-   Sanitize release IDs before using in API calls
-   Validate NZB URLs before downloading (ensure from trusted NZBGeek domain)

### API Key Security

-   TMDB API key stored in Cloudflare Workers environment variables
-   NZBGeek API key stored in Cloudflare Workers environment variables
-   Usenet credentials (if needed) stored in environment variables
-   Never expose API keys in client-side code or logs
-   Use Bearer token authentication for TMDB API calls

### Content Security

-   Validate NZB file structure before parsing (prevent XML injection)
-   Limit movie file size (prevent storage exhaustion)
-   Scan downloaded files for malicious content (optional but recommended)
-   Use R2 signed URLs with short expiration (4 hours)
-   Implement automatic cleanup of expired movies
-   Monitor R2 storage usage

## Performance Optimization

### Caching Strategy

-   Consider caching popular and top-rated movie lists (they update daily)
-   Cache movie details from TMDB (rarely change)
-   Use Cloudflare Workers cache API or KV for short-term caching where helpful; D1 remains the source-of-truth for metadata
-   Cache TTL: 1 hour for popular/top lists, 24 hours for movie details
-   Cache NZBGeek release searches (short TTL, 15 minutes)
-   Job status stored in D1; short-term caching in Workers Cache or KV is optional for hot records

### Edge Computing Benefits

-   Requests served from edge locations globally
-   Low latency for movie search and browsing
-   TMDB API calls made from edge workers
-   Job status lookups from D1 at the edge; consider caching reads with Cloudflare Workers cache or KV for high-traffic items

### Queue Processing

-   Queue consumer handles heavy lifting (downloads, processing)
-   Decouples API requests from download operations
-   Prevents API timeouts during long-running downloads
-   Progress updates stored in D1 for polling (SQL writing; paginate for reads to limit bandwidth)

### Storage Optimization

-   Movies automatically deleted if not watched for 1 week (ephemeral storage)
-   Cleanup process checks `last_watched_at` timestamp in job records
-   If `last_watched_at` is null or older than 7 days, delete from R2 and set job status to `deleted` in D1
-   R2 storage lifecycle policies for automatic cleanup (backup)
-   Compress video during preparation phase (optional)
-   Use adaptive bitrate streaming for bandwidth optimization

### Watch Time Tracking

**Purpose**: Track when movies are watched to implement 1-week cleanup policy

**Storage**:

-   `last_watched_at` field in job record (`jobs.last_watched_at` in D1)
-   Updated when user requests stream URL or starts playback
-   Used by cleanup process to determine which movies to delete

**Cleanup Process**:

-   Scheduled Worker runs periodically (e.g., daily)
-   Scans all jobs with status "ready"
-   For each job:
    -   If `last_watched_at` is null and `ready_at` is older than 7 days → delete
    -   If `last_watched_at` exists and is older than 7 days → delete
-   Deletes movie file from R2
    -- Updates job status to "deleted" in D1 (set `status = 'deleted'` and `updated_at = ?`), and optionally delete R2 object
-   Optionally archives watch history metadata (without file reference)

**Example cleanup worker (D1 + R2)**:

```typescript
const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const rows = await env.MOVIES_D1.prepare(
    `SELECT job_id FROM jobs WHERE status = 'ready' AND ((last_watched_at IS NULL AND ready_at < ?) OR (last_watched_at IS NOT NULL AND last_watched_at < ?))`
)
    .bind(threshold, threshold)
    .all();

for (const row of rows.results) {
    const jobId = row.job_id;
    // Delete file from R2
    await env.MOVIES_R2.delete(`movies/${jobId}/movie.mp4`);
    // Mark job as deleted in D1
    await env.MOVIES_D1.prepare(
        `UPDATE jobs SET status = 'deleted', updated_at = ? WHERE job_id = ?`
    )
        .bind(new Date().toISOString(), jobId)
        .run();
}
```

## Implementation Checklist

### API Endpoints

-   [ ] GET /search endpoint
-   [ ] GET /popular endpoint
-   [ ] GET /top endpoint
-   [ ] GET /movies/{id} endpoint (with job status)
-   [ ] GET /movies/{id}/releases endpoint
-   [ ] POST /movies/{id}/fetch endpoint
-   [ ] GET /movies/{id}/similar endpoint
-   [ ] GET /movies/{id}/stream endpoint
-   [ ] GET /jobs/{jobId} endpoint
-   [ ] GET /jobs endpoint
-   [ ] Error handling (per API_CONTRACT.yml)

### Data Layer

-   [ ] TMDB API client functions
-   [ ] NZBGeek API client functions
-   [ ] Response transformation functions
-   [ ] Error mapping logic
-   [ ] R2 storage operations for movie files
-   [ ] D1 operations for job tracking
-   [ ] D1 queries for movie-to-job mappings (via `jobs.movie_id`)
-   [ ] Watch time tracking (last_watched_at updates)
-   [ ] Watch history metadata storage
-   [ ] Presigned URL generation for streaming
-   [ ] Release metadata parsing

### Business Logic

-   [ ] Input validation (search, movie IDs, fetch mode, quality)
-   [ ] TMDB API integration
-   [ ] NZBGeek API integration (search releases by IMDb ID)
-   [ ] Response transformation
-   [ ] Job creation and queueing
-   [ ] Best release selection logic (auto mode)
-   [ ] Stream URL generation (R2 presigned URLs)
-   [ ] Job status tracking
-   [ ] Watch time tracking (update last_watched_at on stream requests)
-   [ ] Cleanup process (scheduled worker to delete movies not watched for 1 week)

### Queue Consumer

-   [ ] Queue message handler
-   [ ] NZB file download
-   [ ] NZB XML parsing
-   [ ] Usenet client (NNTP protocol)
-   [ ] Movie file download with progress tracking
-   [ ] R2 upload logic
-   [ ] Job status updates throughout lifecycle
-   [ ] Error handling and recovery
-   [ ] Expiration timestamp setting

### Cleanup & Maintenance

-   [ ] Scheduled job for deleting expired movies
-   [ ] R2 lifecycle policies
-   [ ] D1 cleanup for old job records
-   [ ] Monitoring and alerting

## Dependencies

### Workers Libraries

-   Native Workers API (fetch)
-   `@cloudflare/workers-types` for types
-   Hono web framework
-   XML parser library for NZB files (e.g., `fast-xml-parser`)
-   Usenet/NNTP client library (custom or third-party)

## Error Codes

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

-   Missing or invalid query parameter → `INVALID_INPUT` (400)
-   Invalid movie ID format → `INVALID_INPUT` (400)
-   Invalid fetch mode → `INVALID_INPUT` (400)
-   Invalid quality preference → `INVALID_INPUT` (400)
-   Invalid job ID format → `INVALID_INPUT` (400)
-   Movie not ready for streaming → `INVALID_INPUT` (400)
-   TMDB API 404 response → `NOT_FOUND` (404)
-   Movie not found → `NOT_FOUND` (404)
-   Job not found → `NOT_FOUND` (404)
-   No releases available → `NOT_FOUND` (404)
-   TMDB API errors (4xx, 5xx) → `TMDB_ERROR` (502)
-   NZBGeek API errors (4xx, 5xx) → `NZBGEEK_ERROR` (502)
-   Usenet download failures → `USENET_ERROR` (502)
-   R2 storage errors → `STORAGE_ERROR` (502)
-   D1 access errors → `STORAGE_ERROR` (502)
-   File upload failures → `STORAGE_ERROR` (502)
-   Queue enqueue failures → `JOB_ERROR` (500)
-   Network errors → `INTERNAL_ERROR` (500)
-   Missing TMDB API key → `INTERNAL_ERROR` (500)
-   Missing NZBGeek API key → `INTERNAL_ERROR` (500)
-   Missing R2/D1/Queue bindings → `INTERNAL_ERROR` (500)
-   Unexpected errors → `INTERNAL_ERROR` (500)

## Monitoring & Logging

-   Log all TMDB API requests with response status codes
-   Log all NZBGeek API requests with response status codes
-   Log job creation, status changes, and completion
-   Log errors with context (endpoint, movie ID, job ID, query, etc.)
-   Monitor TMDB API rate limits and response times
-   Monitor NZBGeek API rate limits
-   Track error rates by endpoint
-   Monitor Queue processing time and failure rate
-   Track R2 storage usage and bandwidth
-   Monitor movie download success/failure rates
-   Alert on expired movie cleanup failures
-   Dashboard metrics:
-   Active jobs count
-   Movies ready for streaming count
-   Average download time
-   Storage usage trends
-   API error rates

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (TMDB API integration, response transformation, error mapping)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`

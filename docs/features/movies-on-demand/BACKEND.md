# Movies on Demand - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the Movies on Demand utility. An ephemeral movie streaming service that uses:

-   **TMDB API** for movie discovery and metadata
-   **NZBGeek API** for Usenet release searching
-   **Cloudflare infrastructure** for on-demand acquisition, storage, and streaming
-   **Job queue system** for asynchronous movie downloads and processing

Movies are fetched from Usenet on-demand and automatically deleted after viewing.

## Code Location

`backend/src/movies-on-demand/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/movies-on-demand/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `GET /api/movies-on-demand/search`

**Handler**: `searchMovies()`

**Description**: Searches for movies using TMDB's search API endpoint.

**Implementation Flow**:

1. Extract `query` and `page` query parameters
2. Validate query parameter is present and non-empty
3. Call TMDB API: `GET /3/search/movie?query={query}&page={page}`
4. Transform TMDB response to match API contract schema
5. Return response per API contract

**Implementation Notes**:

-   TMDB API requires API key in Authorization header
-   Query parameter must be URL-encoded
-   Page defaults to 1 if not provided
-   TMDB returns paginated results with 20 items per page

**Error Handling**:

-   Missing or empty query → `INVALID_INPUT` (400)
-   TMDB API errors → `TMDB_ERROR` (502)
-   Network errors → `INTERNAL_ERROR` (500)

### `GET /api/movies-on-demand/popular`

**Handler**: `getPopularMovies()`

**Description**: Retrieves popular movies from TMDB's popular movies endpoint.

**Implementation Flow**:

1. Extract `page` query parameter (defaults to 1)
2. Call TMDB API: `GET /3/movie/popular?page={page}`
3. Transform TMDB response to match API contract schema
4. Return response per API contract

**Implementation Notes**:

-   TMDB API requires API key in Authorization header
-   Page defaults to 1 if not provided
-   TMDB returns paginated results with 20 items per page

**Error Handling**:

-   TMDB API errors → `TMDB_ERROR` (502)
-   Network errors → `INTERNAL_ERROR` (500)

### `GET /api/movies-on-demand/top`

**Handler**: `getTopMovies()`

**Description**: Retrieves top-rated movies of all time from TMDB's top rated endpoint.

**Implementation Flow**:

1. Extract `page` query parameter (defaults to 1)
2. Call TMDB API: `GET /3/movie/top_rated?page={page}`
3. Transform TMDB response to match API contract schema
4. Return response per API contract

**Implementation Notes**:

-   TMDB API requires API key in Authorization header
-   Page defaults to 1 if not provided
-   TMDB returns paginated results with 20 items per page

**Error Handling**:

-   TMDB API errors → `TMDB_ERROR` (502)
-   Network errors → `INTERNAL_ERROR` (500)

### `GET /api/movies-on-demand/movies/{id}`

**Handler**: `getMovieDetails()`

**Description**: Retrieves detailed movie information including cast, crew, production details from TMDB, and current job status if the movie is being fetched or ready.

**Implementation Flow**:

1. Extract movie `id` from path parameters
2. Validate id is a valid integer
3. Call TMDB API: `GET /3/movie/{id}?append_to_response=credits`
4. Transform TMDB response to match API contract schema
5. Check KV for any active or completed job for this movie ID
6. If job exists, include `job_status` in response with:
    - job_id
    - status (queued, downloading, preparing, ready, error)
    - progress (if downloading)
    - error_message (if error)
7. Return response per API contract

**Implementation Notes**:

-   TMDB API requires API key in Authorization header
-   Uses `append_to_response=credits` to get cast and crew in single request
-   TMDB movie details include extensive metadata
-   Job status lookup: check KV for key `job:movie:{movie_id}` to get current job_id
-   Then fetch job details from `job:{job_id}` key

**Error Handling**:

-   Invalid movie ID → `INVALID_INPUT` (400)
-   Movie not found → `NOT_FOUND` (404)
-   TMDB API errors → `TMDB_ERROR` (502)
-   Network errors → `INTERNAL_ERROR` (500)

### `GET /api/movies-on-demand/movies/{id}/releases`

**Handler**: `getMovieReleases()`

**Description**: Retrieves available Usenet releases for a movie from NZBGeek API.

**Implementation Flow**:

1. Extract movie `id` from path parameters
2. Validate id is a valid integer
3. Get movie details from TMDB to obtain IMDb ID
4. If no IMDb ID, return empty releases list
5. Call NZBGeek API: `GET /api?t=movie&imdbid={imdb_id}&apikey={key}`
6. Parse NZBGeek XML/JSON response
7. Extract release information:
    - Release ID
    - Title (parse quality, codec, source, group from title)
    - Size (in bytes)
    - NZB download URL
8. Sort releases by quality preference (1080p → 720p → 4K → others)
9. Transform to API contract schema
10. Return response per API contract

**Implementation Notes**:

-   NZBGeek API requires API key as query parameter
-   NZBGeek returns releases in XML or JSON format (depending on API call)
-   Parse release titles to extract metadata: `Movie.Title.2024.1080p.BluRay.x264-GROUP`
-   Quality detection: look for `720p`, `1080p`, `2160p` (4K), etc.
-   Filter for movie releases only (not TV shows)
-   Limit results to reasonable number (e.g., 20 releases)

**Error Handling**:

-   Invalid movie ID → `INVALID_INPUT` (400)
-   Movie not found on TMDB → `NOT_FOUND` (404)
-   No IMDb ID available → Return empty releases list (not an error)
-   NZBGeek API errors → `NZBGEEK_ERROR` (502)
-   Network errors → `INTERNAL_ERROR` (500)

### `POST /api/movies-on-demand/movies/{id}/fetch`

**Handler**: `fetchMovie()`

**Description**: Initiates on-demand acquisition of a movie from Usenet. Creates a job that downloads, prepares, and makes the movie available for streaming. Always starts a download job.

**Implementation Flow**:

1. Extract movie `id` from path parameters
2. Parse request body: `mode` (auto/manual), `release_id`, `quality_preference`
3. Validate mode is "auto" or "manual"
4. Validate inputs based on mode:
    - Manual mode: `release_id` is **required** (return 400 if missing)
    - Auto mode: `release_id` is optional (will select best release automatically)
5. Select release:
    - Auto mode: Choose best release based on `quality_preference` (default 1080p)
    - Manual mode: Use specified `release_id`
6. Generate unique job ID: `job_{timestamp}_{random}`
7. Create job record in KV with status "queued"
8. Enqueue job to Cloudflare Queue for processing
9. Store job metadata in KV:
    - Key: `job:{job_id}` → full job details
    - Key: `job:movie:{movie_id}` → maps movie to current job_id
10. Return job_id and status per API contract

**Implementation Notes**:

-   This endpoint **always** initiates a download job
-   Clients should use `GET /api/movies-on-demand/movies/{id}/releases` first to get available releases for manual selection
-   Job processing happens asynchronously in Queue consumer
-   Queue consumer will:

1. Download NZB file from NZBGeek
2. Parse NZB file to get Usenet article references
3. Download movie file from Usenet servers (using NZB metadata)
4. Upload to R2 storage: `movies/{job_id}/movie.{ext}`
5. Update job status throughout: queued → downloading → preparing → ready
6. Set expiration timestamp (e.g., 24 hours after ready)

-   Best release selection logic (auto mode):
-   Prefer quality matching `quality_preference`
-   Prefer BluRay/WEB-DL over CAM/HDTS
-   Prefer smaller file sizes within same quality tier
-   Prefer known release groups

**Error Handling**:

-   Invalid movie ID → `INVALID_INPUT` (400)
-   Invalid mode → `INVALID_INPUT` (400)
-   Manual mode without release_id → `INVALID_INPUT` (400)
-   Movie not found → `NOT_FOUND` (404)
-   No releases available → `NOT_FOUND` (404)
-   NZBGeek API errors → `NZBGEEK_ERROR` (502)
-   Queue enqueue errors → `JOB_ERROR` (500)

### `GET /api/movies-on-demand/jobs/{jobId}`

**Handler**: `getJobStatus()`

**Description**: Retrieves the current status of a movie acquisition job.

**Implementation Flow**:

1. Extract `jobId` from path parameters
2. Query KV for job details: `job:{jobId}`
3. If not found, return 404
4. Return job status per API contract with:
    - job_id
    - movie_id
    - status
    - progress (if downloading)
    - error_message (if error)
    - release_title
    - timestamps (created_at, updated_at, ready_at, expires_at)

**Implementation Notes**:

-   Job details stored in KV with key: `job:{job_id}`
-   Job progress updated by Queue consumer during download
-   Expiration timestamp set when status becomes "ready"

**Error Handling**:

-   Job not found → `NOT_FOUND` (404)
-   KV errors → `INTERNAL_ERROR` (500)

### `GET /api/movies-on-demand/jobs`

**Handler**: `listJobs()`

**Description**: Retrieves a list of all active jobs (queued, downloading, preparing, ready).

**Implementation Flow**:

1. Extract optional `status` query parameter
2. Query KV for all jobs with prefix: `job:`
3. Filter out job:movie:{id} mapping keys (they start differently)
4. If status filter provided, filter jobs by status
5. Sort by updated_at DESC (most recent first)
6. Return jobs list per API contract

**Implementation Notes**:

-   KV prefix query: `job:` returns all job records
-   Exclude deleted jobs from listing
-   Consider pagination if job list becomes large

**Error Handling**:

-   KV errors → `INTERNAL_ERROR` (500)

### `GET /api/movies-on-demand/movies/{id}/stream`

**Handler**: `getMovieStream()`

**Description**: Retrieves the streaming URL for a movie that is ready. Returns a signed URL or direct stream URL from R2.

**Implementation Flow**:

1. Extract `id` from path parameters (can be movie_id or job_id; treat as string to support both formats)
2. Determine if ID is movie_id or job_id:
    - If starts with "job\_", it's a job_id
    - Otherwise, assume movie_id and lookup current job: `job:movie:{movie_id}`
3. Get job details from KV
4. Verify job status is "ready"
5. Generate R2 presigned URL for streaming:
    - R2 key: `movies/{job_id}/movie.{ext}`
    - Expiration: 4 hours
6. Get content type and file size from R2 metadata
7. Return stream URL per API contract

**Implementation Notes**:

-   R2 presigned URLs valid for 4 hours
-   Movie files stored at: `movies/{job_id}/movie.{ext}`
-   Content type detected from file extension: mp4, mkv, avi
-   File size included for client buffering hints
-   Path parameter remains a string throughout validation to avoid incorrectly rejecting legitimate job IDs with the `job_` prefix

**Error Handling**:

-   Invalid ID format → `INVALID_INPUT` (400)
-   Job not found → `NOT_FOUND` (404)
-   Movie not ready (status != "ready") → `INVALID_INPUT` (400)
-   R2 access errors → `STORAGE_ERROR` (502)
-   Presigned URL generation errors → `STORAGE_ERROR` (502)

### `GET /api/movies-on-demand/movies/{id}/similar`

**Handler**: `getSimilarMovies()`

**Description**: Retrieves movies similar to the specified movie from TMDB.

**Implementation Flow**:

1. Extract movie `id` from path parameters and `page` from query
2. Validate id is a valid integer
3. Call TMDB API: `GET /3/movie/{id}/similar?page={page}`
4. Transform TMDB response to match API contract schema
5. Return response per API contract

**Implementation Notes**:

-   TMDB API requires API key in Authorization header
-   Page defaults to 1 if not provided
-   TMDB returns paginated results with 20 items per page

**Error Handling**:

-   Invalid movie ID → `INVALID_INPUT` (400)
-   Movie not found → `NOT_FOUND` (404)
-   TMDB API errors → `TMDB_ERROR` (502)
-   Network errors → `INTERNAL_ERROR` (500)

## Data Models

> **Note**: API request/response types are defined in `API_CONTRACT.yml`. This section covers internal data models only.

### KV Storage Structure

**Job Records**: `job:{job_id}`

-   Stores full job details (status, progress, timestamps, release info)
-   Updated throughout job lifecycle by Queue consumer

**Movie-to-Job Mapping**: `job:movie:{movie_id}`

-   Maps TMDB movie ID to current/most recent job_id
-   Used to check if movie is already being fetched or ready
-   Value is simple string: `job_abc123`

**Job Lifecycle States**:

1. `queued` - Job created, waiting in Queue
2. `downloading` - Downloading from Usenet (progress tracked)
3. `preparing` - Processing/uploading to R2
4. `ready` - Available for streaming
5. `error` - Failed (error_message populated)
6. `deleted` - Expired and removed from R2

### Internal TypeScript Types

> Only include types NOT defined in the API contract (e.g., TMDB response types, NZBGeek types, internal utilities)

```typescript
// TMDB API response types (internal representation)
interface TMDBMovieResponse {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
}

interface TMDBMovieDetailsResponse extends TMDBMovieResponse {
    runtime: number | null;
    imdb_id: string | null;
    genres: Array<{ id: number; name: string }>;
    production_companies: Array<{
        id: number;
        name: string;
        logo_path: string | null;
    }>;
    budget: number;
    revenue: number;
    credits: {
        cast: Array<{
            id: number;
            name: string;
            character: string;
            profile_path: string | null;
        }>;
        crew: Array<{
            id: number;
            name: string;
            job: string;
            profile_path: string | null;
        }>;
    };
}

interface TMDBSearchResponse {
    page: number;
    results: TMDBMovieResponse[];
    total_pages: number;
    total_results: number;
}

// NZBGeek API response types (internal representation)
interface NZBGeekRelease {
    guid: string; // Release ID
    title: string; // Full release title
    size: number; // Size in bytes
    link: string; // NZB download URL
    pubDate: string; // Publication date
    // Additional fields from NZBGeek API
}

interface NZBGeekSearchResponse {
    channel: {
        item: NZBGeekRelease[];
    };
}

// Job Queue message types (internal)
interface MovieFetchJobMessage {
    job_id: string;
    movie_id: number;
    release_id: string;
    nzb_url: string;
    release_title: string;
}

// Release metadata parser (internal utility)
interface ParsedRelease {
    quality: string; // "720p" | "1080p" | "4K" | "unknown"
    codec: string | null; // "x264" | "x265" | "HEVC" | null
    source: string | null; // "BluRay" | "WEB-DL" | "WEBRip" | null
    group: string | null; // Release group name
}

// Helper function to transform TMDB response to API contract format
function transformTMDBMovie(tmdbMovie: TMDBMovieResponse): Movie {
    return {
        id: tmdbMovie.id,
        title: tmdbMovie.title,
        overview: tmdbMovie.overview,
        release_date: tmdbMovie.release_date,
        poster_path: tmdbMovie.poster_path,
        backdrop_path: tmdbMovie.backdrop_path,
        vote_average: tmdbMovie.vote_average,
        vote_count: tmdbMovie.vote_count,
        popularity: tmdbMovie.popularity,
        genre_ids: tmdbMovie.genre_ids,
    };
}

// Helper function to parse release title metadata
function parseReleaseTitle(title: string): ParsedRelease {
    // Parse: "Movie.Title.2024.1080p.BluRay.x264-GROUP"
    const quality = title.match(/\d{3,4}p/)?.[0] || "unknown";
    const codec = title.match(/x26[45]|HEVC/i)?.[0] || null;
    const source = title.match(/BluRay|WEB-DL|WEBRip|HDTV/i)?.[0] || null;
    const group = title.split("-").pop() || null;

    return { quality, codec, source, group };
}
```

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

### KV: Job State and Mappings

**Binding**: `MOVIES_KV`

**Usage**:

-   Store job records and status
-   Map movie IDs to job IDs
-   Track download progress

**Key Structure**:

-   Job details: `job:{job_id}` → full JobStatus object
-   Movie mapping: `job:movie:{movie_id}` → current job_id string

**Operations**:

```typescript
// Create job record
await env.MOVIES_KV.put(
    `job:${jobId}`,
    JSON.stringify({
        job_id: jobId,
        movie_id: movieId,
        status: "queued",
        release_title: releaseTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    })
);

// Map movie to job
await env.MOVIES_KV.put(`job:movie:${movieId}`, jobId);

// Update job status
const job = JSON.parse(await env.MOVIES_KV.get(`job:${jobId}`));
job.status = "downloading";
job.progress = 25.5;
job.updated_at = new Date().toISOString();
await env.MOVIES_KV.put(`job:${jobId}`, JSON.stringify(job));

// Get job for movie
const jobId = await env.MOVIES_KV.get(`job:movie:${movieId}`);
if (jobId) {
    const job = JSON.parse(await env.MOVIES_KV.get(`job:${jobId}`));
}

// List all jobs
const jobs = await env.MOVIES_KV.list({ prefix: "job:" });
```

### Queue: Asynchronous Movie Processing

**Binding**: `MOVIES_QUEUE`

**Usage**:

-   Process movie downloads asynchronously
-   Handle NZB parsing and Usenet downloads
-   Update job status throughout lifecycle
-   Upload to R2 when complete

**Message Format**:

```typescript
interface MovieFetchJobMessage {
    job_id: string;
    movie_id: number;
    release_id: string;
    nzb_url: string;
    release_title: string;
}
```

**Queue Consumer Logic**:

```typescript
// Pseudocode for Queue consumer
async function processMovieFetchJob(message: MovieFetchJobMessage, env: Env) {
    const { job_id, movie_id, nzb_url, release_title } = message;

    try {
        // 1. Update status: downloading
        await updateJobStatus(env.MOVIES_KV, job_id, "downloading", 0);

        // 2. Download NZB file from NZBGeek
        const nzbContent = await fetch(nzb_url).then((r) => r.text());

        // 3. Parse NZB (XML) to get Usenet article references
        const articles = parseNZB(nzbContent);

        // 4. Download movie from Usenet (track progress)
        const movieFile = await downloadFromUsenet(articles, (progress) => {
            updateJobStatus(env.MOVIES_KV, job_id, "downloading", progress);
        });

        // 5. Update status: preparing
        await updateJobStatus(env.MOVIES_KV, job_id, "preparing");

        // 6. Upload to R2
        await env.MOVIES_R2.put(`movies/${job_id}/movie.mp4`, movieFile);

        // 7. Update status: ready (set expiration timestamp)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await updateJobStatus(env.MOVIES_KV, job_id, "ready", 100, {
            ready_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
        });
    } catch (error) {
        // Update status: error
        await updateJobStatus(env.MOVIES_KV, job_id, "error", null, {
            error_message: error.message,
        });
    }
}
```

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
   - Get movie details (GET /movies/{id}) → Call TMDB + check KV for job status
   - Get similar movies (GET /movies/{id}/similar) → Call TMDB API

   Usenet Integration:
   - Get releases (GET /movies/{id}/releases) → Get IMDb ID from TMDB, call NZBGeek
   - Fetch movie (POST /movies/{id}/fetch) → Validate, create job, enqueue to Queue

   Job Management:
   - Get job status (GET /jobs/{jobId}) → Query KV
   - List jobs (GET /jobs) → Query KV with prefix

   Streaming:
   - Get stream URL (GET /movies/{id}/stream) → Check KV for ready job, generate R2 presigned URL

5. Transform response to API contract format
6. Return response
```

### Queue Consumer Processing Flow

```
Queue Consumer (background worker):
1. Receive job message from Queue
2. Update job status: downloading (0%)
3. Download NZB file from NZBGeek URL
4. Parse NZB XML to extract Usenet article references
5. Connect to Usenet servers (NNTP protocol)
6. Download movie file parts (update progress in KV)
7. Reassemble parts into complete movie file
8. Update job status: preparing
9. Upload movie file to R2 storage
10. Update job status: ready
11. Set expiration timestamp (24 hours)
12. Job complete

On error: Update status to "error" with error_message
```

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

        // Check for active job
        const jobId = await c.env.MOVIES_KV.get(`job:movie:${movieId}`);
        let jobStatus = null;
        if (jobId) {
            const job = await c.env.MOVIES_KV.get(`job:${jobId}`);
            if (job) {
                const jobData = JSON.parse(job);
                jobStatus = {
                    job_id: jobData.job_id,
                    status: jobData.status,
                    progress: jobData.progress,
                    error_message: jobData.error_message,
                };
            }
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
-   Use Cloudflare Workers cache API or KV for short-term caching
-   Cache TTL: 1 hour for popular/top lists, 24 hours for movie details
-   Cache NZBGeek release searches (short TTL, 15 minutes)
-   Job status cached in KV (no additional caching needed)

### Edge Computing Benefits

-   Requests served from edge locations globally
-   Low latency for movie search and browsing
-   TMDB API calls made from edge workers
-   Job status lookups from KV at edge

### Queue Processing

-   Queue consumer handles heavy lifting (downloads, processing)
-   Decouples API requests from download operations
-   Prevents API timeouts during long-running downloads
-   Progress updates stored in KV for polling

### Storage Optimization

-   Movies automatically deleted after 24 hours (ephemeral storage)
-   R2 storage lifecycle policies for automatic cleanup
-   Compress video during preparation phase (optional)
-   Use adaptive bitrate streaming for bandwidth optimization

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
-   [ ] KV operations for job tracking
-   [ ] KV operations for movie-to-job mappings
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
-   [ ] KV cleanup for old job records
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
-   KV access errors → `STORAGE_ERROR` (502)
-   File upload failures → `STORAGE_ERROR` (502)
-   Queue enqueue failures → `JOB_ERROR` (500)
-   Network errors → `INTERNAL_ERROR` (500)
-   Missing TMDB API key → `INTERNAL_ERROR` (500)
-   Missing NZBGeek API key → `INTERNAL_ERROR` (500)
-   Missing R2/KV/Queue bindings → `INTERNAL_ERROR` (500)
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

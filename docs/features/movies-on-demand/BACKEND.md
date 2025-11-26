# Movies on Demand - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the Movies on Demand utility. Handles TMDB API integration for searching movies, retrieving popular and trending films, fetching movie details, and getting similar movie recommendations.

## Code Location

`backend/src/routes/movies-on-demand/`

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

### `GET /api/movies-on-demand/trending`

**Handler**: `getTrendingMovies()`

**Description**: Retrieves trending movies from TMDB's trending endpoint.

**Implementation Flow**:

1. Extract `page` query parameter (defaults to 1)
2. Call TMDB API: `GET /3/trending/movie/day?page={page}`
3. Transform TMDB response to match API contract schema
4. Return response per API contract

**Implementation Notes**:

-   TMDB API requires API key in Authorization header
-   Uses "day" timeframe for trending (could also use "week")
-   Page defaults to 1 if not provided
-   TMDB returns paginated results with 20 items per page

**Error Handling**:

-   TMDB API errors → `TMDB_ERROR` (502)
-   Network errors → `INTERNAL_ERROR` (500)

### `GET /api/movies-on-demand/movies/{id}`

**Handler**: `getMovieDetails()`

**Description**: Retrieves detailed movie information including cast, crew, and production details from TMDB.

**Implementation Flow**:

1. Extract movie `id` from path parameters
2. Validate id is a valid integer
3. Call TMDB API: `GET /3/movie/{id}?append_to_response=credits`
4. Transform TMDB response to match API contract schema
5. Return response per API contract

**Implementation Notes**:

-   TMDB API requires API key in Authorization header
-   Uses `append_to_response=credits` to get cast and crew in single request
-   TMDB movie details include extensive metadata

**Error Handling**:

-   Invalid movie ID → `INVALID_INPUT` (400)
-   Movie not found → `NOT_FOUND` (404)
-   TMDB API errors → `TMDB_ERROR` (502)
-   Network errors → `INTERNAL_ERROR` (500)

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

### Internal TypeScript Types

> Only include types NOT defined in the API contract (e.g., TMDB response types, internal service types, utility types)

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
    // ... other TMDB-specific fields
}

interface TMDBMovieDetailsResponse extends TMDBMovieResponse {
    runtime: number | null;
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
```

## Cloudflare Services

### External API: The Movie Database (TMDB)

**Documentation**: `third-party-docs/themoviedb/`

**Usage**:

-   Search movies via REST API
-   Retrieve popular and trending movies
-   Fetch movie details with cast and crew
-   Get similar movie recommendations
-   No local storage needed (stateless proxy)

**API Endpoints**:

-   `GET https://api.themoviedb.org/3/search/movie` - Search movies
-   `GET https://api.themoviedb.org/3/movie/popular` - Get popular movies
-   `GET https://api.themoviedb.org/3/trending/movie/day` - Get trending movies
-   `GET https://api.themoviedb.org/3/movie/{id}` - Get movie details
-   `GET https://api.themoviedb.org/3/movie/{id}/similar` - Get similar movies

**Configuration**:

-   `TMDB_API_KEY`: TMDB API authentication key (required)

**Authentication**:

-   TMDB API uses Bearer token authentication
-   API key should be sent in `Authorization` header: `Bearer {TMDB_API_KEY}`
-   Alternatively, TMDB supports `api_key` query parameter

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Parse request (query parameters, path parameters)
3. Validate input
4. Get TMDB API key from environment
5. Call TMDB API:
   - Search movies (GET /search)
   - Get popular movies (GET /popular)
   - Get trending movies (GET /trending)
   - Get movie details (GET /movies/{id})
   - Get similar movies (GET /movies/{id}/similar)
6. Parse TMDB response
7. Transform TMDB response to API contract format
8. Return response
```

### Error Handling

> Error response format is defined in `API_CONTRACT.yml`. Focus on error catching and mapping logic.

```typescript
try {
    // Call TMDB API
    const tmdbResponse = await fetch(tmdbUrl, {
        headers: {
            Authorization: `Bearer ${env.TMDB_API_KEY}`,
            "Content-Type": "application/json",
        },
    });

    if (!tmdbResponse.ok) {
        if (tmdbResponse.status === 404) {
            return errorResponse(404, "NOT_FOUND", "Movie not found");
        }
        return errorResponse(
            502,
            "TMDB_ERROR",
            "TMDB API request failed"
        );
    }

    const tmdbData = await tmdbResponse.json();
    // Transform and return
} catch (error) {
    // Map implementation errors to API contract error codes
    if (error instanceof TypeError) {
        // Network error
        return errorResponse(
            500,
            "INTERNAL_ERROR",
            "Network request failed"
        );
    }
    return errorResponse(500, "INTERNAL_ERROR", "Unexpected error");
}

// Helper function that formats errors per API contract
function errorResponse(status: number, code: string, message: string) {
    return new Response(JSON.stringify({ error: message, code }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
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
function validateMovieId(id: string): { ok: boolean; error?: string; id?: number } {
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
```

### Business Rules

-   Search query must be non-empty (trimmed)
-   Movie ID must be a positive integer
-   Page number defaults to 1 if not provided or invalid
-   All TMDB API calls require valid API key
-   TMDB API rate limits should be respected (though free tier is generous)

## Security Considerations

### Authentication

-   No user authentication required (public movie data)
-   TMDB API key stored in environment variables

### Authorization

-   No authorization needed (all endpoints are public)

### Input Sanitization

-   URL-encode query parameters before sending to TMDB
-   Validate and sanitize movie IDs (must be integers)
-   Validate page numbers (must be positive integers)

### API Key Security

-   TMDB API key stored in Cloudflare Workers environment variables
-   Never expose API key in client-side code or logs
-   Use Bearer token authentication for TMDB API calls

## Performance Optimization

### Caching Strategy

-   Consider caching popular and trending movie lists (they update daily)
-   Cache movie details (rarely change)
-   Use Cloudflare Workers cache API or KV for short-term caching
-   Cache TTL: 1 hour for popular/trending, 24 hours for movie details

### Edge Computing Benefits

-   Requests served from edge locations globally
-   Low latency for movie search and browsing
-   TMDB API calls made from edge workers

## Implementation Checklist

### API Endpoints

-   [ ] GET /search endpoint
-   [ ] GET /popular endpoint
-   [ ] GET /trending endpoint
-   [ ] GET /movies/{id} endpoint
-   [ ] GET /movies/{id}/similar endpoint
-   [ ] Error handling (per API_CONTRACT.yml)

### Data Layer

-   [ ] TMDB API client functions
-   [ ] Response transformation functions
-   [ ] Error mapping logic

### Business Logic

-   [ ] Input validation
-   [ ] TMDB API integration
-   [ ] Response transformation

## Dependencies

### Workers Libraries

-   Native Workers API (fetch)
-   `@cloudflare/workers-types` for types

## Error Codes

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

-   Missing or invalid query parameter → `INVALID_INPUT` (400)
-   Invalid movie ID format → `INVALID_INPUT` (400)
-   TMDB API 404 response → `NOT_FOUND` (404)
-   TMDB API errors (4xx, 5xx) → `TMDB_ERROR` (502)
-   Network errors → `INTERNAL_ERROR` (500)
-   Missing TMDB API key → `INTERNAL_ERROR` (500)
-   Unexpected errors → `INTERNAL_ERROR` (500)

## Monitoring & Logging

-   Log all TMDB API requests with response status codes
-   Log errors with context (endpoint, movie ID, query, etc.)
-   Monitor TMDB API rate limits and response times
-   Track error rates by endpoint

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (TMDB API integration, response transformation, error mapping)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`


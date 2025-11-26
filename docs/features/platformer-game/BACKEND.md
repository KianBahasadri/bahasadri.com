# Platformer Game - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

## Overview

Backend implementation for the platformer game. The backend is minimal and optional, primarily serving level data and optionally storing high scores. The game is designed to work fully client-side, so the backend is not required for core functionality.

## Code Location

`backend/src/platformer-game/`

## API Contract Reference

See `docs/features/platformer-game/API_CONTRACT.md` for the API contract this backend provides.

## API Endpoints

### `GET /api/platformer-game/levels`

**Handler**: `getLevels()`

**Description**: Retrieve level data for the platformer game. Returns level definitions including platform positions, obstacles, spawn points, and goal locations.

**Request**:

-   Query Parameters:
    -   `level` (optional, number): Specific level number to retrieve. If omitted, returns all levels.

**Validation**:

-   If `level` parameter is provided, validate it's a positive integer
-   Return 400 if level number is invalid

**Response**:

```typescript
interface LevelsResponse {
    levels: LevelData[];
}
```

**Implementation Flow**:

1. Parse and validate query parameters
2. If specific level requested, fetch that level from storage
3. If no level specified, fetch all levels
4. Return level data in API contract format
5. Handle errors gracefully

**Error Handling**:

-   `400 Bad Request`: Invalid level parameter
-   `404 Not Found`: Requested level doesn't exist
-   `500 Internal Server Error`: Server error retrieving levels

### `POST /api/platformer-game/high-score`

**Handler**: `saveHighScore()`

**Description**: Save a high score for the platformer game. This is optional and may not be implemented initially.

**Request**:

-   Headers: `Content-Type: application/json`
-   Body: HighScoreRequest

**Validation**:

-   Validate score is a positive number
-   Validate level is a positive integer
-   Validate playerName is a string (if provided) and within length limits

**Response**:

```typescript
interface HighScoreResponse {
    success: boolean;
    rank?: number;
}
```

**Implementation Flow**:

1. Parse and validate request body
2. Store high score in database/storage
3. Calculate rank (if leaderboard is implemented)
4. Return success response with optional rank

**Error Handling**:

-   `400 Bad Request`: Invalid score data
-   `500 Internal Server Error`: Server error saving score

### `GET /api/platformer-game/high-scores`

**Handler**: `getHighScores()`

**Description**: Retrieve high scores leaderboard. This is optional and may not be implemented initially.

**Request**:

-   Query Parameters:
    -   `limit` (optional, number): Number of top scores to retrieve (default: 10)

**Validation**:

-   Validate limit is a positive integer (max 100)

**Response**:

```typescript
interface HighScoresResponse {
    scores: HighScore[];
}
```

**Implementation Flow**:

1. Parse and validate query parameters
2. Fetch top scores from database/storage
3. Sort by score (descending) and level (descending)
4. Limit results to requested number
5. Return scores in API contract format

**Error Handling**:

-   `400 Bad Request`: Invalid limit parameter
-   `500 Internal Server Error`: Server error retrieving scores

## Data Models

### Database Schema

If using D1 database:

```sql
-- High scores table (optional)
CREATE TABLE IF NOT EXISTS high_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    player_name TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_high_scores_score ON high_scores(score DESC, level DESC);
```

### Level Data Storage

Level data can be stored in:

-   **Option 1**: Embedded in backend code as TypeScript/JSON constants
-   **Option 2**: D1 database (if levels are dynamic or numerous)
-   **Option 3**: KV storage (if levels are small and static)
-   **Option 4**: R2 storage (if levels are large JSON files)

### TypeScript Types

```typescript
interface LevelData {
    levelNumber: number;
    platforms: Platform[];
    obstacles: Obstacle[];
    spawnPoint: { x: number; y: number };
    goalPoint: { x: number; y: number };
    background?: string;
}

interface Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    type?: "normal" | "moving" | "breakable";
}

interface Obstacle {
    x: number;
    y: number;
    width: number;
    height: number;
    type: "spike" | "enemy" | "pit";
}

interface HighScore {
    score: number;
    level: number;
    playerName?: string;
    timestamp: string;
}
```

## Cloudflare Services

### D1 Database (Optional)

**Binding**: `DB` (or as configured in wrangler.toml)

**Usage**:

-   Store high scores if leaderboard feature is implemented
-   Store level data if levels are dynamic or numerous

**Operations**:

```typescript
// Save high score
await env.DB.prepare(
    "INSERT INTO high_scores (score, level, player_name) VALUES (?, ?, ?)"
)
    .bind(score, level, playerName)
    .run();

// Get top scores
const result = await env.DB.prepare(
    "SELECT score, level, player_name, timestamp FROM high_scores ORDER BY score DESC, level DESC LIMIT ?"
)
    .bind(limit)
    .all();
```

### KV Storage (Optional)

**Binding**: `PLATFORMER_GAME_KV` (or as configured)

**Usage**:

-   Store level data if levels are small and static
-   Cache level data for faster retrieval

**Operations**:

```typescript
// Store level data
await env.PLATFORMER_GAME_KV.put(`level:${levelNumber}`, JSON.stringify(levelData));

// Retrieve level data
const levelData = await env.PLATFORMER_GAME_KV.get(`level:${levelNumber}`);
```

### R2 Storage (Optional)

**Binding**: `PLATFORMER_GAME_R2` (or as configured)

**Usage**:

-   Store large level data files as JSON

**Operations**:

```typescript
// Store level file
await env.PLATFORMER_GAME_R2.put(`levels/${levelNumber}.json`, JSON.stringify(levelData));

// Retrieve level file
const object = await env.PLATFORMER_GAME_R2.get(`levels/${levelNumber}.json`);
const levelData = await object.json();
```

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Parse request (query params, body)
3. Validate input
4. Process business logic
   - Fetch level data from storage
   - Save/retrieve high scores
5. Format response per API contract
6. Return response
```

### Error Handling

```typescript
try {
    // Operation
} catch (error) {
    if (error instanceof ValidationError) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
    });
}
```

## Validation

### Input Validation

```typescript
function validateLevelNumber(level: unknown): { ok: boolean; error?: string } {
    if (typeof level !== "number" || level < 1 || !Number.isInteger(level)) {
        return { ok: false, error: "Level must be a positive integer" };
    }
    return { ok: true };
}

function validateHighScoreRequest(
    body: unknown
): { ok: boolean; data?: HighScoreRequest; error?: string } {
    if (typeof body !== "object" || body === null) {
        return { ok: false, error: "Invalid request body" };
    }
    const request = body as Partial<HighScoreRequest>;
    if (typeof request.score !== "number" || request.score < 0) {
        return { ok: false, error: "Score must be a non-negative number" };
    }
    if (typeof request.level !== "number" || request.level < 1) {
        return { ok: false, error: "Level must be a positive integer" };
    }
    if (request.playerName !== undefined && typeof request.playerName !== "string") {
        return { ok: false, error: "Player name must be a string" };
    }
    return { ok: true, data: request as HighScoreRequest };
}
```

### Business Rules

-   Level numbers must be positive integers starting from 1
-   Scores must be non-negative numbers
-   High scores are ranked by score (descending), then by level (descending)
-   Player names are optional and can be empty/null
-   Level data should be immutable once created

## Security Considerations

### Authentication

-   **Required**: No
-   High scores can be submitted anonymously

### Authorization

-   **Required**: No
-   All endpoints are publicly accessible

### Input Sanitization

-   Sanitize player names to prevent XSS (limit length, remove special characters)
-   Validate all numeric inputs to prevent injection attacks
-   Limit request body size to prevent DoS

### Rate Limiting

-   Consider rate limiting on high score submission endpoint to prevent abuse
-   Use Cloudflare Workers rate limiting features

## Performance Optimization

### Caching Strategy

-   Level data can be cached in memory or KV since it's static
-   High scores can be cached with short TTL (1-5 minutes)
-   Use Cloudflare's edge caching for level data responses

### Edge Computing Benefits

-   Level data served from edge locations for low latency
-   High score queries processed at edge for fast responses

## Implementation Checklist

### API Endpoints

-   [ ] GET /api/platformer-game/levels endpoint
-   [ ] POST /api/platformer-game/high-score endpoint (optional)
-   [ ] GET /api/platformer-game/high-scores endpoint (optional)
-   [ ] Error handling (per API_CONTRACT.md)

### Data Layer

-   [ ] Level data storage (embedded, D1, KV, or R2)
-   [ ] High score storage (D1 database, if implemented)
-   [ ] Data validation and sanitization

### Business Logic

-   [ ] Level data retrieval logic
-   [ ] High score saving logic (if implemented)
-   [ ] High score ranking logic (if implemented)

### Testing

-   [ ] Unit tests for handlers
-   [ ] Integration tests
-   [ ] Error scenario testing
-   [ ] Validation testing

## Testing Considerations

### Unit Tests

-   Handler function testing
-   Validation logic testing
-   Error handling testing
-   Data transformation testing

### Integration Tests

-   API endpoint testing (must match API_CONTRACT.md contract)
-   Database/KV/R2 integration testing
-   End-to-end flow testing
-   Error scenario testing

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types

## Error Codes

Must match error codes defined in API_CONTRACT.md:

| Code             | HTTP Status | When to Use                    |
| ---------------- | ----------- | ------------------------------ |
| `INVALID_INPUT`  | 400         | Invalid level number or score  |
| `NOT_FOUND`      | 404         | Level not found                |
| `INTERNAL_ERROR` | 500         | Server error processing request |

## Monitoring & Logging

-   Log level data requests for analytics
-   Log high score submissions (if implemented)
-   Monitor error rates and response times
-   Track API usage for cost management (stay within free tier)

## Implementation Priority

Since the game is designed to work fully client-side:

1. **Phase 1 (Optional)**: Level data API endpoint - allows dynamic level loading
2. **Phase 2 (Optional)**: High score storage - enables leaderboards
3. **Phase 3 (Optional)**: High score retrieval - enables leaderboard display

The backend can be implemented incrementally or skipped entirely if the frontend uses embedded level data and localStorage for scores.

---

**Note**: This document is independent of frontend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend. All API responses must match the contract defined in API_CONTRACT.md.


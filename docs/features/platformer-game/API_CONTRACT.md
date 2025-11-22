# Platformer Game - API Contract

**API contract document defining the interface between frontend and backend. This is the ONLY coupling point between frontend and backend.**

## Purpose

The platformer game is primarily a client-side game that runs in the browser. The backend API is minimal and only handles optional features like saving high scores or level data storage. Most game logic, physics, and rendering occur entirely in the frontend.

## API Base URL

-   Development: `http://localhost:8787/api`
-   Production: `https://bahasadri.com/api`

## Endpoints

### `GET /api/platformer-game/levels`

**Description**: Retrieve level data for the platformer game. Returns level definitions including platform positions, obstacles, spawn points, and goal locations.

**Request**:

-   Query Parameters:
    -   `level` (optional, number): Specific level number to retrieve. If omitted, returns all levels.

**Response**:

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

interface LevelsResponse {
    levels: LevelData[];
}
```

**Status Codes**:

-   `200 OK`: Levels retrieved successfully
-   `400 Bad Request`: Invalid level parameter
-   `500 Internal Server Error`: Server error retrieving levels

### `POST /api/platformer-game/high-score`

**Description**: Save a high score for the platformer game. This is optional and may not be implemented initially.

**Request**:

-   Headers: `Content-Type: application/json`
-   Body:

```typescript
interface HighScoreRequest {
    score: number;
    level: number;
    playerName?: string; // Optional, may be omitted for anonymous scores
}
```

**Response**:

```typescript
interface HighScoreResponse {
    success: boolean;
    rank?: number; // Optional rank if leaderboard is implemented
}
```

**Status Codes**:

-   `200 OK`: High score saved successfully
-   `400 Bad Request`: Invalid score data
-   `500 Internal Server Error`: Server error saving score

### `GET /api/platformer-game/high-scores`

**Description**: Retrieve high scores leaderboard. This is optional and may not be implemented initially.

**Request**:

-   Query Parameters:
    -   `limit` (optional, number): Number of top scores to retrieve (default: 10)

**Response**:

```typescript
interface HighScore {
    score: number;
    level: number;
    playerName?: string;
    timestamp: string; // ISO 8601 timestamp
}

interface HighScoresResponse {
    scores: HighScore[];
}
```

**Status Codes**:

-   `200 OK`: High scores retrieved successfully
-   `500 Internal Server Error`: Server error retrieving scores

## Shared Data Models

### TypeScript Types

```typescript
interface GameState {
    currentLevel: number;
    score: number;
    lives: number;
    position: { x: number; y: number };
}

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
```

## Error Handling

### Standard Error Response

All errors follow this format:

```typescript
interface ErrorResponse {
    error: string;
}
```

### Error Codes

| Code             | HTTP Status | When to Use                    |
| ---------------- | ----------- | ------------------------------ |
| `INVALID_INPUT`  | 400         | Invalid level number or score  |
| `NOT_FOUND`      | 404         | Level not found                |
| `INTERNAL_ERROR` | 500         | Server error processing request |

## Authentication/Authorization

-   **Required**: No
-   **Method**: None
-   High scores may be saved anonymously or with optional player name

## CORS

-   **Allowed Origins**: `https://bahasadri.com`
-   **Allowed Methods**: GET, POST
-   **Allowed Headers**: Content-Type

## Testing

### Test Endpoints

-   Development: Use localhost endpoints
-   Production: Use production API URL

### Example Requests

```bash
# Get all levels
curl -X GET "http://localhost:8787/api/platformer-game/levels"

# Get specific level
curl -X GET "http://localhost:8787/api/platformer-game/levels?level=1"

# Save high score
curl -X POST "http://localhost:8787/api/platformer-game/high-score" \
  -H "Content-Type: application/json" \
  -d '{"score": 1000, "level": 3}'

# Get high scores
curl -X GET "http://localhost:8787/api/platformer-game/high-scores?limit=10"
```

## Implementation Notes

-   **Client-Side Primary**: The game runs primarily in the browser. The API is optional and only needed for:
    -   Storing level data (if levels are too large for frontend bundle)
    -   Saving high scores (optional feature)
    -   Leaderboards (optional feature)
-   **Fallback Support**: The frontend should work without backend API. Level data can be embedded in the frontend bundle, and high scores can be stored in localStorage if backend is unavailable.
-   **Minimal Backend**: If backend is not implemented initially, the game should still be fully playable using client-side only features.

---

**Note**: This document defines the contract between frontend and backend. Implementation details are in FRONTEND.md and BACKEND.md respectively.


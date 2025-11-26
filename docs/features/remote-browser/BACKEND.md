# Remote Browser - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the Remote Browser utility. The backend manages isolated browser containers, handles browser control commands, and provides WebSocket connections for real-time browser control and screen streaming.

## ⚠️ Architectural Considerations

**CRITICAL**: This feature requires infrastructure beyond Cloudflare Workers:

- **Container Orchestration**: Cloudflare Workers cannot run Docker containers directly. This feature requires:
  - External container hosting (e.g., VPS, cloud provider with container support)
  - Container orchestration service (Docker, Kubernetes, or managed container service)
  - Persistent compute resources (not serverless)

- **WebSocket Support**: Real-time browser control requires WebSocket connections, which Workers support but need persistent connections to container infrastructure.

- **Cost Implications**: Running containers continuously will likely exceed Cloudflare free tier limits and require paid infrastructure.

**Recommended Architecture**:
- Cloudflare Workers API for REST endpoints (session management, metadata)
- External container service (VPS, cloud provider) for actual browser containers
- WebSocket proxy/gateway to bridge Workers and container infrastructure
- Container orchestration service to manage browser containers

**Alternative Approaches**:
1. Use a managed browser automation service (e.g., Browserless.io, Selenium Grid)
2. Deploy container infrastructure separately and have Workers API communicate with it
3. Use Cloudflare's container platform (if available) or partner services

## Code Location

`backend/src/remote-browser/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/remote-browser/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `GET /api/remote-browser/sessions`

**Handler**: `listSessions()`

**Description**: Retrieves a list of browser sessions with optional filtering and pagination.

**Implementation Flow**:

1. Authenticate user (JWT validation)
2. Query D1 database for user's sessions
3. Apply status filter if provided
4. Apply pagination (limit/offset)
5. For each session, fetch current resource usage from container service
6. Return formatted response per API contract

**Implementation Notes**:

- Sessions are stored in D1 database with user association
- Resource usage is fetched in real-time from container orchestration service
- Pagination uses limit/offset pattern
- Status filter is applied at database level for efficiency

### `POST /api/remote-browser/sessions`

**Handler**: `createSession()`

**Description**: Creates a new browser session by spinning up an isolated container.

**Implementation Flow**:

1. Authenticate user
2. Check user's concurrent session limit (prevent abuse)
3. Validate request body (timeout, resource limits)
4. Call container orchestration service to create container:
   - Deploy browser container image (e.g., Playwright/Puppeteer with browser)
   - Configure network isolation
   - Set resource limits (CPU, memory)
   - Enable Tor if requested
5. Wait for container to be ready (polling or webhook)
6. Create session record in D1 database
7. Generate WebSocket URL for browser control
8. Return session details per API contract

**Implementation Notes**:

- Container creation is asynchronous - session status starts as "starting"
- Container orchestration service handles actual container deployment
- WebSocket URL points to container's control endpoint
- Session timeout is enforced by container orchestration service
- Tor configuration requires special container image with Tor pre-installed

**Error Handling**:

- Container start failures → `CONTAINER_START_FAILED` (500)
- Session limit exceeded → `SESSION_LIMIT_EXCEEDED` (429)
- Invalid resource limits → `INVALID_INPUT` (400)

### `GET /api/remote-browser/sessions/{sessionId}`

**Handler**: `getSession()`

**Description**: Retrieves details about a specific browser session.

**Implementation Flow**:

1. Authenticate user
2. Query D1 database for session by ID
3. Verify user owns the session (authorization)
4. Fetch current resource usage from container service
5. Return session details per API contract

**Implementation Notes**:

- Resource usage is fetched in real-time (not cached)
- Session ownership is verified to prevent unauthorized access

### `DELETE /api/remote-browser/sessions/{sessionId}`

**Handler**: `terminateSession()`

**Description**: Terminates a browser session and destroys the container.

**Implementation Flow**:

1. Authenticate user
2. Query D1 database for session by ID
3. Verify user owns the session
4. Call container orchestration service to destroy container
5. Update session status to "terminated" in D1
6. Return success response

**Implementation Notes**:

- Container destruction is asynchronous but response is immediate
- Session record is kept in database for history (status = "terminated")
- Container cleanup happens automatically by orchestration service

### `POST /api/remote-browser/sessions/{sessionId}/pause`

**Handler**: `pauseSession()`

**Description**: Pauses a browser session (container remains but browser is paused).

**Implementation Flow**:

1. Authenticate user
2. Verify session ownership
3. Check session status (must be "active" or "ready")
4. Send pause command to container via control API
5. Update session status to "paused" in D1
6. Return updated session

**Implementation Notes**:

- Pausing preserves browser state but stops browser execution
- Container resources are still allocated (but reduced)

### `POST /api/remote-browser/sessions/{sessionId}/resume`

**Handler**: `resumeSession()`

**Description**: Resumes a paused browser session.

**Implementation Flow**:

1. Authenticate user
2. Verify session ownership
3. Check session status (must be "paused")
4. Send resume command to container via control API
5. Update session status to "active" in D1
6. Return updated session

### `POST /api/remote-browser/sessions/{sessionId}/screenshot`

**Handler**: `captureScreenshot()`

**Description**: Captures a screenshot of the current browser state.

**Implementation Flow**:

1. Authenticate user
2. Verify session ownership
3. Check session status (must be "ready" or "active")
4. Send screenshot command to container via control API
5. Container returns screenshot image
6. Upload screenshot to R2 storage
7. Generate signed URL for screenshot (temporary access)
8. Return screenshot URL and metadata per API contract

**Implementation Notes**:

- Screenshots are stored in R2 with temporary signed URLs
- Screenshots can be cleaned up after expiration (e.g., 24 hours)
- Screenshot format: PNG

### `POST /api/remote-browser/sessions/{sessionId}/control`

**Handler**: `controlBrowser()`

**Description**: Sends a browser control command (navigate, click, type, etc.).

**Implementation Flow**:

1. Authenticate user
2. Verify session ownership
3. Check session status (must be "ready" or "active")
4. Validate control command structure
5. Forward command to container via control API
6. Wait for command execution result
7. Return response per API contract

**Implementation Notes**:

- Commands are forwarded to container's control API
- Some commands are synchronous (navigate, click), others may be async
- Command execution timeout: 30 seconds
- Container control API handles actual browser automation (Playwright/Puppeteer)

## Data Models

> **Note**: API request/response types are defined in `API_CONTRACT.yml`. This section covers internal data models only.

### Database Schema

```sql
-- Browser sessions table
CREATE TABLE browser_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    container_id TEXT,
    websocket_url TEXT,
    tor_enabled INTEGER DEFAULT 0,
    session_timeout INTEGER DEFAULT 3600,
    max_memory_mb INTEGER DEFAULT 512,
    max_cpu_percent INTEGER DEFAULT 50,
    created_at TEXT NOT NULL,
    expires_at TEXT,
    terminated_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for query performance
CREATE INDEX idx_browser_sessions_user_id ON browser_sessions(user_id);
CREATE INDEX idx_browser_sessions_status ON browser_sessions(status);
CREATE INDEX idx_browser_sessions_created_at ON browser_sessions(created_at);
CREATE INDEX idx_browser_sessions_expires_at ON browser_sessions(expires_at);
```

### Internal TypeScript Types

```typescript
// Database row type (internal representation)
interface BrowserSessionRow {
    id: string;
    user_id: string;
    status: "starting" | "ready" | "active" | "paused" | "terminated" | "error";
    container_id: string | null;
    websocket_url: string | null;
    tor_enabled: number; // SQLite boolean
    session_timeout: number;
    max_memory_mb: number;
    max_cpu_percent: number;
    created_at: string;
    expires_at: string | null;
    terminated_at: string | null;
}

// Container orchestration service client types
interface ContainerConfig {
    image: string;
    memoryMB: number;
    cpuPercent: number;
    torEnabled: boolean;
    networkIsolated: boolean;
}

interface ContainerStatus {
    id: string;
    status: "starting" | "running" | "stopped" | "error";
    cpuPercent: number;
    memoryMB: number;
    networkBytes: number;
}

// Browser control command types
type BrowserCommand =
    | { type: "navigate"; url: string }
    | { type: "click"; x: number; y: number }
    | { type: "type"; text: string }
    | { type: "scroll"; x: number; y: number }
    | { type: "keypress"; key: string }
    | { type: "screenshot" }
    | { type: "getUrl" }
    | { type: "getTitle" };
```

## Cloudflare Services

### D1 Database

**Binding**: `DB`

**Usage**:

- Store browser session metadata
- Track session status and ownership
- Query user's sessions with filtering

**Operations**:

```typescript
// Create session record
await env.DB.prepare(
    "INSERT INTO browser_sessions (id, user_id, status, ...) VALUES (?, ?, ?, ...)"
)
    .bind(sessionId, userId, "starting", ...)
    .run();

// Query user's sessions
const sessions = await env.DB.prepare(
    "SELECT * FROM browser_sessions WHERE user_id = ? AND status = ? LIMIT ? OFFSET ?"
)
    .bind(userId, status, limit, offset)
    .all();
```

### R2 Storage

**Binding**: `BROWSER_SCREENSHOTS`

**Usage**:

- Store browser screenshots
- Generate temporary signed URLs for download

**Operations**:

```typescript
// Upload screenshot
await env.BROWSER_SCREENSHOTS.put(
    `screenshots/${sessionId}/${timestamp}.png`,
    screenshotBuffer,
    {
        httpMetadata: {
            contentType: "image/png",
        },
    }
);

// Generate signed URL (24 hour expiration)
const url = await env.BROWSER_SCREENSHOTS.createMultipartUpload(
    `screenshots/${sessionId}/${timestamp}.png`
);
```

## External Services

### Container Orchestration Service

**Description**: External service that manages browser containers (Docker, Kubernetes, or managed service).

**Required Capabilities**:

- Deploy browser container images
- Configure network isolation
- Set resource limits (CPU, memory)
- Monitor container resource usage
- Destroy containers on demand
- Support Tor network configuration

**Integration**:

- REST API for container lifecycle management
- WebSocket endpoint for browser control
- Webhook support for container status updates

**Example Integration**:

```typescript
// Create container
const container = await fetch(`${CONTAINER_SERVICE_URL}/containers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CONTAINER_SERVICE_API_KEY}` },
    body: JSON.stringify({
        image: "browser-container:latest",
        memoryMB: 512,
        cpuPercent: 50,
        torEnabled: true,
    }),
});

// Get container status
const status = await fetch(
    `${CONTAINER_SERVICE_URL}/containers/${containerId}/status`
);
```

### Browser Control API (Container-Side)

**Description**: API running inside each container that controls the browser (Playwright/Puppeteer).

**Required Capabilities**:

- Execute browser commands (navigate, click, type, etc.)
- Capture screenshots
- Stream browser screen via WebSocket
- Report browser state (URL, title)

**Integration**:

- WebSocket connection for real-time control
- REST endpoints for synchronous commands

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Authenticate user (JWT validation)
3. Parse request (JSON)
4. Validate input (per API contract)
5. Process business logic:
   - Database operations (D1)
   - Container orchestration calls
   - File storage (R2)
6. Format response per API contract
7. Return response
```

### Error Handling

> Error response format is defined in `API_CONTRACT.yml`. Focus on error catching and mapping logic.

```typescript
try {
    // Business logic implementation
} catch (error) {
    // Map implementation errors to API contract error codes
    if (error instanceof ContainerStartError) {
        return errorResponse(500, "CONTAINER_START_FAILED", error.message);
    }
    if (error instanceof SessionLimitError) {
        return errorResponse(429, "SESSION_LIMIT_EXCEEDED", error.message);
    }
    if (error instanceof DatabaseError) {
        return errorResponse(500, "INTERNAL_ERROR", "Database operation failed");
    }
    // Handle other error types...
    return errorResponse(500, "INTERNAL_ERROR", "Unexpected error");
}
```

## Validation

> **Note**: Basic validation rules (required fields, types, formats) are defined in `API_CONTRACT.yml`. This section covers implementation-specific validation only.

### Implementation-Specific Validation

```typescript
// Validate session can be created (check limits)
function validateSessionCreation(
    userId: string,
    env: Env
): { ok: boolean; error?: string } {
    const activeSessions = await getActiveSessionCount(userId, env);
    const maxSessions = 3; // Per-user limit

    if (activeSessions >= maxSessions) {
        return {
            ok: false,
            error: "Maximum number of concurrent sessions exceeded",
        };
    }

    return { ok: true };
}

// Validate resource limits
function validateResourceLimits(
    limits: CreateSessionRequest["resourceLimits"]
): { ok: boolean; error?: string } {
    if (limits?.maxMemoryMB && (limits.maxMemoryMB < 256 || limits.maxMemoryMB > 2048)) {
        return {
            ok: false,
            error: "Memory limit must be between 256 and 2048 MB",
        };
    }

    return { ok: true };
}
```

### Business Rules

- Maximum 3 concurrent sessions per user
- Session timeout: 300-28800 seconds (configurable)
- Maximum memory: 256-2048 MB per container
- Maximum CPU: 25-100% per container
- Sessions automatically expire after timeout
- Terminated sessions are kept in database for 30 days
- Screenshots expire after 24 hours

## Security Considerations

### Authentication

- All endpoints require JWT authentication
- User identity is extracted from JWT token

### Authorization

- Users can only access their own sessions
- Session ownership is verified on every request
- Container IDs are not exposed to users (internal only)

### Input Sanitization

- URLs are validated and sanitized before navigation
- Control commands are validated against allowed types
- Resource limits are enforced at container level

### Container Isolation

- Each container runs in isolated network namespace
- Containers cannot access host system or other containers
- Automatic cleanup on session termination
- No persistent storage between sessions

## Performance Optimization

### Caching Strategy

- Session metadata cached in KV for frequently accessed sessions (TTL: 5 minutes)
- Resource usage fetched in real-time (not cached)

### Edge Computing Benefits

- API endpoints served from edge (low latency)
- Container infrastructure can be geographically distributed

## Implementation Checklist

### API Endpoints

- [ ] `GET /api/remote-browser/sessions` endpoint
- [ ] `POST /api/remote-browser/sessions` endpoint
- [ ] `GET /api/remote-browser/sessions/{sessionId}` endpoint
- [ ] `DELETE /api/remote-browser/sessions/{sessionId}` endpoint
- [ ] `POST /api/remote-browser/sessions/{sessionId}/pause` endpoint
- [ ] `POST /api/remote-browser/sessions/{sessionId}/resume` endpoint
- [ ] `POST /api/remote-browser/sessions/{sessionId}/screenshot` endpoint
- [ ] `POST /api/remote-browser/sessions/{sessionId}/control` endpoint
- [ ] Error handling (per API_CONTRACT.yml)

### Data Layer

- [ ] D1 database schema and migrations
- [ ] Session CRUD operations
- [ ] User session ownership verification
- [ ] R2 screenshot storage integration

### Business Logic

- [ ] Container orchestration service integration
- [ ] Session lifecycle management
- [ ] Resource limit validation
- [ ] Session timeout enforcement
- [ ] Browser control command forwarding

### External Services

- [ ] Container orchestration service client
- [ ] Browser control API integration
- [ ] WebSocket proxy/gateway setup

## Dependencies

### Workers Libraries

- Native Workers API
- `@cloudflare/workers-types` for types
- Hono (or native Workers API) for routing

### External Services

- Container orchestration service (Docker, Kubernetes, or managed service)
- Browser automation library (Playwright/Puppeteer) in containers

## Error Codes

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

- Container start failures → `CONTAINER_START_FAILED` (500)
- Session limit exceeded → `SESSION_LIMIT_EXCEEDED` (429)
- Container not ready → `CONTAINER_NOT_READY` (400)
- Session expired → `SESSION_EXPIRED` (400)
- Resource limit exceeded → `RESOURCE_LIMIT_EXCEEDED` (400)
- Database errors → `INTERNAL_ERROR` (500)
- External service errors → `INTERNAL_ERROR` (500)
- Validation failures → `INVALID_INPUT` (400)
- Resource not found → `NOT_FOUND` (404)

## Monitoring & Logging

- Log all container creation/destruction events
- Log browser control commands (for debugging)
- Monitor container resource usage
- Track session creation/termination rates
- Alert on container start failures
- Monitor WebSocket connection health

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

- **DO NOT** duplicate request/response schemas from the API contract
- **DO NOT** duplicate error codes or validation rules from the API contract
- **DO** focus on implementation-specific details (database queries, external services, business logic)
- **DO** reference the API contract when discussing endpoints or data structures
- All API responses **MUST** match the contract defined in `API_CONTRACT.yml`


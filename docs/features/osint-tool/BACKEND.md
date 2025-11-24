# OSINT Tool - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

## Overview

Backend implementation for the OSINT Tool utility. Handles gathering publicly available information from various sources including social media platforms, domain registrars, and data breach databases.

## Code Location

`backend/src/routes/osint-tool/`

## API Contract Reference

See `docs/features/osint-tool/API_CONTRACT.md` for the API contract this backend provides.

## API Endpoints

### `POST /api/osint-tool/username-search`

**Handler**: `handleUsernameSearch()`

**Description**: Searches for a username across multiple platforms

**Request**:

-   Body: `{ username: string }`

**Validation**:

-   Username must be non-empty string
-   Username must be between 1 and 100 characters
-   Username must not contain invalid characters

**Response**:

```typescript
interface UsernameSearchResponse {
    username: string;
    results: PlatformResult[];
    searchDate: string;
}
```

**Implementation Flow**:

1. Validate input username
2. Check rate limits
3. Search across multiple platforms (parallel where possible)
4. Aggregate results
5. Return formatted response

**Error Handling**:

-   `400`: Invalid username format
-   `429`: Rate limit exceeded
-   `500`: Internal server error

### `POST /api/osint-tool/email-lookup`

**Handler**: `handleEmailLookup()`

**Description**: Looks up information associated with an email address

**Request**:

-   Body: `{ email: string }`

**Validation**:

-   Email must be valid email format
-   Email must not be empty

**Response**:

```typescript
interface EmailLookupResponse {
    email: string;
    associatedAccounts: AccountInfo[];
    breachHistory: BreachInfo[];
    searchDate: string;
}
```

**Implementation Flow**:

1. Validate email format
2. Check rate limits
3. Search for associated accounts
4. Check data breach databases
5. Aggregate results
6. Return formatted response

**Error Handling**:

-   `400`: Invalid email format
-   `429`: Rate limit exceeded
-   `500`: Internal server error

### `POST /api/osint-tool/domain-info`

**Handler**: `handleDomainInfo()`

**Description**: Gathers WHOIS and DNS information about a domain

**Request**:

-   Body: `{ domain: string }`

**Validation**:

-   Domain must be valid domain format
-   Domain must not be empty

**Response**:

```typescript
interface DomainInfoResponse {
    domain: string;
    whois: WhoisData;
    dns: DnsData;
    searchDate: string;
}
```

**Implementation Flow**:

1. Validate domain format
2. Check rate limits
3. Fetch WHOIS data
4. Fetch DNS records
5. Parse and format data
6. Return formatted response

**Error Handling**:

-   `400`: Invalid domain format
-   `404`: Domain not found
-   `429`: Rate limit exceeded
-   `500`: Internal server error

### `POST /api/osint-tool/breach-check`

**Handler**: `handleBreachCheck()`

**Description**: Checks if an email has been involved in known data breaches

**Request**:

-   Body: `{ email: string }`

**Validation**:

-   Email must be valid email format
-   Email must not be empty

**Response**:

```typescript
interface BreachCheckResponse {
    email: string;
    breaches: BreachInfo[];
    searchDate: string;
}
```

**Implementation Flow**:

1. Validate email format
2. Check rate limits
3. Query breach database (using free API like Have I Been Pwned)
4. Format results
5. Return response

**Error Handling**:

-   `400`: Invalid email format
-   `429`: Rate limit exceeded
-   `500`: Internal server error

## Data Models

### TypeScript Types

```typescript
interface PlatformResult {
    platform: string;
    url?: string;
    profileName?: string;
    verified?: boolean;
    found: boolean;
}

interface AccountInfo {
    platform: string;
    username?: string;
    url?: string;
}

interface BreachInfo {
    name: string;
    date: string;
    description?: string;
    affectedData: string[];
}

interface WhoisData {
    registrar?: string;
    creationDate?: string;
    expirationDate?: string;
    nameServers?: string[];
    registrant?: string;
}

interface DnsData {
    a?: string[];
    aaaa?: string[];
    mx?: string[];
    txt?: string[];
    ns?: string[];
}
```

### Database Schema

No persistent storage required. All data is fetched from external sources on-demand.

## Cloudflare Services

### KV (Optional - for caching)

**Binding**: `OSINT_CACHE`

**Usage**:

-   Cache search results to reduce API calls
-   Cache key format: `osint:{type}:{query}:{hash}`
-   TTL: 24 hours for username/email searches, 7 days for domain info

**Operations**:

```typescript
// Cache result
await env.OSINT_CACHE.put(cacheKey, JSON.stringify(result), {
    expirationTtl: 86400, // 24 hours
});

// Retrieve cached result
const cached = await env.OSINT_CACHE.get(cacheKey);
```

### Rate Limiting (KV-based)

**Binding**: `RATE_LIMIT_KV`

**Usage**:

-   Track request counts per IP address
-   Implement 10 requests per minute limit

**Operations**:

```typescript
// Check rate limit
const key = `rate_limit:${ipAddress}`;
const count = await env.RATE_LIMIT_KV.get(key);
if (count && parseInt(count) >= 10) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
    });
}

// Increment counter
await env.RATE_LIMIT_KV.put(key, String((parseInt(count || "0") + 1)), {
    expirationTtl: 60, // 1 minute
});
```

## Workers Logic

### Request Processing Flow

```
1. Receive request
2. Extract IP address for rate limiting
3. Check rate limits
4. Parse and validate input
5. Check cache (if applicable)
6. Fetch data from external sources
7. Aggregate and format results
8. Cache results (optional)
9. Return response per API contract
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
    if (error instanceof RateLimitError) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            status: 429,
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
    });
}
```

## External APIs and Services

### Username Search Sources

-   Social media platforms (public profile checks)
-   GitHub, GitLab (developer platforms)
-   Reddit, Twitter/X (if public APIs available)
-   Note: Use only free/public APIs, no scraping

### Email Lookup Sources

-   Gravatar API (for profile images)
-   Public email directories (if available)
-   Note: Respect privacy and terms of service

### Domain Information Sources

-   WHOIS APIs (free tier services)
-   DNS lookup (native DNS queries)
-   Note: Use free WHOIS APIs or Cloudflare's DNS resolver

### Breach Check Sources

-   Have I Been Pwned API (free tier)
-   Note: Use only legitimate, free breach databases

## Validation

### Input Validation

```typescript
function validateUsername(username: string): { ok: boolean; error?: string } {
    if (!username || username.trim().length === 0) {
        return { ok: false, error: "Username cannot be empty" };
    }
    if (username.length > 100) {
        return { ok: false, error: "Username too long" };
    }
    // Add more validation as needed
    return { ok: true };
}

function validateEmail(email: string): { ok: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { ok: false, error: "Invalid email format" };
    }
    return { ok: true };
}

function validateDomain(domain: string): { ok: boolean; error?: string } {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
        return { ok: false, error: "Invalid domain format" };
    }
    return { ok: true };
}
```

### Business Rules

-   Rate limit: 10 requests per minute per IP address
-   Cache results for 24 hours (username/email) or 7 days (domain)
-   Only use publicly available APIs and services
-   Respect external API rate limits
-   Do not store or log sensitive information
-   All searches are stateless (no persistent storage of queries)

## Security Considerations

### Authentication

-   **Required**: No
-   **Method**: None
-   **Note**: Public tool with rate limiting

### Authorization

-   **Required**: No
-   **Note**: All users have equal access, rate limited by IP

### Input Sanitization

-   Sanitize all user inputs to prevent injection attacks
-   Validate input formats strictly
-   Limit input length to prevent abuse
-   Escape special characters in outputs

### Privacy

-   Do not log or store user queries
-   Do not store personal information
-   Only use publicly available information
-   Respect privacy regulations (GDPR, etc.)

### Rate Limiting

-   Implement per-IP rate limiting (10 requests/minute)
-   Return appropriate 429 status codes
-   Include rate limit information in response headers

## Performance Optimization

### Caching Strategy

-   Cache search results in KV for 24 hours (username/email) or 7 days (domain)
-   Cache key includes query hash to prevent collisions
-   Invalidate cache on errors

### Edge Computing Benefits

-   Low latency responses from Cloudflare edge
-   Distributed rate limiting
-   Efficient caching at edge locations

### Parallel Requests

-   Make parallel requests to multiple sources when possible
-   Use Promise.all() for concurrent API calls
-   Set reasonable timeouts for external API calls

## Implementation Checklist

### API Endpoints

-   [ ] POST /username-search endpoint
-   [ ] POST /email-lookup endpoint
-   [ ] POST /domain-info endpoint
-   [ ] POST /breach-check endpoint
-   [ ] Error handling (per API_CONTRACT.md)
-   [ ] Rate limiting implementation

### Data Layer

-   [ ] KV setup for caching (optional)
-   [ ] KV setup for rate limiting
-   [ ] Cache key generation
-   [ ] Cache invalidation logic

### Business Logic

-   [ ] Input validation functions
-   [ ] Username search logic
-   [ ] Email lookup logic
-   [ ] Domain info fetching logic
-   [ ] Breach check logic
-   [ ] Result aggregation and formatting

### External Integrations

-   [ ] Username search API integrations
-   [ ] Email lookup API integrations
-   [ ] WHOIS API integration
-   [ ] DNS lookup implementation
-   [ ] Breach database API integration (Have I Been Pwned)

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types
-   External HTTP APIs (no additional libraries needed)

## Error Codes

Must match error codes defined in API_CONTRACT.md:

| Code             | HTTP Status | When to Use                           |
| ---------------- | ----------- | ------------------------------------- |
| `INVALID_INPUT`  | 400         | Invalid input format                  |
| `RATE_LIMIT`     | 429         | Rate limit exceeded                   |
| `NOT_FOUND`      | 404         | Domain or resource not found          |
| `INTERNAL_ERROR` | 500         | Server error during processing        |

## Monitoring & Logging

-   Log API errors (without sensitive data)
-   Monitor rate limit hits
-   Track external API failures
-   Monitor cache hit rates
-   **Do not log user queries or personal information**

---

**Note**: This document is independent of frontend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend. All API responses must match the contract defined in API_CONTRACT.md.


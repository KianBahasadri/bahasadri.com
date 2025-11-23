# OSINT Tool - API Contract

**API contract document defining the interface between frontend and backend. This is the ONLY coupling point between frontend and backend.**

## Purpose

Provides endpoints for gathering publicly available information (OSINT) about usernames, email addresses, domains, and other identifiers from various public sources.

## API Base URL

-   Development: `http://localhost:8787/api`
-   Production: `https://bahasadri.com/api`

## Endpoints

### `POST /api/osint-tool/username-search`

**Description**: Search for a username across multiple platforms to find associated profiles and accounts

**Request**:

```typescript
interface UsernameSearchRequest {
    username: string;
}
```

**Response**:

```typescript
interface UsernameSearchResponse {
    username: string;
    results: {
        platform: string;
        url?: string;
        profileName?: string;
        verified?: boolean;
        found: boolean;
    }[];
    searchDate: string;
}
```

**Status Codes**:

-   `200 OK`: Search completed successfully
-   `400 Bad Request`: Invalid username format
-   `429 Too Many Requests`: Rate limit exceeded
-   `500 Internal Server Error`: Server error during search

### `POST /api/osint-tool/email-lookup`

**Description**: Lookup information associated with an email address

**Request**:

```typescript
interface EmailLookupRequest {
    email: string;
}
```

**Response**:

```typescript
interface EmailLookupResponse {
    email: string;
    associatedAccounts: {
        platform: string;
        username?: string;
        url?: string;
    }[];
    breachHistory: {
        breachName: string;
        breachDate: string;
        affectedData: string[];
    }[];
    searchDate: string;
}
```

**Status Codes**:

-   `200 OK`: Lookup completed successfully
-   `400 Bad Request`: Invalid email format
-   `429 Too Many Requests`: Rate limit exceeded
-   `500 Internal Server Error`: Server error during lookup

### `POST /api/osint-tool/domain-info`

**Description**: Gather information about a domain including WHOIS and DNS data

**Request**:

```typescript
interface DomainInfoRequest {
    domain: string;
}
```

**Response**:

```typescript
interface DomainInfoResponse {
    domain: string;
    whois: {
        registrar?: string;
        creationDate?: string;
        expirationDate?: string;
        nameServers?: string[];
        registrant?: string;
    };
    dns: {
        a?: string[];
        aaaa?: string[];
        mx?: string[];
        txt?: string[];
        ns?: string[];
    };
    searchDate: string;
}
```

**Status Codes**:

-   `200 OK`: Domain information retrieved successfully
-   `400 Bad Request`: Invalid domain format
-   `404 Not Found`: Domain not found or invalid
-   `429 Too Many Requests`: Rate limit exceeded
-   `500 Internal Server Error`: Server error during lookup

### `POST /api/osint-tool/breach-check`

**Description**: Check if an email address has been involved in known data breaches

**Request**:

```typescript
interface BreachCheckRequest {
    email: string;
}
```

**Response**:

```typescript
interface BreachCheckResponse {
    email: string;
    breaches: {
        name: string;
        date: string;
        description?: string;
        affectedData: string[];
    }[];
    searchDate: string;
}
```

**Status Codes**:

-   `200 OK`: Breach check completed successfully
-   `400 Bad Request`: Invalid email format
-   `429 Too Many Requests`: Rate limit exceeded
-   `500 Internal Server Error`: Server error during check

## Shared Data Models

### TypeScript Types

```typescript
interface OSINTResult {
    query: string;
    queryType: "username" | "email" | "domain";
    results: Record<string, unknown>;
    timestamp: string;
}

interface PlatformResult {
    platform: string;
    found: boolean;
    url?: string;
    additionalInfo?: Record<string, unknown>;
}
```

## Error Handling

### Standard Error Response

All errors follow this format:

```typescript
interface ErrorResponse {
    error: string;
    code?: string;
}
```

### Error Codes

| Code             | HTTP Status | When to Use                           |
| ---------------- | ----------- | ------------------------------------- |
| `INVALID_INPUT`  | 400         | Invalid input format (username, email, domain) |
| `RATE_LIMIT`     | 429         | Too many requests, rate limit exceeded |
| `NOT_FOUND`      | 404         | Domain or resource not found          |
| `INTERNAL_ERROR` | 500         | Server error during processing        |

## Authentication/Authorization

-   **Required**: No
-   **Method**: None
-   **Note**: This is a public tool, but rate limiting applies to prevent abuse

## CORS

-   **Allowed Origins**: `https://bahasadri.com`
-   **Allowed Methods**: POST
-   **Allowed Headers**: Content-Type

## Rate Limiting

-   **Per IP**: 10 requests per minute
-   **Per Endpoint**: Varies by external API limits
-   **Response Headers**: Include rate limit information in response headers

---

**Note**: This document defines the contract between frontend and backend. Implementation details are in FRONTEND.md and BACKEND.md respectively.


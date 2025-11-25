# Rideshare Price Comparison - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the Rideshare Price Comparison utility. The backend fetches real-time pricing from multiple rideshare service APIs (Uber, Lyft, etc.) and aggregates the results for comparison.

## Code Location

`backend/src/rideshare-comparison/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/rideshare-comparison/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `POST /api/rideshare-comparison/compare`

**Handler**: `comparePrices()`

**Description**: Fetches pricing from multiple rideshare services in parallel and aggregates results.

**Implementation Flow**:

1. Parse and validate request body (origin, destination, optional scheduledTime)
2. Geocode origin and destination addresses to get coordinates (if needed by services)
3. Fetch prices from multiple rideshare services in parallel:
   - Uber API
   - Lyft API
   - Other configured services
4. Transform each service's response to match the API contract schema
5. Aggregate results into the response format
6. Return response with all service prices (including partial failures)

**Implementation Notes**:

-   Services should be called in parallel using `Promise.allSettled()` to ensure one service failure doesn't block others
-   Each service may have different API formats - transform to common schema
-   Handle rate limiting and API errors gracefully (include error in ServicePrice if service fails)
-   Geocoding may be required for some services - cache results if possible to reduce API calls
-   Consider implementing request timeout per service (e.g., 5 seconds) to avoid hanging requests

**Error Handling**:

-   If all services fail → return 503 SERVICE_UNAVAILABLE
-   If some services fail → return 200 with error messages in individual ServicePrice objects
-   Invalid addresses → return 400 LOCATION_NOT_FOUND
-   Geocoding failures → return 400 LOCATION_NOT_FOUND
-   Unexpected errors → return 500 INTERNAL_ERROR

## Data Models

> **Note**: API request/response types are defined in `API_CONTRACT.yml`. This section covers internal data models only.

### Internal TypeScript Types

> Only include types NOT defined in the API contract (e.g., service-specific response types, internal utility types)

```typescript
// Service-specific response types (before transformation)
interface UberPriceResponse {
    // Uber API response structure
}

interface LyftPriceResponse {
    // Lyft API response structure
}

// Geocoding result
interface GeocodeResult {
    latitude: number;
    longitude: number;
    formattedAddress: string;
}

// Service configuration
interface ServiceConfig {
    name: string;
    apiKey: string;
    baseUrl: string;
    timeout: number;
}
```

## Cloudflare Services

### KV (Optional - for caching)

**Binding**: `RIDESHARE_CACHE`

**Usage**:

-   Cache geocoding results (origin/destination → coordinates)
-   Cache price results with short TTL (e.g., 5 minutes) to reduce API calls
-   Key format: `geocode:{address}` or `prices:{origin}:{destination}:{timestamp}`

**Operations**:

```typescript
// Cache geocoding result
await env.RIDESHARE_CACHE.put(
    `geocode:${address}`,
    JSON.stringify(geocodeResult),
    { expirationTtl: 3600 } // 1 hour
);

// Retrieve cached result
const cached = await env.RIDESHARE_CACHE.get(`geocode:${address}`);
```

## Workers Logic

### Request Processing Flow

```
1. Receive POST request to /api/rideshare-comparison/compare
2. Parse and validate request body
3. Geocode origin and destination (with caching)
4. Fetch prices from all services in parallel (Promise.allSettled)
5. Transform each service response to common schema
6. Aggregate results
7. Format response per API contract
8. Return response
```

### Error Handling

> Error response format is defined in `API_CONTRACT.yml`. Focus on error catching and mapping logic.

```typescript
try {
    // Validate input
    if (!origin || !destination) {
        return errorResponse(400, "INVALID_INPUT", "Origin and destination are required");
    }

    // Geocode addresses
    const [originCoords, destCoords] = await Promise.all([
        geocode(origin),
        geocode(destination),
    ]);

    if (!originCoords || !destCoords) {
        return errorResponse(400, "LOCATION_NOT_FOUND", "Could not find location");
    }

    // Fetch prices from all services
    const results = await Promise.allSettled([
        fetchUberPrices(originCoords, destCoords, scheduledTime),
        fetchLyftPrices(originCoords, destCoords, scheduledTime),
        // ... other services
    ]);

    // Transform and aggregate results
    const services = results.map((result, index) => {
        if (result.status === "fulfilled") {
            return transformServiceResponse(serviceNames[index], result.value);
        } else {
            return {
                service: serviceNames[index],
                vehicleTypes: [],
                error: result.reason.message,
            };
        }
    });

    // Check if all services failed
    if (services.every((s) => s.error)) {
        return errorResponse(503, "SERVICE_UNAVAILABLE", "All rideshare services are unavailable");
    }

    return successResponse({ origin, destination, scheduledTime, services });
} catch (error) {
    return errorResponse(500, "INTERNAL_ERROR", "Unexpected error occurred");
}
```

## Validation

> **Note**: Basic validation rules (required fields, types, formats) are defined in `API_CONTRACT.yml`. This section covers implementation-specific validation only.

### Implementation-Specific Validation

```typescript
// Validate address format (basic check)
function validateAddress(address: string): { ok: boolean; error?: string } {
    if (!address || address.trim().length === 0) {
        return { ok: false, error: "Address cannot be empty" };
    }
    if (address.length > 500) {
        return { ok: false, error: "Address is too long" };
    }
    return { ok: true };
}

// Validate scheduled time is not too far in the past
function validateScheduledTime(scheduledTime: string | undefined): { ok: boolean; error?: string } {
    if (!scheduledTime) return { ok: true };
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    if (scheduled < now) {
        return { ok: false, error: "Scheduled time cannot be in the past" };
    }
    // Optional: limit how far in the future
    const maxFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    if (scheduled > maxFuture) {
        return { ok: false, error: "Scheduled time cannot be more than 30 days in the future" };
    }
    return { ok: true };
}
```

### Business Rules

> Focus on business logic rules not expressed in the API contract

-   Geocoding must succeed for both origin and destination before fetching prices
-   If a service times out (e.g., 5 seconds), include error in that service's response but continue with others
-   Price results should be cached for 5 minutes to reduce API calls for identical requests
-   Geocoding results should be cached for 1 hour (addresses don't change frequently)

## Security Considerations

### Authentication

-   No authentication required (public feature)

### Authorization

-   N/A (public feature)

### Input Sanitization

-   Sanitize address inputs to prevent injection attacks
-   Validate and limit address length
-   Validate date-time format to prevent malformed requests

### API Key Management

-   Store rideshare service API keys in Cloudflare Workers secrets (wrangler.toml or environment variables)
-   Never expose API keys in responses or logs
-   Rotate keys if compromised

## Performance Optimization

### Caching Strategy

-   **Geocoding cache**: 1 hour TTL (addresses are relatively stable)
-   **Price cache**: 5 minutes TTL (prices change frequently but short cache reduces API calls)
-   Use KV for caching (within free tier limits)

### Edge Computing Benefits

-   Requests processed at edge locations close to users
-   Reduced latency for geocoding and API calls
-   Parallel service calls improve response time

### Rate Limiting

-   Implement per-IP rate limiting to prevent abuse
-   Consider Cloudflare Rate Limiting rules
-   Respect third-party API rate limits

## Implementation Checklist

### API Endpoints

-   [ ] POST /api/rideshare-comparison/compare endpoint
-   [ ] Error handling (per API_CONTRACT.yml)
-   [ ] Input validation
-   [ ] Response transformation

### External Service Integration

-   [ ] Uber API integration
-   [ ] Lyft API integration
-   [ ] Geocoding service integration
-   [ ] Error handling for each service
-   [ ] Timeout handling per service

### Data Layer

-   [ ] Geocoding cache implementation
-   [ ] Price cache implementation (optional)

### Business Logic

-   [ ] Parallel service fetching
-   [ ] Response transformation to common schema
-   [ ] Partial failure handling

## Dependencies

### Workers Libraries

-   Native Workers API
-   `@cloudflare/workers-types` for types

### External APIs

-   Uber API (requires API key)
-   Lyft API (requires API key)
-   Geocoding service (e.g., Google Maps Geocoding API, Mapbox, or similar)

## Error Codes

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

-   Missing origin/destination → `INVALID_INPUT` (400)
-   Geocoding failures → `LOCATION_NOT_FOUND` (400)
-   All services fail → `SERVICE_UNAVAILABLE` (503)
-   Some services fail → 200 with error in individual ServicePrice
-   Invalid date-time format → `INVALID_INPUT` (400)
-   Database/cache errors → `INTERNAL_ERROR` (500)
-   Unexpected exceptions → `INTERNAL_ERROR` (500)

## Monitoring & Logging

-   Log all service API calls (without sensitive data)
-   Track service failure rates
-   Monitor cache hit rates
-   Log geocoding requests
-   Track response times per service

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

-   **DO NOT** duplicate request/response schemas from the API contract
-   **DO NOT** duplicate error codes or validation rules from the API contract
-   **DO** focus on implementation-specific details (external API calls, caching, parallel processing)
-   **DO** reference the API contract when discussing endpoints or data structures
-   All API responses **MUST** match the contract defined in `API_CONTRACT.yml`


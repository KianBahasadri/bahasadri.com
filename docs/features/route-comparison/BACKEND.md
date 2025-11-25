# Route Comparison - Backend Design

**Backend-specific design and implementation requirements. This document is independent of frontend implementation details.**

**IMPORTANT**: This document is downstream from `API_CONTRACT.yml`. Do NOT duplicate request/response schemas, error codes, or validation rules already defined in the API contract. Reference the contract and focus on implementation-specific details only.

## Overview

Backend implementation for the Route Comparison utility. The backend handles fetching routes from multiple navigation APIs (Google Maps, Mapbox, OpenRouteService) in parallel, normalizing the responses, and aggregating them for comparison.

## Code Location

`backend/src/route-comparison/`

## API Contract Reference

**All request/response schemas, error codes, and validation rules are defined in:**
`docs/features/route-comparison/API_CONTRACT.yml`

This document focuses solely on backend implementation details not covered in the API contract.

## API Endpoints

> **Note**: Request/response schemas are defined in `API_CONTRACT.yml`. This section focuses on implementation details only.

### `POST /api/route-comparison/compare`

**Handler**: `compareRoutes()`

**Description**: Fetches routes from multiple navigation APIs in parallel and returns normalized comparison results.

**Implementation Flow**:

1. Parse and validate request body (origin, destination, optional API list)
2. Geocode origin and destination if needed (convert addresses to coordinates)
3. Query each configured API in parallel with the same origin/destination
4. Normalize responses from different APIs into a common format
5. Aggregate results and return comparison response per API contract

**Implementation Notes**:

- **Parallel API Calls**: Use `Promise.allSettled()` to fetch from all APIs simultaneously, allowing some to fail without blocking others
- **Geocoding**: May need to geocode addresses to coordinates before querying route APIs. Consider caching geocoding results in KV
- **Response Normalization**: Each API returns different formats - normalize to the common schema defined in API contract
- **Error Handling**: If an API fails, include an error message in that route result but still return results from successful APIs
- **Rate Limiting**: Respect rate limits for each API. Consider implementing request queuing or caching for frequently requested routes

**Error Handling**:

- Invalid origin/destination → `INVALID_INPUT` (400)
- All APIs fail → `NOT_FOUND` (404)
- Rate limit exceeded → `RATE_LIMIT_EXCEEDED` (429)
- External API errors → Map to appropriate error code or include in individual route error field
- Internal errors → `INTERNAL_ERROR` (500)

## Data Models

> **Note**: API request/response types are defined in `API_CONTRACT.yml`. This section covers internal data models only.

### Internal TypeScript Types

```typescript
// Internal representation of API-specific route response (before normalization)
interface GoogleMapsRouteResponse {
    // Google Maps API specific fields
}

interface MapboxRouteResponse {
    // Mapbox API specific fields
}

interface OpenRouteServiceResponse {
    // OpenRouteService API specific fields
}

// Geocoding result (cached in KV)
interface GeocodeResult {
    address: string;
    coordinates: { lat: number; lng: number };
    timestamp: number; // For cache expiration
}

// API configuration
interface RouteApiConfig {
    google?: {
        apiKey: string;
        enabled: boolean;
    };
    mapbox?: {
        accessToken: string;
        enabled: boolean;
    };
    openrouteservice?: {
        apiKey: string;
        enabled: boolean;
    };
}
```

## Cloudflare Services

### KV (Optional - for caching)

**Binding**: `ROUTE_CACHE`

**Usage**:

- Cache geocoding results to avoid repeated API calls for the same addresses
- Cache route results for common origin/destination pairs (with appropriate TTL)

**Operations**:

```typescript
// Cache geocoding result
await env.ROUTE_CACHE.put(
    `geocode:${address}`,
    JSON.stringify(geocodeResult),
    { expirationTtl: 86400 } // 24 hours
);

// Retrieve cached geocoding
const cached = await env.ROUTE_CACHE.get(`geocode:${address}`);
```

## Workers Logic

### Request Processing Flow

```
1. Receive POST request with origin and destination
2. Validate input (required fields, format)
3. Geocode origin and destination (check cache first)
4. Query all enabled APIs in parallel using Promise.allSettled()
5. Normalize each API response to common format
6. Aggregate results into CompareRoutesResponse
7. Return response per API contract
```

### Error Handling

> Error response format is defined in `API_CONTRACT.yml`. Focus on error catching and mapping logic.

```typescript
try {
    // Validate input
    if (!origin || !destination) {
        return errorResponse(400, "INVALID_INPUT", "Origin and destination are required.");
    }

    // Geocode locations
    const [originCoords, destCoords] = await Promise.all([
        geocode(origin),
        geocode(destination),
    ]);

    if (!originCoords || !destCoords) {
        return errorResponse(404, "NOT_FOUND", "Could not geocode origin or destination.");
    }

    // Fetch routes from all APIs
    const apiResults = await Promise.allSettled([
        fetchGoogleRoute(originCoords, destCoords),
        fetchMapboxRoute(originCoords, destCoords),
        fetchOpenRouteServiceRoute(originCoords, destCoords),
    ]);

    // Normalize and aggregate results
    const routes = apiResults.map((result, index) => {
        if (result.status === 'rejected') {
            return {
                api: apiNames[index],
                error: result.reason.message,
                metrics: null,
                steps: [],
            };
        }
        return normalizeRouteResponse(result.value, apiNames[index]);
    });

    // Check if all APIs failed
    if (routes.every(r => r.error)) {
        return errorResponse(404, "NOT_FOUND", "No routes found from any API.");
    }

    return jsonResponse({
        origin: normalizedOrigin,
        destination: normalizedDestination,
        originCoordinates: originCoords,
        destinationCoordinates: destCoords,
        routes,
    });
} catch (error) {
    if (error instanceof RateLimitError) {
        return errorResponse(429, "RATE_LIMIT_EXCEEDED", error.message);
    }
    return errorResponse(500, "INTERNAL_ERROR", "Unexpected error occurred.");
}
```

## Validation

> **Note**: Basic validation rules (required fields, types, formats) are defined in `API_CONTRACT.yml`. This section covers implementation-specific validation only.

### Implementation-Specific Validation

```typescript
// Validate coordinate format
function validateCoordinates(input: string): { ok: boolean; coords?: { lat: number; lng: number }; error?: string } {
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (coordPattern.test(input)) {
        const [lat, lng] = input.split(',').map(Number);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { ok: true, coords: { lat, lng } };
        }
    }
    return { ok: false, error: "Invalid coordinate format" };
}

// Validate API list
function validateApiList(apis: string[]): { ok: boolean; error?: string } {
    const validApis = ['google', 'mapbox', 'openrouteservice'];
    const invalid = apis.filter(api => !validApis.includes(api));
    if (invalid.length > 0) {
        return { ok: false, error: `Invalid APIs: ${invalid.join(', ')}` };
    }
    return { ok: true };
}
```

### Business Rules

- If no API list is provided, query all enabled APIs
- If an API is disabled or not configured, skip it (don't return an error)
- If all APIs fail, return 404 NOT_FOUND
- If some APIs fail, include error messages in those route results but still return successful results
- Geocode addresses before querying route APIs (coordinates are more reliable)
- Cache geocoding results for 24 hours to reduce API calls

## Security Considerations

### Authentication

- No authentication required (public utility)

### Authorization

- N/A (public feature)

### Input Sanitization

- Validate and sanitize origin/destination inputs to prevent injection attacks
- Validate coordinate ranges (lat: -90 to 90, lng: -180 to 180)
- Limit API list to known valid values

### API Key Management

- Store API keys in Cloudflare Workers secrets (wrangler secret put)
- Never expose API keys in responses or logs
- Rotate keys if compromised

## Performance Optimization

### Caching Strategy

- Cache geocoding results in KV for 24 hours
- Optionally cache route results for common origin/destination pairs (shorter TTL, e.g., 1 hour)
- Use cache headers appropriately

### Edge Computing Benefits

- Low latency for route comparison requests
- Parallel API calls executed efficiently at the edge
- Reduced latency for cached geocoding results

### Rate Limiting

- Implement per-IP rate limiting to prevent abuse
- Respect external API rate limits
- Queue requests if necessary to stay within limits

## Implementation Checklist

### API Endpoints

- [ ] POST /api/route-comparison/compare endpoint
- [ ] Error handling (per API_CONTRACT.yml)
- [ ] Input validation
- [ ] Response normalization

### External API Integration

- [ ] Google Maps Directions API integration
- [ ] Mapbox Directions API integration
- [ ] OpenRouteService Directions API integration
- [ ] Response normalization for each API
- [ ] Error handling for each API

### Geocoding

- [ ] Geocoding service integration (or use route API geocoding)
- [ ] KV caching for geocoding results
- [ ] Coordinate validation

### Data Processing

- [ ] Route response normalization
- [ ] Metrics calculation and formatting
- [ ] Step-by-step directions extraction
- [ ] Polyline encoding/decoding

## Dependencies

### Workers Libraries

- Native Workers API
- `@cloudflare/workers-types` for types

### External APIs

- Google Maps Directions API (optional)
- Mapbox Directions API (optional)
- OpenRouteService Directions API (optional)

## Error Codes

> **All error codes are defined in `API_CONTRACT.yml`.** This section explains implementation-specific error mapping only.

### Error Mapping

How to map internal errors to API contract error codes:

- Invalid origin/destination format → `INVALID_INPUT` (400)
- Geocoding failure → `NOT_FOUND` (404)
- All route APIs fail → `NOT_FOUND` (404)
- External API rate limit → `RATE_LIMIT_EXCEEDED` (429) or include in route error field
- External API errors → Include in individual route error field, or `INTERNAL_ERROR` if all fail
- Network errors → `INTERNAL_ERROR` (500)
- Unexpected errors → `INTERNAL_ERROR` (500)

## Monitoring & Logging

- Log API call failures (without sensitive data)
- Monitor rate limit usage for each external API
- Track geocoding cache hit rates
- Monitor response times for each API
- Alert on high error rates

---

**Note**: This document is downstream from `API_CONTRACT.yml` and independent of frontend implementation.

**Key principles**:

- **DO NOT** duplicate request/response schemas from the API contract
- **DO NOT** duplicate error codes or validation rules from the API contract
- **DO** focus on implementation-specific details (external API integration, response normalization, caching)
- **DO** reference the API contract when discussing endpoints or data structures
- All API responses **MUST** match the contract defined in `API_CONTRACT.yml`


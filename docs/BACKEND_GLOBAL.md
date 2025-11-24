# Backend Documentation

General backend architecture, patterns, and guidelines for the Cloudflare Workers API.

## Overview

The backend is built with:

-   **Cloudflare Workers** - Edge computing runtime
-   **Hono** (or native Workers API) - HTTP framework
-   **TypeScript** - Type safety
-   **Cloudflare Services**: KV, R2, D1

## Architecture

-   **Location**: `backend/src/`
-   **Features**: `backend/src/[feature-name]/` - Each feature is self-contained
-   **API Base**: `/api/[feature-name]/`
-   **Deployment**: Cloudflare Workers

## Patterns

### Route Structure

-   One route file per feature
-   RESTful API design
-   Consistent error handling

### Data Access

-   **KV**: Key-value storage for fast lookups
-   **R2**: Object storage for files
-   **D1**: SQLite database for structured data

### Error Handling

-   Consistent error response format
-   Proper HTTP status codes
-   User-friendly error messages
-   **Structured logging** - All errors are logged with context for debugging

**Error Handling Pattern:**

Use the shared `handleError` utility from `src/lib/error-handling.ts`:

```typescript
import { handleError } from "../lib/error-handling";

app.post("/endpoint", async (c) => {
    try {
        // Your logic here
        return c.json({ success: true }, 200);
    } catch (error) {
        const { response, status } = handleError(error, {
            endpoint: "/api/feature/endpoint",
            method: "POST",
            additionalInfo: {
                // Optional: add context for debugging
                userId: c.env.USER_ID,
            },
        });
        return c.json<ErrorResponse>(response, status);
    }
});
```

**Logging:**

- All errors are automatically logged with:
  - Timestamp
  - Endpoint and method
  - Error message and stack trace
  - Additional context (if provided)
- Logs appear in Wrangler dev server output and Cloudflare dashboard
- Use `console.error` for structured JSON logging (handled by `handleError`)

## Code Organization

Each feature is self-contained in its own directory:

```
backend/src/
├── [feature-name]/    # Feature directory (e.g., sms-messenger)
│   ├── index.ts       # Route handlers
│   ├── lib/           # Feature-specific utilities
│   │   ├── kv-helpers.ts
│   │   ├── twilio.ts
│   │   └── validation.ts
│   └── types.ts       # Feature-specific types
├── types/             # Shared types (e.g., env.ts)
└── index.ts           # Main worker entry point
```

**Feature Structure:**

-   Each feature directory contains all code related to that feature
-   Routes are defined in `[feature-name]/index.ts`
-   Feature-specific utilities go in `[feature-name]/lib/`
-   Feature-specific types go in `[feature-name]/types.ts`
-   Shared types (like `Env`) remain in `src/types/`

## Development

-   **Local Dev**: `pnpm dev` (runs Wrangler dev server with local bindings)
-   **Preview**: `pnpm preview` (runs Wrangler dev server with remote Cloudflare resources - production-like testing)
-   **Deploy**: `pnpm deploy` (deploys to Cloudflare)

## Deployment

-   **Platform**: Cloudflare Workers
-   **Configuration**: `wrangler.toml`
-   **Bindings**: KV, R2, D1 configured in `wrangler.toml`

## Official Documentation

-   [Cloudflare Workers](https://developers.cloudflare.com/workers/llms-full.txt)
-   [Hono](https://hono.dev/llms.txt)
-   [Cloudflare KV](https://developers.cloudflare.com/kv/llms-full.txt)
-   [Cloudflare R2](https://developers.cloudflare.com/r2/llms-full.txt)
-   [Cloudflare D1](https://developers.cloudflare.com/d1/llms-full.txt)
-   [OpenRouter](https://openrouter.ai/docs/llms.txt)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/)
-   [TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)

## Related Documentation

-   Feature-specific backend design: `docs/features/[feature-name]/BACKEND.md`
-   API contracts: `docs/features/[feature-name]/API_CONTRACT.md`
-   Frontend documentation: [FRONTEND_GLOBAL.md](./FRONTEND_GLOBAL.md)

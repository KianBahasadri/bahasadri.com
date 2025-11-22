# Backend Documentation

General backend architecture, patterns, and guidelines for the Cloudflare Workers API.

## Overview

The backend is built with:
- **Cloudflare Workers** - Edge computing runtime
- **Hono** (or native Workers API) - HTTP framework
- **TypeScript** - Type safety
- **Cloudflare Services**: KV, R2, D1

## Architecture

- **Location**: `backend/src/`
- **Routes**: `backend/src/routes/`
- **API Base**: `/api/tools/[feature-name]/`
- **Deployment**: Cloudflare Workers

## Patterns

### Route Structure
- One route file per feature
- RESTful API design
- Consistent error handling

### Data Access
- **KV**: Key-value storage for fast lookups
- **R2**: Object storage for files
- **D1**: SQLite database for structured data

### Error Handling
- Consistent error response format
- Proper HTTP status codes
- User-friendly error messages

## Code Organization

```
backend/src/
├── routes/         # API route handlers
│   └── [feature]/
│       └── index.ts
├── lib/           # Shared utilities
├── types/         # TypeScript types
└── index.ts       # Main worker entry point
```

## Development

- **Local Dev**: `pnpm dev` (runs Wrangler dev server)
- **Build**: `pnpm build` (compiles TypeScript)
- **Deploy**: `pnpm deploy` (deploys to Cloudflare)

## Deployment

- **Platform**: Cloudflare Workers
- **Configuration**: `wrangler.toml`
- **Bindings**: KV, R2, D1 configured in `wrangler.toml`

## Related Documentation

- Feature-specific backend design: `docs/features/[feature-name]/BACKEND.md`
- API contracts: `docs/features/[feature-name]/API_CONTRACT.md`
- Frontend documentation: [FRONTEND_GLOBAL.md](./FRONTEND_GLOBAL.md)


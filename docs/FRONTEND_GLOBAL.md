# Frontend Documentation

General frontend architecture, patterns, and guidelines for the React + Vite application.

## Overview

The frontend is built with:

-   **React** - UI library
-   **Vite** - Build tool and dev server
-   **React Router** - Client-side routing
-   **TanStack Query** - Server state management
-   **TypeScript** - Type safety
-   **CSS Modules** - Scoped styling

## Architecture

-   **Location**: `frontend/src/`
-   **Pages**: `frontend/src/pages/`
-   **Components**: `frontend/src/components/`
-   **API Client**: `frontend/src/lib/api.ts`

## Patterns

### Component Structure

-   One component per file
-   CSS Modules for styling
-   TypeScript interfaces for props

### State Management

-   **Server State**: TanStack Query
-   **Local State**: React useState
-   **Global State**: Context API (if needed)

### Routing

-   React Router v6
-   File-based routing structure
-   Route definitions in `frontend/src/App.tsx`

## Code Organization

```
frontend/src/
├── pages/           # Page components
├── components/      # Reusable components
├── lib/            # Utilities and API client
├── types/          # TypeScript types
└── App.tsx         # Root component with routing
```

## Development

-   **Dev Server**: `pnpm dev` (runs Vite dev server)
-   **Build**: `pnpm build` (outputs to `dist/`)
-   **Preview**: `pnpm preview` (preview production build)

## Deployment

-   **Platform**: Cloudflare Pages
-   **Build Command**: `pnpm build`
-   **Output Directory**: `dist/`

## Official Documentation

-   [React](https://react.dev/)
-   [Vite](https://vite.dev/guide/)
-   [React Router](https://reactrouter.com/en/main)
-   [TanStack Query](https://tanstack.com/query/latest)
-   [TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
-   [Cloudflare Pages](https://developers.cloudflare.com/pages/llms-full.txt)

## Related Documentation

-   Feature-specific frontend design: `docs/features/[feature-name]/FRONTEND.md`
-   API contracts: `docs/features/[feature-name]/API_CONTRACT.md`
-   Backend documentation: [BACKEND_GLOBAL.md](./BACKEND_GLOBAL.md)

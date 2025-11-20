c# Architecture Documentation

## Overview

This document describes the architecture, design decisions, and technical implementation of Bahasadri.com. The project is built with Next.js 15 and deployed on Cloudflare Workers, leveraging edge computing for optimal performance.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS Request
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Edge Network                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Cloudflare Workers                      │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │      OpenNext Cloudflare Adapter           │  │  │
│  │  │  ┌──────────────────────────────────────┐  │  │  │
│  │  │  │         Next.js Application          │  │  │  │
│  │  │  │  - App Router                         │  │  │  │
│  │  │  │  - Server Components                  │  │  │  │
│  │  │  │  - Route Handlers                     │  │  │  │
│  │  │  └──────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Static Assets (R2/Workers Assets)        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Technologies

1. **Next.js 15**

    - React framework for full-stack applications
    - App Router for modern routing
    - Server Components for optimal performance
    - Built-in optimizations (image, font, script)

2. **Cloudflare Workers**

    - Edge computing platform
    - Global distribution (300+ locations)
    - Sub-millisecond response times
    - Serverless execution model

3. **TypeScript**

    - Type safety and better developer experience
    - Compile-time error detection
    - Enhanced IDE support

4. **OpenNext Cloudflare Adapter**
    - Transforms Next.js applications for Cloudflare
    - Enables Next.js features on Workers runtime
    - Handles routing, rendering, and asset serving

## Application Architecture

### File Structure

```
app/
├── layout.tsx          # Root layout (Server Component)
├── page.tsx            # Home page / Dashboard (Server Component)
├── page.module.css     # Scoped styles for home page
├── globals.css         # Global styles
├── components/         # Shared components
│   ├── Navigation/
│   └── UtilityCard/
└── tools/              # Utility tools (decoupled)
    └── [utility-name]/
        ├── page.tsx
        ├── page.module.css
        ├── PLAN.md     # Documentation and planning
        └── components/ # Utility-specific components
```

### Component Architecture

#### Server Components (Default)

-   **Location**: `app/` directory
-   **Execution**: Server/Edge runtime
-   **Benefits**:
    -   No JavaScript sent to client
    -   Direct database/API access
    -   Smaller bundle sizes
    -   Better SEO

#### Client Components (When Needed)

-   **Marker**: `'use client'` directive
-   **Execution**: Browser runtime
-   **Use Cases**:
    -   Interactivity (onClick, onChange)
    -   Browser APIs (localStorage, window)
    -   React hooks (useState, useEffect)

### Rendering Strategies

1. **Static Site Generation (SSG)**

    - Default for pages without dynamic data
    - Generated at build time
    - Served as static files

2. **Server-Side Rendering (SSR)**

    - Rendered on each request
    - Use for dynamic, personalized content
    - Configure with `export const dynamic = 'force-dynamic'`

3. **Incremental Static Regeneration (ISR)**
    - Static pages with periodic revalidation
    - Best of both worlds (performance + freshness)
    - Configure with `revalidate` option

## Data Flow

### Request Flow

```
1. User Request
   ↓
2. Cloudflare Edge (nearest location)
   ↓
3. Cloudflare Worker
   ↓
4. OpenNext Adapter
   ↓
5. Next.js Router
   ↓
6. Server Component / Route Handler
   ↓
7. Data Fetching (if needed)
   ↓
8. HTML Generation
   ↓
9. Response to User
```

### Component Rendering Flow

```
Server Component
  ↓
  ├─→ Fetch Data (Server)
  ├─→ Render HTML
  └─→ Send to Client
       ↓
       Client Component (if needed)
         ↓
         ├─→ Hydrate
         └─→ Add Interactivity
```

## Styling Architecture

### CSS Modules

-   **Location**: `*.module.css` files
-   **Scope**: Component-level
-   **Benefits**:
    -   No style conflicts
    -   Dead code elimination
    -   Type-safe class names

### Global Styles

-   **Location**: `app/globals.css`
-   **Scope**: Application-wide
-   **Use Cases**:
    -   CSS resets
    -   Typography
    -   CSS variables
    -   Base element styles

## Deployment Architecture

### Build Process

```
1. Next.js Build
   ├─→ Compile TypeScript
   ├─→ Bundle JavaScript
   ├─→ Optimize Images
   └─→ Generate Static Assets
   ↓
2. OpenNext Transformation
   ├─→ Convert for Cloudflare
   ├─→ Generate Worker Script
   └─→ Prepare Assets
   ↓
3. Wrangler Deployment
   ├─→ Upload Worker
   ├─→ Upload Assets
   └─→ Configure Routes
```

### Runtime Environment

-   **Runtime**: `workerd` (Cloudflare's V8 isolate)
-   **Compatibility**: Node.js APIs via `nodejs_compat` flag
-   **Limitations**:
    -   No file system access
    -   No native modules
    -   Request/Response based

## Performance Optimizations

### Edge Computing

-   **Global Distribution**: Content served from nearest edge location
-   **Low Latency**: Sub-50ms response times
-   **Scalability**: Automatic scaling

### Next.js Optimizations

-   **Code Splitting**: Automatic per-route
-   **Image Optimization**: Via Cloudflare Images
-   **Font Optimization**: Automatic font loading
-   **Script Optimization**: Automatic script deferring

### Caching Strategy

-   **Static Assets**: Long-term caching
-   **HTML Pages**: Based on rendering strategy
-   **API Responses**: Configurable via OpenNext

## Security Considerations

### Built-in Security

-   **HTTPS**: Enforced by Cloudflare
-   **DDoS Protection**: Cloudflare's network
-   **WAF**: Web Application Firewall available
-   **CSP**: Content Security Policy support

### Best Practices

-   Environment variables for secrets
-   Input validation
-   Output sanitization
-   Rate limiting (via Cloudflare)

## Scalability

### Horizontal Scaling

-   **Automatic**: Cloudflare handles scaling
-   **Global**: 300+ edge locations
-   **No Limits**: Pay-per-use model

### Vertical Scaling

-   **CPU Time**: 50ms CPU time per request (free tier)
-   **Memory**: 128MB per request
-   **Concurrent Requests**: Unlimited

## Monitoring and Observability

### Cloudflare Analytics

-   Request metrics
-   Error rates
-   Response times
-   Geographic distribution

### Logging

-   Console logs in Workers
-   Real-time logs via Wrangler
-   Structured logging recommended

## Future Considerations

### Potential Enhancements

1. **KV Storage**: For caching and session storage
2. **Durable Objects**: For real-time features
3. **R2 Storage**: For file uploads
4. **Queues**: For background jobs
5. **Workflows**: For multi-step processes

### Migration Paths

-   Easy to add new routes
-   Simple to add API endpoints
-   Straightforward to add database connections
-   Can integrate with Cloudflare services

## Design Decisions

### Why Next.js?

-   Modern React framework
-   Excellent developer experience
-   Built-in optimizations
-   Strong ecosystem

### Why Cloudflare Workers?

-   Edge computing performance
-   Global distribution
-   Cost-effective
-   Easy deployment

### Why OpenNext Adapter?

-   Official Cloudflare support
-   Feature compatibility
-   Active maintenance
-   Community support

## References

-   [Next.js Architecture](https://nextjs.org/docs/app/building-your-application/rendering)
-   [Cloudflare Workers Architecture](https://developers.cloudflare.com/workers/)
-   [OpenNext Documentation](https://opennext.js.org/cloudflare)

---

**Last Updated**: 2025-01-27

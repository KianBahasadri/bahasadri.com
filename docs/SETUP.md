# Setup & Configuration Guide

**Complete guide for setting up the project, configuring environment variables, and deploying.**

## Prerequisites & Initial Setup

### Required Tools

-   **Node.js**: 18+ (LTS recommended)
-   **pnpm**: 8+ (`npm install -g pnpm`)
-   **Cloudflare Account**: With Workers, Pages, R2, KV, D1 access
-   **Wrangler CLI**: Installed via pnpm (`pnpm add -D wrangler`)

### Project Structure

```
bahasadri.com/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/# Reusable components
│   │   ├── lib/       # Utilities and API client
│   │   └── App.tsx    # Root component with routing
│   └── package.json
├── backend/           # Cloudflare Workers backend
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── lib/       # Shared utilities
│   │   └── index.ts   # Main worker entry point
│   ├── package.json
│   └── wrangler.toml  # Workers configuration
└── docs/              # Documentation
```

### Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables (see Environment Variables section)
# Create Cloudflare services (see Cloudflare Services section)
```

## Cloudflare Services & Configuration

### Create Services

```bash
# R2 Bucket (File Hosting)
pnpm wrangler r2 bucket create file-hosting-prod

# KV Namespace (SMS Messenger)
pnpm wrangler kv:namespace create "SMS_MESSAGES"
pnpm wrangler kv:namespace create "SMS_MESSAGES" --preview

# D1 Database (File Hosting)
pnpm wrangler d1 create file-hosting
pnpm wrangler d1 execute file-hosting --file=docs/schemas/file-hosting.sql

# Optional: Queue (File Compression)
pnpm wrangler queues create file-compression
```

### Database Schema

**Location**: `docs/schemas/file-hosting.sql`

```sql
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    original_size INTEGER NOT NULL,
    compressed_size INTEGER,
    mime_type TEXT NOT NULL,
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    compression_status TEXT NOT NULL DEFAULT 'pending',
    original_url TEXT NOT NULL,
    compressed_url TEXT,
    compression_ratio REAL,
    access_count INTEGER NOT NULL DEFAULT 0,
    last_accessed DATETIME,
    deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1))
);

CREATE TABLE IF NOT EXISTS access_logs (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    organization TEXT,
    asn TEXT,
    FOREIGN KEY (file_id) REFERENCES files (id)
);

CREATE TABLE IF NOT EXISTS whois_cache (
    ip_address TEXT PRIMARY KEY,
    country TEXT,
    organization TEXT,
    asn TEXT,
    cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_files_upload_time ON files (upload_time DESC);
CREATE INDEX IF NOT EXISTS idx_files_deleted ON files (deleted);
CREATE INDEX IF NOT EXISTS idx_access_logs_file_timestamp ON access_logs (file_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whois_cache_expires ON whois_cache (expires_at);
```

## Environment Variables

### Required

-   `TWILIO_ACCOUNT_SID` - Twilio account identifier
-   `TWILIO_AUTH_TOKEN` - Twilio API authentication token
-   `TWILIO_PHONE_NUMBER` - Twilio phone number (E.164 format, e.g., `+1234567890`)
-   `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
-   `CLOUDFLARE_REALTIME_APP_ID` - RealtimeKit app ID
-   `CLOUDFLARE_REALTIME_API_TOKEN` - RealtimeKit API token
-   `CLOUDFLARE_REALTIME_GLOBAL_ROOM_ID` - Global room ID

### Optional

-   `WHOIS_API_KEY` - IP geolocation service API key (for file hosting analytics)

### Local Development

Create `.env.local` files:

**`frontend/.env.local`**:

```env
VITE_API_URL=http://localhost:8787/api
```

**`backend/.env.local`**:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_REALTIME_APP_ID=your_app_id
CLOUDFLARE_REALTIME_API_TOKEN=your_api_token
CLOUDFLARE_REALTIME_GLOBAL_ROOM_ID=your_room_id
WHOIS_API_KEY=your_whois_key
```

### Production Secrets

Set secrets using Wrangler (required variables only):

```bash
pnpm wrangler secret put TWILIO_ACCOUNT_SID
pnpm wrangler secret put TWILIO_AUTH_TOKEN
pnpm wrangler secret put TWILIO_PHONE_NUMBER
pnpm wrangler secret put CLOUDFLARE_ACCOUNT_ID
pnpm wrangler secret put CLOUDFLARE_REALTIME_APP_ID
pnpm wrangler secret put CLOUDFLARE_REALTIME_API_TOKEN
pnpm wrangler secret put CLOUDFLARE_REALTIME_GLOBAL_ROOM_ID
```

Optional:

```bash
pnpm wrangler secret put WHOIS_API_KEY
```

## Development

### Frontend

```bash
cd frontend
pnpm dev  # Runs on http://localhost:5173
```

### Backend

```bash
cd backend
pnpm dev      # Wrangler dev server (active development)
pnpm preview  # Production-like build testing
# API runs on http://localhost:8787
```

### Full Stack

Run both in separate terminals:

```bash
# Terminal 1: Frontend
cd frontend && pnpm dev

# Terminal 2: Backend
cd backend && pnpm dev
```

**Note**: Frontend should proxy API requests to `http://localhost:8787/api` during development.

## Build & Deployment

### Build

```bash
# Frontend
cd frontend && pnpm build  # Output: frontend/dist/

# Backend
cd backend && pnpm build    # Output: Compiled TypeScript
```

### Deploy

**Frontend (Cloudflare Pages)**:

```bash
cd frontend && pnpm deploy
```

**Or via Cloudflare Dashboard**:

1. Connect repository to Cloudflare Pages
2. Build command: `pnpm build`
3. Output directory: `dist`
4. Root directory: `frontend`

**Backend (Cloudflare Workers)**:

```bash
cd backend && pnpm deploy
```

Uses `wrangler.toml` for configuration.

## Additional Resources

-   [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
-   [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
-   [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
-   [Twilio API Docs](https://www.twilio.com/docs)
-   [Cloudflare RealtimeKit Docs](https://developers.cloudflare.com/realtime/)

---

**Note**: For feature-specific implementation details, see `docs/features/[feature-name]/`.

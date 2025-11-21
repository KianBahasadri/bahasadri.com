# File Hosting Utility - Quick Reference

## 🚀 Quick Start

### Essential Commands

```bash
# Create R2 bucket
pnpm wrangler r2 bucket create file-hosting-prod
pnpm wrangler r2 bucket create file-hosting-preview

# Create Queues
pnpm wrangler queues create file-compression

# Create D1 database
pnpm wrangler d1 create file-hosting

# Run migrations
pnpm wrangler d1 execute file-hosting --file ./app/tools/file-hosting/schema.sql

# Local development
pnpm dev

# Test preview
pnpm preview

# Deploy
pnpm deploy
```

### wrangler.toml Configuration

Add these sections:

```toml
[[r2_buckets]]
binding = "file_hosting_prod"
bucket_name = "file-hosting-prod"

[[r2_buckets]]
binding = "file_hosting_prod"
bucket_name = "file-hosting-preview"
preview = true

[[queues.producers]]
binding = "FILE_COMPRESSION_QUEUE"
queue = "file-compression"

[[d1_databases]]
binding = "FILE_HOSTING_DB"
database_name = "file-hosting"
database_id = "YOUR_DB_ID_HERE"
```

### Environment Secrets

```bash
pnpm wrangler secret put WHOIS_API_KEY
# Enter your IP-API or ipinfo.io key

pnpm wrangler secret put R2_ACCOUNT_ID
pnpm wrangler secret put R2_ACCESS_KEY_ID
pnpm wrangler secret put R2_SECRET_ACCESS_KEY
```

---

## 📂 File Structure

```
app/tools/file-hosting/
├── page.tsx                    # Entry point (Server Component)
├── page.module.css             # Page styles
├── PLAN.md                     # Comprehensive planning document
├── IMPLEMENTATION_SUMMARY.md   # Current status & next steps
├── QUICK_REFERENCE.md          # This file
├── schema.sql                  # Database schema (create in Phase 1)
├── components/
│   ├── UploadZone.tsx          # Phase 1: Upload component
│   ├── UploadZone.module.css
│   ├── FileList.tsx            # Phase 1: File listing
│   ├── FileList.module.css
│   ├── FileAnalytics.tsx       # Phase 4: Analytics dashboard
│   ├── FileAnalytics.module.css
│   ├── AccessLog.tsx           # Phase 3: Access log table
│   └── AccessLog.module.css
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── database.ts             # D1 queries
│   ├── r2.ts                   # R2 operations
│   ├── validation.ts           # File validation
│   ├── whois.ts                # WHOIS lookups & caching
│   └── compression.ts          # Compression utilities
└── api/
    └── tools/file-hosting/
        ├── upload/route.ts     # Upload endpoint
        ├── download/[fileId]/route.ts  # Download endpoint (tracked)
        ├── files/route.ts      # List files
        ├── files/[id]/route.ts # Get file details
        └── whois/[ip]/route.ts # WHOIS lookup
```

---

## 🗂️ Database Schema (Phase 1)

```sql
-- Files table
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  original_size INTEGER NOT NULL,
  compressed_size INTEGER,
  mime_type TEXT,
  upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  compression_status TEXT,
  original_url TEXT,
  compressed_url TEXT,
  compression_ratio REAL,
  access_count INTEGER DEFAULT 0,
  last_accessed DATETIME,
  deleted BOOLEAN DEFAULT 0
);

-- Access logs table
CREATE TABLE access_logs (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  organization TEXT,
  asn TEXT,
  FOREIGN KEY(file_id) REFERENCES files(id)
);

-- WHOIS cache table
CREATE TABLE whois_cache (
  ip_address TEXT PRIMARY KEY,
  country TEXT,
  organization TEXT,
  asn TEXT,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

-- Indexes for performance
CREATE INDEX idx_files_deleted ON files(deleted);
CREATE INDEX idx_access_file ON access_logs(file_id);
CREATE INDEX idx_access_timestamp ON access_logs(timestamp);
CREATE INDEX idx_whois_expires ON whois_cache(expires_at);
```

---

## 📡 API Endpoints Overview

### Phase 1: Upload & Download

```
POST   /api/tools/file-hosting/upload
       Upload file to R2, store metadata

GET    /api/tools/file-hosting/download/[fileId]
       Download file (tracked access)

GET    /api/tools/file-hosting/files
       List all uploaded files

GET    /api/tools/file-hosting/files/[id]
       Get file metadata + basic stats
```

### Phase 2: Compression

```
Queue message format:
{
  fileId: string,
  fileName: string,
  mimeType: string,
  r2Key: string,
  originalSize: number
}

Queue consumer: app/api/tools/file-hosting/queue-consumer.ts
```

### Phase 3: WHOIS & Access Tracking

```
GET    /api/tools/file-hosting/whois/[ip]
       Get cached WHOIS data for IP (with lookup fallback)

GET    /api/tools/file-hosting/access-logs/[fileId]
       Get access logs for a file (paginated)
```

### Phase 4: Analytics

```
GET    /api/tools/file-hosting/analytics/[fileId]
       Get aggregated analytics:
       - Total downloads
       - Unique IPs
       - Geographic distribution
       - Top accessing organizations
       - User agent breakdown
       - Access timeline (hourly)
```

---

## 🔑 Key Types (Phase 1)

```typescript
interface FileMetadata {
  id: string;
  name: string;
  originalSize: number;
  compressedSize?: number;
  mimeType: string;
  uploadTime: Date;
  compressionStatus: 'pending' | 'processing' | 'done' | 'failed';
  originalUrl: string;
  compressedUrl?: string;
  compressionRatio?: number;
  accessCount: number;
  lastAccessed?: Date;
}

interface AccessLog {
  id: string;
  fileId: string;
  ipAddress: string;
  timestamp: Date;
  userAgent: string;
  referrer?: string;
  country?: string;
  organization?: string;
  asn?: string;
}

interface WhoisData {
  ipAddress: string;
  country: string;
  organization: string;
  asn: string;
  cachedAt: Date;
  expiresAt: Date;
}
```

---

## 🎯 Phase-by-Phase Checklist

### Phase 1: Foundation

- [ ] Create schema.sql and run migrations
- [ ] Implement `lib/types.ts` with all interfaces
- [ ] Implement `lib/database.ts` with D1 queries
- [ ] Implement `lib/r2.ts` for R2 operations
- [ ] Implement `lib/validation.ts` for file validation
- [ ] Create `api/tools/file-hosting/upload/route.ts`
- [ ] Create `api/tools/file-hosting/download/[fileId]/route.ts`
- [ ] Create `components/UploadZone.tsx` (Client Component)
- [ ] Create `components/FileList.tsx` (Client Component)
- [ ] Test: Upload file, verify in R2, download and track access
- [ ] Update page.tsx to use real components

### Phase 2: Compression

- [ ] Set up Queues in wrangler.toml
- [ ] Implement Queue message handling in upload route
- [ ] Create compression worker (app/api/tools/file-hosting/queue-consumer.ts)
- [ ] Implement `lib/compression.ts` for compression logic
- [ ] Handle file replacement (delete old, update URL)
- [ ] Update FileList to show compression status
- [ ] Test: Upload file, verify compression starts, check result

### Phase 3: WHOIS Tracking

- [ ] Implement `lib/whois.ts` for lookups and caching
- [ ] Update download route to capture full access data
- [ ] Create `api/tools/file-hosting/whois/[ip]/route.ts`
- [ ] Create `components/AccessLog.tsx` for detailed table
- [ ] Test: Download multiple files from different IPs, verify WHOIS cached

### Phase 4: Analytics

- [ ] Create `api/tools/file-hosting/analytics/[fileId]/route.ts`
- [ ] Implement aggregation queries in database.ts
- [ ] Create `components/FileAnalytics.tsx` with charts
- [ ] Add date range filtering
- [ ] Implement geographic visualization
- [ ] Test: Generate test access logs, verify analytics

### Phase 5: Polish

- [ ] Optimize database queries (add indexes)
- [ ] Implement pagination for large datasets
- [ ] Error handling and edge cases
- [ ] UI/UX refinement
- [ ] Performance testing
- [ ] Documentation in code

---

## 🧪 Testing Checklist

**Phase 1 Manual Test**:
1. Upload a text file (< 1MB)
2. Verify file appears in list
3. Get public URL
4. Download file from public URL
5. Check database for access log
6. Verify IP captured correctly

**Phase 2 Manual Test**:
1. Upload image file
2. Check compression_status = 'pending'
3. Wait ~30 seconds for Queue processing
4. Verify compressed_url updated
5. Compare file sizes (should be smaller)

**Phase 3 Manual Test**:
1. Download from different IPs/VPNs
2. Verify WHOIS data populated
3. Check WHOIS cache working (same IP = no new lookup)
4. View access log table

**Phase 4 Manual Test**:
1. Generate 100+ downloads from various IPs
2. View analytics dashboard
3. Verify charts show correct data
4. Test date range filtering

---

## 🚨 Common Issues & Fixes

**Issue**: "R2_BUCKET binding missing"
- **Fix**: Ensure wrangler.toml has `[[r2_buckets]]` section with correct binding name

**Issue**: "D1 database not found"
- **Fix**: Run `pnpm wrangler d1 create file-hosting` and add database_id to wrangler.toml

**Issue**: "WHOIS API rate limited"
- **Fix**: Implement caching (already in PLAN), consider upgrading API tier

**Issue**: Queue messages not processing
- **Fix**: Ensure queue consumer route exists and is properly deployed

**Issue**: Large files timing out
- **Fix**: Use multipart upload for > 100MB files (Phase 1 enhancement)

---

**Last Updated**: 2025-01-27


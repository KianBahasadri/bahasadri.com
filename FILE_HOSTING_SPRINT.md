# File Hosting Utility - 2-Day Sprint Tracker

**Status**: 🚀 STARTING SPRINT
**Timeline**: 24 Hours (2 Days)
**Goal**: Complete File Arsenal from foundation to production-ready analytics

---

## 📊 Overall Progress

```
Phase 1: [ ] Foundation & Storage (1-4h)
Phase 2: [ ] Compression Pipeline (5-8h)
Phase 3: [ ] IP Tracking & WHOIS (9-12h)
Phase 4: [ ] Analytics Dashboard (13-18h)
Phase 5: [ ] Polish & Production (19-24h)
```

---

## Phase 1: Foundation & Storage (Hours 1-4)

### 1a: Database Schema & Setup (1 hour)

- [ ] Create `schema.sql` with tables:
  - files (id, name, originalSize, compressedSize, mimeType, uploadTime, compressionStatus, urls, accessCount, lastAccessed, deleted)
  - access_logs (id, fileId, ipAddress, timestamp, userAgent, referrer, country, organization, asn)
  - whois_cache (ipAddress, country, organization, asn, cachedAt, expiresAt)
- [ ] Set up Cloudflare D1 database
- [ ] Create indexes for performance
- [ ] Test schema with sample query

**Files**: `app/tools/file-hosting/schema.sql`

**Validation**: `SELECT * FROM sqlite_master WHERE type='table'` returns 3 tables

---

### 1b: Type Definitions & Utilities (1 hour)

- [ ] `lib/types.ts` - All TypeScript interfaces
  - FileMetadata, AccessLog, WhoisData, CompressionJob, UploadRequest, UploadResponse
- [ ] `lib/database.ts` - D1 query helpers
  - insertFile, getFile, listFiles, insertAccessLog, getAccessLogs, cacheWhois, getWhoisCache
- [ ] `lib/r2.ts` - R2 operations
  - uploadFile, getFileUrl, deleteFile, fileExists
- [ ] `lib/validation.ts` - Validation utilities
  - validateFileSize, validateMimeType, validatePhoneNumber, formatBytes

**Files**:
- `app/tools/file-hosting/lib/types.ts`
- `app/tools/file-hosting/lib/database.ts`
- `app/tools/file-hosting/lib/r2.ts`
- `app/tools/file-hosting/lib/validation.ts`

**Validation**: All compile with TypeScript, no `any` types

---

### 1c: Upload API Route (1 hour)

- [ ] Create `api/tools/file-hosting/upload/route.ts`
  - Parse multipart form data
  - Validate file (size, type)
  - Generate unique file ID
  - Upload to R2
  - Store metadata in database
  - Return response with file URL
- [ ] Handle errors gracefully
- [ ] Add proper error status codes

**Files**: `app/api/tools/file-hosting/upload/route.ts`

**Validation**: `curl -X POST localhost:3000/api/tools/file-hosting/upload -F "file=@test.txt"` returns URL

---

### 1d: Download Tracking & UI Scaffold (1 hour)

- [ ] Create `api/tools/file-hosting/download/[fileId]/route.ts`
  - Get file from database
  - Log access (IP, timestamp, user agent)
  - Redirect to R2 URL
  - Update access count
- [ ] Create `components/UploadZone.tsx` (initial skeleton)
- [ ] Create `components/FileList.tsx` (initial skeleton)
- [ ] Update `page.tsx` to import components

**Files**:
- `app/api/tools/file-hosting/download/[fileId]/route.ts`
- `app/tools/file-hosting/components/UploadZone.tsx`
- `app/tools/file-hosting/components/FileList.tsx`

**Validation**: Upload file → see in database → download link works → access logged

---

## Phase 2: Compression Pipeline (Hours 5-8)

### 2a: Queues & Consumer Setup (1 hour)

- [ ] Set up Cloudflare Queues (via wrangler.toml)
- [ ] Create Queue consumer route handler
  - Export `queued(batch)` function
  - Process CompressionJob messages
  - Download file from R2
  - Compress based on mime type
  - Upload compressed version
  - Update database
  - Delete original
  - Handle errors with retry

**Files**: `app/api/tools/file-hosting/queues/compression.ts`

**Validation**: Queue message created and processed successfully

---

### 2b: Compression Logic (1.5 hours)

- [ ] Create `lib/compression.ts`
  - `compressJSON()` - gzip text files
  - `compressImage()` - WebP conversion
  - `shouldCompress()` - file type check
  - `getCompressionRatio()` - calculate savings
- [ ] Integrate with existing compression libraries
- [ ] Test with multiple file types
- [ ] Log compression metadata

**Files**: `app/tools/file-hosting/lib/compression.ts`

**Validation**: Upload image → see WebP version, compression ratio logged

---

### 2c: Queue Integration & UI Updates (1.5 hours)

- [ ] Update upload route to queue compression jobs
- [ ] Update database schema (if needed) for compression status
- [ ] Implement `components/UploadZone.tsx` (real implementation)
  - Drag-and-drop file input
  - File validation feedback
  - Upload progress bar
  - Success/error messages
- [ ] Implement `components/FileList.tsx` (real implementation)
  - List uploaded files
  - Show compression status (pending/processing/done)
  - Show file size and compressed size
  - Quick actions (copy link, delete)

**Files**:
- `app/api/tools/file-hosting/upload/route.ts` (update)
- `app/tools/file-hosting/components/UploadZone.tsx`
- `app/tools/file-hosting/components/FileList.tsx`

**Validation**: Upload file → see pending state → compression completes → URL updates

---

## Phase 3: IP Tracking & WHOIS (Hours 9-12)

### 3a: WHOIS Integration & Caching (1.5 hours)

- [ ] Create `lib/whois.ts`
  - `lookupWhois(ip)` - IP-API integration
  - `getCachedWhois(ip)` - check cache
  - `cacheWhois(whoisData)` - cache for 30 days
  - `shouldRefreshCache(ip)` - check expiration
- [ ] Set up IP-API integration (or ipinfo.io)
- [ ] Implement caching logic to prevent rate limiting
- [ ] Handle API errors gracefully

**Files**: `app/tools/file-hosting/lib/whois.ts`

**Validation**: WHOIS lookup works, data cached, second lookup doesn't call API

---

### 3b: Access Log Enrichment (1 hour)

- [ ] Update download route:
  - Extract client IP
  - Lookup WHOIS on first access
  - Store full access data (IP, country, org, ASN, user agent, referrer)
- [ ] Create `api/tools/file-hosting/access-logs/[fileId]/route.ts`
  - GET returns paginated access logs
  - Sort by timestamp (newest first)
  - Filter options (IP, country)

**Files**:
- `app/api/tools/file-hosting/download/[fileId]/route.ts` (update)
- `app/api/tools/file-hosting/access-logs/[fileId]/route.ts`

**Validation**: Download from different IP → WHOIS data captured → access log API works

---

### 3c: Access Log UI (1.5 hours)

- [ ] Create `components/AccessLog.tsx` (Client Component)
  - Display access log table (paginated)
  - Columns: IP, Country, Organization, ASN, User Agent, Timestamp
  - Sort by column
  - Search/filter by IP or country
  - Copy IP button
  - Expand WHOIS details

**Files**: `app/tools/file-hosting/components/AccessLog.tsx`

**Validation**: View access log → see all accesses with geographic data → can filter

---

## Phase 4: Analytics Dashboard (Hours 13-18)

### 4a: Analytics Aggregation (1.5 hours)

- [ ] Create `api/tools/file-hosting/analytics/[fileId]/route.ts`
  - GET returns analytics object:
    - totalDownloads, uniqueIPs
    - downloads by country (top 10)
    - downloads by organization (top 10)
    - user agent breakdown
    - access timeline (hourly buckets for last 7 days)
- [ ] Optimize queries for performance
- [ ] Handle edge cases (no data, etc.)

**Files**: `app/api/tools/file-hosting/analytics/[fileId]/route.ts`

**Validation**: API returns correct aggregations, fast response times

---

### 4b: Charts & Visualization (2 hours)

- [ ] Create `components/FileAnalytics.tsx` (Client Component)
  - Timeline chart (recharts) - downloads over time
  - Pie chart - geographic distribution
  - Bar chart - top organizations
  - User agent breakdown
  - Stats cards (total downloads, unique IPs, top country)
- [ ] Make responsive
- [ ] Add chart interactivity

**Files**: `app/tools/file-hosting/components/FileAnalytics.tsx`

**Validation**: Charts render with data, responsive on mobile

---

### 4c: File Detail View & Integration (1.5 hours)

- [ ] Create file detail modal/page
  - Tabs: Files → Analytics → Access Log
  - Show file metadata (size, compression ratio, upload time)
  - Display analytics by default
  - Switch between views
- [ ] Update `components/FileList.tsx` to link to details
- [ ] Update `page.tsx` to show file detail modal

**Files**:
- `app/tools/file-hosting/components/FileList.tsx` (update)
- `app/tools/file-hosting/components/FileDetails.tsx` (new if needed)

**Validation**: Click file → see analytics, can switch tabs

---

## Phase 5: Polish & Production (Hours 19-24)

### 5a: Database Optimization (1 hour)

- [ ] Add performance indexes:
  - access_logs (file_id, timestamp)
  - whois_cache (expires_at)
  - files (deleted, upload_time)
- [ ] Test with 100+ access records
- [ ] Verify query performance
- [ ] Implement result caching if needed

**Validation**: Queries complete in < 200ms

---

### 5b: Error Handling & Validation (1 hour)

- [ ] File size limits (enforce in frontend + backend)
- [ ] MIME type validation
- [ ] Handle large file uploads gracefully
- [ ] Compression failure recovery
- [ ] Rate limiting for uploads (if needed)
- [ ] User-friendly error messages
- [ ] Proper HTTP status codes

**Validation**: Upload 1GB file → get error, upload invalid type → get error, nice messages

---

### 5c: UI/UX Polish (1 hour)

- [ ] Loading states (spinners)
- [ ] Progress bars for uploads
- [ ] Error notifications (toast/alert)
- [ ] Success feedback
- [ ] Empty states (no files yet)
- [ ] Responsive design check
- [ ] Mobile experience
- [ ] Animations/transitions

**Files**: Component `.module.css` files

**Validation**: Looks good on desktop and mobile

---

### 5d: Testing & Validation (1 hour)

- [ ] **End-to-end test**:
  - [ ] Upload file from desktop
  - [ ] Watch it compress (see status change)
  - [ ] Get public URL
  - [ ] Download from different IP (VPN if possible)
  - [ ] View access log with WHOIS data
  - [ ] View analytics dashboard
  - [ ] Verify all data is correct

- [ ] **Code quality**:
  - [ ] `pnpm lint` passes
  - [ ] TypeScript compiles
  - [ ] No `any` types
  - [ ] All files documented

- [ ] **Performance**:
  - [ ] Page loads fast
  - [ ] Analytics queries < 200ms
  - [ ] No console errors

- [ ] **Edge cases**:
  - [ ] Upload 0 byte file
  - [ ] Upload huge file
  - [ ] Multiple uploads simultaneously
  - [ ] Compression failure recovery

**Validation**: Everything works end-to-end, production-ready

---

## Quick Command Reference

```bash
# Setup
pnpm wrangler r2 bucket create file-hosting-prod
pnpm wrangler d1 create file-hosting
pnpm wrangler queues create file-compression

# Development
pnpm dev
pnpm lint
pnpm tsc --noEmit

# Testing
pnpm preview
curl -X POST http://localhost:3000/api/tools/file-hosting/upload -F "file=@test.txt"

# Commit after each phase
git add -A
git commit -m "feat: complete phase X - [description]"
```

---

## Deployment Checklist

- [ ] All TypeScript types correct
- [ ] Linting passes
- [ ] No console errors in dev
- [ ] Database schema created
- [ ] R2 bucket configured
- [ ] Queues configured
- [ ] Environment secrets set
- [ ] wrangler.toml updated
- [ ] Tested in preview build
- [ ] Ready to deploy

---

## Notes

- **AI Sprint Mode**: We're moving FAST. Each sub-phase should take the estimated time.
- **Parallel Work**: Can work on components while routes are being built.
- **Testing As We Go**: Test after each sub-phase, not just at the end.
- **Keep It Simple**: Phase 1 is minimal viable. Phases 2-4 add features incrementally.

---

**Let's build this! 🚀**

**Current Time**: [Start Time]
**Target Completion**: +24 hours


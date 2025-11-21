# File Hosting Utility - Planning & Documentation

**Display Name Options**: "File Arsenal" or "The Cloud Hoarding Simulator" or "Obfuscated Delivery Protocol (The UN Hates This)"

## Purpose

A personal file hosting and sharing utility with automatic compression, detailed access analytics, and WHOIS tracking. This allows you to:

-   Upload files to Cloudflare R2 storage
-   Automatically compress files in the background via Queues
-   Track every access with IP, timestamp, user agent, and WHOIS data
-   Share files via public links with full audit trail
-   View comprehensive analytics per file (access patterns, geographic distribution, WHOIS info)
-   Automatically delete old files and replace with compressed versions

Perfect for hosting files on your own infrastructure, stalking your users via WHOIS data, proving that file hosting doesn't have to be bloated, or just compressing memes at the edge of Cloudflare's network.

## Planning

### Features

#### Phase 1: Core Upload & Storage

-   **File Upload**:

    -   Drag-and-drop file upload
    -   File validation (size limits, allowed types)
    -   Progress tracking
    -   Success/error feedback
    -   Multiple file upload support

-   **R2 Storage Integration**:

    -   Upload files to Cloudflare R2
    -   Generate public URLs with CDN caching
    -   Store file metadata (name, size, mime type, upload time)
    -   Direct file listing from R2

-   **Database Setup**:
    -   Store file metadata
    -   Track access logs (IP, timestamp, user agent)
    -   Store WHOIS information per IP
    -   Index for fast queries

#### Phase 2: Compression & Processing

-   **Background Compression via Queues**:

    -   Upload triggers Queue message
    -   Worker processes compression asynchronously
    -   Supports: gzip (JSON/text), webp/avif (images), video codec optimization
    -   Replaces original with compressed version
    -   Updates database with compression metadata
    -   Handles compression failures gracefully

-   **File Management**:
    -   Delete original after successful compression
    -   Track compression ratio and savings
    -   Retry logic for failed compressions
    -   Compression status in UI

#### Phase 3: Access Analytics & Tracking

-   **Access Logging**:

    -   Log every file download/view
    -   Capture: IP address, timestamp, user agent, referrer, country (via WHOIS)
    -   Aggregate access metrics (total downloads, unique IPs, geographic spread)
    -   Track access timeline (hits per hour/day)

-   **WHOIS Integration**:

    -   Lookup IP WHOIS data on first access
    -   Cache WHOIS results to avoid rate limits
    -   Display: organization, country, ASN, ISP
    -   Show geographic visualization of access

-   **File Analytics Dashboard**:
    -   Total downloads and unique visitors
    -   Access timeline (last 7 days, 30 days)
    -   Geographic distribution (countries, organizations)
    -   Top accessing IPs with WHOIS info
    -   User agents and platforms
    -   Referrer tracking

#### Phase 4: Enhanced Features (Future)

-   Expiring links (auto-delete after X accesses)
-   Password-protected files
-   Custom analytics retention policies
-   Download speed optimization
-   Duplicate file detection
-   File versioning
-   Scheduled file deletion
-   Download resume support

### Design Decisions

#### 1. Storage Layer

**Decision**: Cloudflare R2 for file storage, external database for metadata

-   **Rationale**:
    -   R2 is cost-effective and Workers-native
    -   Database needed for complex queries (access patterns, WHOIS lookups)
    -   Separation of concerns: files vs metadata
-   **Implementation**:
    -   R2 stores actual files (public URLs via CDN)
    -   Database (SQLite/PostgreSQL) stores all metadata, access logs, WHOIS cache
    -   API routes handle R2 operations

#### 2. Background Processing

**Decision**: Cloudflare Queues for async compression

-   **Rationale**:
    -   Workers-native, no external containers needed
    -   Automatic retry and error handling
    -   Scales with demand
    -   Handles long-running compression tasks
-   **Implementation**:
    -   Route handler: create Queue message on upload
    -   Worker: process Queue messages, compress files
    -   Update metadata in database when done
    -   Replace old R2 file with compressed version
    -   Delete old URL, update public link

#### 3. Database Choice

**Decision**: Cloudflare D1 (SQLite) or external PostgreSQL

-   **Rationale** (D1):
    -   Workers-native, no extra API calls for metadata
    -   SQLite is simple, sufficient for analytics
    -   Easier deployment and configuration
-   **Rationale** (PostgreSQL):

    -   More powerful queries for analytics
    -   Better for large access log volumes
    -   Can use: Supabase, Neon, Railway
    -   More complex but more flexible

-   **Initial recommendation**: Start with Cloudflare D1 for simplicity, migrate to PostgreSQL if needed

#### 4. IP Tracking & WHOIS

**Decision**: Full IP logging with WHOIS caching, no privacy filtering

-   **Rationale**:
    -   Personal tool, full transparency needed
    -   WHOIS cache prevents rate limiting
    -   Aggressive WHOIS lookups to fill analytics
-   **Implementation**:
    -   Access log: captures full IP address
    -   WHOIS lookup on first IP access
    -   Cache WHOIS data for 30 days
    -   Display organization, country, ASN in UI

#### 5. File Compression Strategy

**Decision**: Multi-codec compression with type-based detection

-   **Rationale**:
    -   Different file types compress differently
    -   Preserve quality while reducing size
    -   Show compression ratio to user
-   **Implementation**:
    -   JSON/Text: gzip compression
    -   Images: convert to WebP/AVIF (preserve originals)
    -   Videos: optional codec optimization
    -   Archives: already compressed, skip
    -   Track compression ratio and savings

#### 6. API Route Structure

**Decision**: RESTful routes under `/api/tools/file-hosting/`

-   **Structure**:

    -   `POST /api/tools/file-hosting/upload` - Upload file
    -   `GET /api/tools/file-hosting/files` - List uploaded files
    -   `GET /api/tools/file-hosting/files/[id]` - Get file metadata + analytics
    -   `DELETE /api/tools/file-hosting/files/[id]` - Delete file
    -   `GET /api/tools/file-hosting/download/[fileId]` - Download file (tracked)
    -   `GET /api/tools/file-hosting/whois/[ip]` - Get cached WHOIS info

-   **Rationale**:
    -   Decoupled from utility
    -   Easy to find and maintain
    -   Follows Next.js patterns

#### 7. UI Architecture

**Decision**: Server Component for display, Client Component for interactivity

-   **Structure**:

    -   `page.tsx` - Server Component (initial render, fetch file list)
    -   `components/UploadZone.tsx` - Client Component (drag-drop, upload)
    -   `components/FileList.tsx` - Client Component (file management, real-time updates)
    -   `components/FileAnalytics.tsx` - Client Component (charts, access data)
    -   `components/AccessLog.tsx` - Client Component (detailed access table)

-   **Rationale**:
    -   Server Components for initial load performance
    -   Client Components for real-time updates and interactivity
    -   Follows Next.js best practices

### Edge Cases

1. **Large File Uploads**

    - Multipart upload for files > 100MB
    - Progress tracking and resume capability
    - Handle network failures gracefully

2. **Compression Failures**

    - Retry logic (exponential backoff)
    - Fall back to uncompressed if compression fails
    - Log errors for debugging

3. **WHOIS API Rate Limiting**

    - Cache WHOIS results aggressively
    - Batch lookups if possible
    - Fall back to basic IP parsing if rate limited
    - Queue concurrent lookups

4. **File Deletion**

    - Delete from R2
    - Clean up access logs in database
    - Delete WHOIS cache for that IP
    - Handle in-flight Queue messages

5. **Concurrent Uploads**

    - Handle race conditions on metadata writes
    - Idempotent operations where possible
    - Database locking/transactions if needed

6. **Storage Limits**
    - Enforce user quotas if needed
    - Warn on approaching limits
    - Archive old files option

### User Experience

-   **Upload Flow**:

    1. User drags file into upload zone
    2. File validates (size, type)
    3. Upload starts with progress bar
    4. File appears in list immediately (pending compression)
    5. Compression notification starts
    6. Compression completes, URL updates
    7. Public link ready to share
    8. "Link copied" feedback

-   **File Management**:

    1. Dashboard shows all files with thumbnails/previews
    2. Click file to see detailed analytics
    3. Quick actions: copy link, preview, delete
    4. Search/filter by name, date, size

-   **Analytics View**:
    1. See total downloads, unique visitors, top countries
    2. Access timeline chart (last 7/30 days)
    3. Geographic heatmap or country list
    4. Detailed IP log with WHOIS info
    5. User agent breakdown (browsers, bots)
    6. Compression savings displayed

## Documentation Links

### External Resources

-   [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/) - Object storage API
-   [Cloudflare Queues Documentation](https://developers.cloudflare.com/queues/) - Async message queue
-   [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/) - SQLite database
-   [IP-API WHOIS Service](https://ip-api.com/) - IP geolocation and WHOIS
-   [ipinfo.io](https://ipinfo.io/) - Alternative WHOIS provider
-   [WebP Image Compression](https://developers.google.com/speed/webp/) - WebP format
-   [Sharp.js](https://sharp.pixelplumbing.com/) - Image processing (if available)

### APIs/Libraries Used

-   **Cloudflare R2**

    -   Purpose: File storage and CDN delivery
    -   API: S3-compatible REST API
    -   Binding: `R2_BUCKET` (configured in wrangler.toml)

-   **Cloudflare Queues**

    -   Purpose: Async compression jobs
    -   API: Native Cloudflare Queue API
    -   Binding: `FILE_COMPRESSION_QUEUE`

-   **Cloudflare D1**

    -   Purpose: Metadata, access logs, WHOIS cache
    -   API: SQLite SQL queries
    -   Binding: `FILE_HOSTING_DB`

-   **IP-API or ipinfo.io**
    -   Purpose: WHOIS lookups for IP addresses
    -   API: REST HTTP API
    -   Rate limits: 45 requests/minute (IP-API), 50,000/month (ipinfo free)

### Related Documentation

-   [Project Architecture](../../../docs/ARCHITECTURE.md) - System architecture
-   [Development Guide](../../../docs/DEVELOPMENT.md) - Development guidelines
-   [Utilities Architecture](../../../docs/UTILITIES.md) - Utility patterns
-   [Component Patterns](../../../docs/COMPONENTS.md) - Component guidelines

## Implementation Notes

### Technical Details

#### 1. Cloudflare Service Setup

**R2 Bucket**:

```bash
# Create R2 bucket
pnpm wrangler r2 bucket create file-hosting-prod
pnpm wrangler r2 bucket create file-hosting-preview

# Add to wrangler.toml:
# [[r2_buckets]]
# binding = "R2_BUCKET"
# bucket_name = "file-hosting-prod"
```

**Cloudflare Queues**:

```bash
# Create queue
pnpm wrangler queues create file-compression

# Add to wrangler.toml:
# [[queues.producers]]
# binding = "FILE_COMPRESSION_QUEUE"
# queue = "file-compression"
```

**Cloudflare D1**:

```bash
# Create database
pnpm wrangler d1 create file-hosting

# Add to wrangler.toml:
# [[d1_databases]]
# binding = "FILE_HOSTING_DB"
# database_name = "file-hosting"
# database_id = "..."
```

#### 2. Environment Variables

Required secrets (use Wrangler secrets):

-   `WHOIS_API_KEY` - API key for IP WHOIS lookups (IP-API or ipinfo.io)
-   `R2_ACCOUNT_ID` - Cloudflare account ID
-   `R2_ACCESS_KEY_ID` - R2 access key
-   `R2_SECRET_ACCESS_KEY` - R2 secret key

#### 3. Database Schema

**files table**:

```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  original_size INTEGER NOT NULL,
  compressed_size INTEGER,
  mime_type TEXT,
  upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  compression_status TEXT, -- 'pending', 'processing', 'done', 'failed'
  original_url TEXT,
  compressed_url TEXT,
  compression_ratio REAL,
  access_count INTEGER DEFAULT 0,
  last_accessed DATETIME,
  deleted BOOLEAN DEFAULT 0
);

CREATE TABLE access_logs (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES files(id),
  ip_address TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  organization TEXT,
  asn TEXT,
  FOREIGN KEY(file_id) REFERENCES files(id)
);

CREATE TABLE whois_cache (
  ip_address TEXT PRIMARY KEY,
  country TEXT,
  organization TEXT,
  asn TEXT,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);
```

#### 4. Queue Message Format

```typescript
interface CompressionJob {
    fileId: string;
    fileName: string;
    mimeType: string;
    r2Key: string;
    originalSize: number;
}
```

#### 5. API Route Implementation

**Upload Route** (`/api/tools/file-hosting/upload/route.ts`):

```typescript
export async function POST(request: Request) {
    // 1. Parse multipart file upload
    // 2. Validate file (size, type)
    // 3. Generate unique file ID
    // 4. Upload to R2
    // 5. Store metadata in database
    // 6. Add message to compression queue
    // 7. Return file URL and metadata
}
```

**Download Route** (`/api/tools/file-hosting/download/[fileId]/route.ts`):

```typescript
export async function GET(request: Request) {
    // 1. Get file metadata from database
    // 2. Log access (IP, user agent, timestamp)
    // 3. Lookup WHOIS if new IP
    // 4. Redirect to R2 URL (or stream)
    // 5. Update access count
}
```

**Queue Consumer** (Worker Handler):

```typescript
export async function queued(batch: MessageBatch<CompressionJob>) {
    for (const message of batch.messages) {
        try {
            // 1. Download from R2
            // 2. Compress based on mime type
            // 3. Upload compressed to R2
            // 4. Update database with new URL
            // 5. Delete original from R2
            // 6. Update compression_status to 'done'
        } catch (error) {
            // Log error, retry logic
        }
    }
}
```

### Gotchas

1. **R2 API Rate Limits**

    - Generally not an issue, but batching helps
    - Large file uploads may timeout (use multipart)

2. **Queue Processing Delays**

    - Queues process asynchronously (usually < 30s)
    - Don't promise instant compression to user
    - Show "processing" state in UI

3. **WHOIS API Rate Limits**

    - IP-API: 45 requests/minute (free tier)
    - ipinfo: 50k/month (free tier)
    - Implement aggressive caching (30-day TTL)
    - Consider upgrading to paid tier for high volume

4. **File Deletion Race Conditions**

    - Queue job may still be processing when user deletes
    - Add "deleted" flag to files table
    - Queue consumer checks flag before uploading

5. **Database Storage Growth**

    - Access logs grow quickly (1 access = ~300 bytes)
    - Consider archiving old logs (>90 days)
    - Index on file_id and timestamp for performance

6. **User Agent Parsing**
    - User Agent strings can be massive
    - Truncate to reasonable length for storage
    - Use library for parsing (if needed)

### Cloudflare Workers Compatibility

#### ✅ Compatible

-   **R2 API**: Fetch-based, fully supported
-   **Queues**: Native Cloudflare service, fully supported
-   **D1**: Native Cloudflare service, fully supported
-   **Route Handlers**: Work perfectly in Workers

#### ⚠️ Considerations

-   **File Processing**: Large files may hit 50ms CPU time limit
    -   Solution: Process in Queue workers (higher CPU limits)
-   **WHOIS Lookups**: HTTP requests to external API
    -   May need timeout handling
    -   Cache aggressively to reduce API calls
-   **Multipart Upload**: Need streaming support
    -   Next.js handles this, should work fine

### Type Safety

#### Core Interfaces

```typescript
interface FileMetadata {
    id: string;
    name: string;
    originalSize: number;
    compressedSize?: number;
    mimeType: string;
    uploadTime: Date;
    compressionStatus: "pending" | "processing" | "done" | "failed";
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

## Testing Considerations

-   **Unit Tests**:

    -   File validation logic
    -   WHOIS cache expiration
    -   Compression ratio calculation

-   **Integration Tests**:

    -   Upload to R2
    -   Queue message creation
    -   Database queries
    -   WHOIS lookups

-   **Manual Testing**:
    -   Upload files of various types and sizes
    -   Verify compression works
    -   Check analytics accuracy
    -   Test with multiple concurrent uploads

## Implementation Phases (2-Day Intensive Sprint)

### Phase 1: Foundation & Storage

**Goals**: Get uploads and downloads working end-to-end

#### 1a: Database Schema & Setup

-   [ ] Create `schema.sql` with all tables (files, access_logs, whois_cache)
-   [ ] Set up Cloudflare D1 database
-   [ ] Run migrations
-   [ ] Verify tables exist with proper indexes

**Files to create**: `app/tools/file-hosting/schema.sql`

---

#### 1b: Type Definitions & Utilities

-   [ ] Create `lib/types.ts` with all TypeScript interfaces
-   [ ] Create `lib/database.ts` with D1 query helpers
-   [ ] Create `lib/r2.ts` with R2 upload/download helpers
-   [ ] Create `lib/validation.ts` for file validation

**Files to create**:

-   `app/tools/file-hosting/lib/types.ts`
-   `app/tools/file-hosting/lib/database.ts`
-   `app/tools/file-hosting/lib/r2.ts`
-   `app/tools/file-hosting/lib/validation.ts`

---

#### 1c: Upload API Route

-   [ ] Create `api/tools/file-hosting/upload/route.ts`
-   [ ] Implement multipart file parsing
-   [ ] Validate files (size, type)
-   [ ] Upload to R2
-   [ ] Store metadata in database
-   [ ] Return file ID and URL

**Files to create**: `app/api/tools/file-hosting/upload/route.ts`

---

#### 1d: Download Tracking & UI Scaffold

-   [ ] Create `api/tools/file-hosting/download/[fileId]/route.ts`
-   [ ] Log access (IP, timestamp, user agent)
-   [ ] Create `components/UploadZone.tsx` (placeholder)
-   [ ] Create `components/FileList.tsx` (placeholder)
-   [ ] Update `page.tsx` to use real components

**Files to create**:

-   `app/api/tools/file-hosting/download/[fileId]/route.ts`
-   `app/tools/file-hosting/components/UploadZone.tsx`
-   `app/tools/file-hosting/components/FileList.tsx`

**Phase 1 Deliverable**: ✅ Upload a file → see it in list → download it with access logged

---

### Phase 2: Compression Pipeline

**Goals**: Automatic background compression with Queue processing

#### 2a: Queues & Consumer Setup

-   [ ] Set up Cloudflare Queues (`file-compression`)
-   [ ] Create Queue consumer route handler
-   [ ] Implement basic error handling and retry logic
-   [ ] Test Queue message flow

**Files to create**: `app/api/tools/file-hosting/queues/compression.ts` (consumer handler)

---

#### 2b: Compression Logic

-   [ ] Create `lib/compression.ts` with codec logic
-   [ ] Implement gzip for JSON/text
-   [ ] Implement WebP conversion for images
-   [ ] Handle video optimization (optional)
-   [ ] Track compression ratio and savings
-   [ ] Handle compression failures gracefully

**Files to create**: `app/tools/file-hosting/lib/compression.ts`

---

#### 2c: Queue Integration & UI Updates

-   [ ] Update upload route to queue compression jobs
-   [ ] Update database with compression_status field
-   [ ] Update FileList to show compression status
-   [ ] Implement file replacement (delete old, update URL)
-   [ ] Add compression progress indicator in UI

**Files to update**:

-   `app/api/tools/file-hosting/upload/route.ts`
-   `app/tools/file-hosting/components/FileList.tsx`

**Phase 2 Deliverable**: ✅ Upload file → auto-compresses → URL updates → see compression ratio

---

### Phase 3: IP Tracking & WHOIS

**Goals**: Full access analytics with geographic data

#### 3a: WHOIS Integration & Caching

-   [ ] Create `lib/whois.ts` for WHOIS lookups
-   [ ] Implement IP-API integration
-   [ ] Add aggressive caching (30-day TTL)
-   [ ] Handle rate limiting
-   [ ] Update download route to lookup WHOIS on first access

**Files to create**: `app/tools/file-hosting/lib/whois.ts`

---

#### 3b: Access Log Enrichment

-   [ ] Update download route to capture full access data
-   [ ] Store IP, user agent, referrer, country, org, ASN
-   [ ] Create `api/tools/file-hosting/access-logs/[fileId]/route.ts`
-   [ ] Implement pagination for access logs

**Files to create**: `app/api/tools/file-hosting/access-logs/[fileId]/route.ts`

---

#### 3c: Access Log UI

-   [ ] Create `components/AccessLog.tsx` (Client Component)
-   [ ] Display all accesses in sortable table
-   [ ] Show IP, country, org, user agent, timestamp
-   [ ] Add filtering/search by IP or country
-   [ ] Add copy IP button, WHOIS details

**Files to create**: `app/tools/file-hosting/components/AccessLog.tsx`

**Phase 3 Deliverable**: ✅ Download files from different IPs → see who accessed, where they're from, what org

---

### Phase 4: Analytics Dashboard

**Goals**: Rich analytics with charts and geographic insights

#### 4a: Analytics Aggregation

-   [ ] Create `api/tools/file-hosting/analytics/[fileId]/route.ts`
-   [ ] Implement aggregation queries:
    -   Total downloads / unique IPs
    -   Downloads by country
    -   Top accessing organizations
    -   User agent breakdown
    -   Access timeline (hourly/daily)

**Files to create**: `app/api/tools/file-hosting/analytics/[fileId]/route.ts`

---

#### 4b: Charts & Visualization

-   [ ] Create `components/FileAnalytics.tsx` (Client Component)
-   [ ] Add recharts for visualization
-   [ ] Timeline chart (downloads over time)
-   [ ] Geographic distribution (countries/orgs)
-   [ ] User agent breakdown (pie chart)
-   [ ] Top IPs with WHOIS details

**Files to create**: `app/tools/file-hosting/components/FileAnalytics.tsx`

---

#### 4c: Analytics Filtering & Integration

-   [ ] Add date range filtering
-   [ ] Update FileList to show quick stats (downloads, last access)
-   [ ] Create file detail view with analytics modal
-   [ ] Implement tab navigation (List → Analytics → Access Log)

**Files to update**:

-   `app/tools/file-hosting/components/FileList.tsx`
-   `app/page.tsx` (file detail routing)

**Phase 4 Deliverable**: ✅ Click file → see total downloads, geographic distribution, user breakdown, timeline

---

### Phase 5: Polish & Production Ready

**Goals**: Performance, edge cases, production deployment

#### 5a: Database Optimization

-   [ ] Add all necessary indexes
-   [ ] Implement query caching for analytics
-   [ ] Test with large datasets (100+ accesses)
-   [ ] Verify pagination performance

**Files to update**: `app/tools/file-hosting/schema.sql`

---

#### 5b: Error Handling & Validation

-   [ ] Handle large file uploads (multipart, streaming)
-   [ ] Implement file size limits
-   [ ] Add MIME type validation
-   [ ] Handle compression failures
-   [ ] Rate limiting for uploads
-   [ ] Error messages in UI

**Files to update**: Multiple route handlers and components

---

#### 5c: UI/UX Polish

-   [ ] Loading states for uploads
-   [ ] Progress bars for file uploads
-   [ ] Error notifications
-   [ ] Success feedback
-   [ ] Responsive design verification
-   [ ] Animations and transitions

**Files to create/update**:

-   `app/tools/file-hosting/page.module.css` (enhancements)
-   Component `.module.css` files

---

#### 5d: Testing & Deployment

-   [ ] Manual end-to-end test:
    -   Upload file → compress → verify URL → download from different IP → check analytics
-   [ ] Verify linting passes
-   [ ] TypeScript compilation
-   [ ] Test preview build
-   [ ] Ready for production deployment

**Phase 5 Deliverable**: ✅ Fully functional, production-ready File Arsenal

---

## Phase Order

```
Phase 1: Foundation & Storage
Phase 2: Compression Pipeline
Phase 3: IP Tracking & WHOIS
Phase 4: Analytics Dashboard
Phase 5: Polish & Production
```

---

### Advanced Features (Post-Sprint, if time permits)

-   Expiring links (auto-delete after X accesses)
-   Password-protected files
-   Custom analytics retention policies
-   Download resume support
-   Duplicate file detection
-   File versioning
-   Scheduled file deletion

## Changelog

### 2025-01-27 - Initial Planning

-   Created comprehensive utility plan
-   Defined architecture using R2, Queues, and D1
-   Outlined 5-phase implementation roadmap
-   Documented design decisions and edge cases

---

**Last Updated**: 2025-01-27

**Status**: Ready for Phase 1 Implementation

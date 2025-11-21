# File Hosting Utility - Planning & Documentation

**Display Name Options**: "File Arsenal" or "The Cloud Hoarding Simulator" or "Obfuscated Delivery Protocol (The UN Hates This)"

## Purpose

A personal file hosting and sharing utility with automatic compression, detailed access analytics, and WHOIS tracking. This allows you to:

- Upload files to Cloudflare R2 storage
- Automatically compress files in the background via Queues
- Track every access with IP, timestamp, user agent, and WHOIS data
- Share files via public links with full audit trail
- View comprehensive analytics per file (access patterns, geographic distribution, WHOIS info)
- Automatically delete old files and replace with compressed versions

Perfect for hosting files on your own infrastructure, stalking your users via WHOIS data, proving that file hosting doesn't have to be bloated, or just compressing memes at the edge of Cloudflare's network.

## Planning

### Features

#### Phase 1: Core Upload & Storage

- **File Upload**:
  - Drag-and-drop file upload
  - File validation (size limits, allowed types)
  - Progress tracking
  - Success/error feedback
  - Multiple file upload support

- **R2 Storage Integration**:
  - Upload files to Cloudflare R2
  - Generate public URLs with CDN caching
  - Store file metadata (name, size, mime type, upload time)
  - Direct file listing from R2

- **Database Setup**:
  - Store file metadata
  - Track access logs (IP, timestamp, user agent)
  - Store WHOIS information per IP
  - Index for fast queries

#### Phase 2: Compression & Processing

- **Background Compression via Queues**:
  - Upload triggers Queue message
  - Worker processes compression asynchronously
  - Supports: gzip (JSON/text), webp/avif (images), video codec optimization
  - Replaces original with compressed version
  - Updates database with compression metadata
  - Handles compression failures gracefully

- **File Management**:
  - Delete original after successful compression
  - Track compression ratio and savings
  - Retry logic for failed compressions
  - Compression status in UI

#### Phase 3: Access Analytics & Tracking

- **Access Logging**:
  - Log every file download/view
  - Capture: IP address, timestamp, user agent, referrer, country (via WHOIS)
  - Aggregate access metrics (total downloads, unique IPs, geographic spread)
  - Track access timeline (hits per hour/day)

- **WHOIS Integration**:
  - Lookup IP WHOIS data on first access
  - Cache WHOIS results to avoid rate limits
  - Display: organization, country, ASN, ISP
  - Show geographic visualization of access

- **File Analytics Dashboard**:
  - Total downloads and unique visitors
  - Access timeline (last 7 days, 30 days)
  - Geographic distribution (countries, organizations)
  - Top accessing IPs with WHOIS info
  - User agents and platforms
  - Referrer tracking

#### Phase 4: Enhanced Features (Future)

- Expiring links (auto-delete after X accesses)
- Password-protected files
- Custom analytics retention policies
- Download speed optimization
- Duplicate file detection
- File versioning
- Scheduled file deletion
- Download resume support

### Design Decisions

#### 1. Storage Layer

**Decision**: Cloudflare R2 for file storage, external database for metadata

- **Rationale**:
  - R2 is cost-effective and Workers-native
  - Database needed for complex queries (access patterns, WHOIS lookups)
  - Separation of concerns: files vs metadata
- **Implementation**:
  - R2 stores actual files (public URLs via CDN)
  - Database (SQLite/PostgreSQL) stores all metadata, access logs, WHOIS cache
  - API routes handle R2 operations

#### 2. Background Processing

**Decision**: Cloudflare Queues for async compression

- **Rationale**:
  - Workers-native, no external containers needed
  - Automatic retry and error handling
  - Scales with demand
  - Handles long-running compression tasks
- **Implementation**:
  - Route handler: create Queue message on upload
  - Worker: process Queue messages, compress files
  - Update metadata in database when done
  - Replace old R2 file with compressed version
  - Delete old URL, update public link

#### 3. Database Choice

**Decision**: Cloudflare D1 (SQLite) or external PostgreSQL

- **Rationale** (D1):
  - Workers-native, no extra API calls for metadata
  - SQLite is simple, sufficient for analytics
  - Easier deployment and configuration
  
- **Rationale** (PostgreSQL):
  - More powerful queries for analytics
  - Better for large access log volumes
  - Can use: Supabase, Neon, Railway
  - More complex but more flexible

- **Initial recommendation**: Start with Cloudflare D1 for simplicity, migrate to PostgreSQL if needed

#### 4. IP Tracking & WHOIS

**Decision**: Full IP logging with WHOIS caching, no privacy filtering

- **Rationale**:
  - Personal tool, full transparency needed
  - WHOIS cache prevents rate limiting
  - Aggressive WHOIS lookups to fill analytics
- **Implementation**:
  - Access log: captures full IP address
  - WHOIS lookup on first IP access
  - Cache WHOIS data for 30 days
  - Display organization, country, ASN in UI

#### 5. File Compression Strategy

**Decision**: Multi-codec compression with type-based detection

- **Rationale**:
  - Different file types compress differently
  - Preserve quality while reducing size
  - Show compression ratio to user
- **Implementation**:
  - JSON/Text: gzip compression
  - Images: convert to WebP/AVIF (preserve originals)
  - Videos: optional codec optimization
  - Archives: already compressed, skip
  - Track compression ratio and savings

#### 6. API Route Structure

**Decision**: RESTful routes under `/api/tools/file-hosting/`

- **Structure**:
  - `POST /api/tools/file-hosting/upload` - Upload file
  - `GET /api/tools/file-hosting/files` - List uploaded files
  - `GET /api/tools/file-hosting/files/[id]` - Get file metadata + analytics
  - `DELETE /api/tools/file-hosting/files/[id]` - Delete file
  - `GET /api/tools/file-hosting/download/[fileId]` - Download file (tracked)
  - `GET /api/tools/file-hosting/whois/[ip]` - Get cached WHOIS info

- **Rationale**:
  - Decoupled from utility
  - Easy to find and maintain
  - Follows Next.js patterns

#### 7. UI Architecture

**Decision**: Server Component for display, Client Component for interactivity

- **Structure**:
  - `page.tsx` - Server Component (initial render, fetch file list)
  - `components/UploadZone.tsx` - Client Component (drag-drop, upload)
  - `components/FileList.tsx` - Client Component (file management, real-time updates)
  - `components/FileAnalytics.tsx` - Client Component (charts, access data)
  - `components/AccessLog.tsx` - Client Component (detailed access table)

- **Rationale**:
  - Server Components for initial load performance
  - Client Components for real-time updates and interactivity
  - Follows Next.js best practices

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

- **Upload Flow**:
  1. User drags file into upload zone
  2. File validates (size, type)
  3. Upload starts with progress bar
  4. File appears in list immediately (pending compression)
  5. Compression notification starts
  6. Compression completes, URL updates
  7. Public link ready to share
  8. "Link copied" feedback

- **File Management**:
  1. Dashboard shows all files with thumbnails/previews
  2. Click file to see detailed analytics
  3. Quick actions: copy link, preview, delete
  4. Search/filter by name, date, size

- **Analytics View**:
  1. See total downloads, unique visitors, top countries
  2. Access timeline chart (last 7/30 days)
  3. Geographic heatmap or country list
  4. Detailed IP log with WHOIS info
  5. User agent breakdown (browsers, bots)
  6. Compression savings displayed

## Documentation Links

### External Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/) - Object storage API
- [Cloudflare Queues Documentation](https://developers.cloudflare.com/queues/) - Async message queue
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/) - SQLite database
- [IP-API WHOIS Service](https://ip-api.com/) - IP geolocation and WHOIS
- [ipinfo.io](https://ipinfo.io/) - Alternative WHOIS provider
- [WebP Image Compression](https://developers.google.com/speed/webp/) - WebP format
- [Sharp.js](https://sharp.pixelplumbing.com/) - Image processing (if available)

### APIs/Libraries Used

- **Cloudflare R2**
  - Purpose: File storage and CDN delivery
  - API: S3-compatible REST API
  - Binding: `R2_BUCKET` (configured in wrangler.toml)

- **Cloudflare Queues**
  - Purpose: Async compression jobs
  - API: Native Cloudflare Queue API
  - Binding: `FILE_COMPRESSION_QUEUE`

- **Cloudflare D1**
  - Purpose: Metadata, access logs, WHOIS cache
  - API: SQLite SQL queries
  - Binding: `FILE_HOSTING_DB`

- **IP-API or ipinfo.io**
  - Purpose: WHOIS lookups for IP addresses
  - API: REST HTTP API
  - Rate limits: 45 requests/minute (IP-API), 50,000/month (ipinfo free)

### Related Documentation

- [Project Architecture](../../../docs/ARCHITECTURE.md) - System architecture
- [Development Guide](../../../docs/DEVELOPMENT.md) - Development guidelines
- [Utilities Architecture](../../../docs/UTILITIES.md) - Utility patterns
- [Component Patterns](../../../docs/COMPONENTS.md) - Component guidelines

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

- `WHOIS_API_KEY` - API key for IP WHOIS lookups (IP-API or ipinfo.io)
- `R2_ACCOUNT_ID` - Cloudflare account ID
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key

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

- **R2 API**: Fetch-based, fully supported
- **Queues**: Native Cloudflare service, fully supported
- **D1**: Native Cloudflare service, fully supported
- **Route Handlers**: Work perfectly in Workers

#### ⚠️ Considerations

- **File Processing**: Large files may hit 50ms CPU time limit
  - Solution: Process in Queue workers (higher CPU limits)
- **WHOIS Lookups**: HTTP requests to external API
  - May need timeout handling
  - Cache aggressively to reduce API calls
- **Multipart Upload**: Need streaming support
  - Next.js handles this, should work fine

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

## Testing Considerations

- **Unit Tests**:
  - File validation logic
  - WHOIS cache expiration
  - Compression ratio calculation

- **Integration Tests**:
  - Upload to R2
  - Queue message creation
  - Database queries
  - WHOIS lookups

- **Manual Testing**:
  - Upload files of various types and sizes
  - Verify compression works
  - Check analytics accuracy
  - Test with multiple concurrent uploads

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goals**: Core upload/storage and basic database setup

- [ ] Set up Cloudflare R2 bucket and D1 database
- [ ] Create database schema (files, access_logs, whois_cache tables)
- [ ] Implement upload API route (file validation, R2 upload, DB storage)
- [ ] Create basic file list UI
- [ ] Implement download tracking (log access, capture IP)
- [ ] Deploy and test basic upload/download flow

**Deliverables**:
- Working file upload to R2
- File listing in UI
- Basic access logging
- Public download links

**Tests**: Upload file, verify URL, download file, check log

---

### Phase 2: Compression Infrastructure (Week 2-3)

**Goals**: Set up Queue processing and compression pipeline

- [ ] Set up Cloudflare Queues (`file-compression` queue)
- [ ] Create Queue consumer worker for compression
- [ ] Implement compression logic (gzip for JSON/text, WebP for images)
- [ ] Add compression status tracking to database
- [ ] Implement file replacement (delete old, update URL)
- [ ] Update UI to show compression status
- [ ] Error handling and retry logic

**Deliverables**:
- Files automatically compressed in background
- Compression status visible in UI
- Compressed URL updates when done
- Fallback if compression fails

**Tests**: Upload file, verify Queue message, check compressed file exists, verify URL updates

---

### Phase 3: Access Analytics - WHOIS (Week 3-4)

**Goals**: Add IP tracking and WHOIS lookups

- [ ] Implement WHOIS lookup on access (IP-API or ipinfo)
- [ ] Add WHOIS caching to database (prevent rate limiting)
- [ ] Capture and store: IP, user agent, referrer, country, org
- [ ] Update access_logs table with full data
- [ ] Create `/api/tools/file-hosting/whois/[ip]` endpoint
- [ ] Display access log in UI (table of IPs with WHOIS data)

**Deliverables**:
- Full IP/WHOIS tracking on file access
- WHOIS cache working (rate limit safe)
- Access log table in UI
- WHOIS data displayed per IP

**Tests**: Download file multiple times, verify IPs logged, verify WHOIS cached

---

### Phase 4: Analytics Dashboard (Week 4-5)

**Goals**: Create detailed analytics UI

- [ ] Implement analytics aggregations (total downloads, unique IPs, countries)
- [ ] Create analytics component with:
  - Total downloads / unique visitors
  - Access timeline (chart)
  - Geographic distribution (top countries)
  - Top accessing IPs with WHOIS
  - User agent breakdown
- [ ] Add date range filtering
- [ ] Implement client-side charts (recharts or similar)
- [ ] Performance optimization for large logs

**Deliverables**:
- Rich analytics dashboard per file
- Visual charts and tables
- Geographic insights
- Access timeline

**Tests**: Generate test access logs, verify analytics calculations, test filters

---

### Phase 5: Polish & Optimization (Week 5-6)

**Goals**: Performance, UX refinement, deployment

- [ ] Optimize database queries (indexes, caching)
- [ ] Implement pagination for large logs
- [ ] Error handling and edge cases
- [ ] UI/UX refinement (animations, loading states)
- [ ] Documentation and code comments
- [ ] Performance testing (large files, concurrent uploads)
- [ ] Deployment verification

**Deliverables**:
- Production-ready utility
- Full feature set working smoothly
- Good performance at scale

**Tests**: Load testing, concurrent uploads, large file handling

---

### Phase 6+: Advanced Features (Future)

- Expiring links
- Password protection
- Scheduled deletion
- Custom retention policies
- Advanced compression strategies
- Download resume support
- Duplicate detection

## Changelog

### 2025-01-27 - Initial Planning

- Created comprehensive utility plan
- Defined architecture using R2, Queues, and D1
- Outlined 5-phase implementation roadmap
- Documented design decisions and edge cases

---

**Last Updated**: 2025-01-27

**Status**: Ready for Phase 1 Implementation


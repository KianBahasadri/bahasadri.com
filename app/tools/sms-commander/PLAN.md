# SMS Commander - Planning & Documentation

**Display Name Options**: "SMS Commander" or "Text the Feds" or "Message Interception Protocol (The UN Hates This)"

## Purpose

A utility for sending and receiving SMS messages via Twilio. This allows you to:

-   Send SMS messages to any phone number
-   Receive SMS messages via Twilio webhooks
-   View message history (sent and received)
-   Manage SMS communications from a single interface

Perfect for sending messages to your cousin on WhatsApp, intercepting texts from the Feds, or just proving to yourself that you can build things that work (unlike the vendor's code).

## Planning

### Features

#### Phase 1: Core Functionality

-   **Send SMS**: Form to send SMS messages

    -   Phone number input with validation
    -   Message textarea
    -   Send button with loading state
    -   Success/error feedback

-   **Receive SMS**: Webhook endpoint to receive incoming messages

    -   Twilio webhook validation
    -   Store received messages
    -   Display in real-time (or near real-time)

-   **Message History**: Display sent and received messages
    -   List view with timestamps
    -   Filter by sent/received
    -   Clear visual distinction between sent/received
-   **Threaded Chat UI**: Sidebar that lists counterparts (phone numbers or saved contacts) with last-message previews and timestamps so the interface feels like a proper messaging client.
-   **Contact Aliases**: Lightweight profile layer that lets you assign a name to each counterpart so the chat UI isn't just raw phone numbers.

#### Phase 2: Enhanced Features (Future)

-   Message search/filter
-   Export message history
-   Bulk messaging
-   Scheduled messages
-   Message templates
-   Phone number management

### Design Decisions

#### 1. Message Storage

**Decision**: Start with in-memory storage, add Cloudflare KV for persistence later

-   **Rationale**:
    -   Simpler initial implementation
    -   KV can be added without breaking changes
    -   For personal use, in-memory might be sufficient initially
-   **Future**: Migrate to Cloudflare KV for persistence across deployments
-   **Implementation (Current)**:
    -   Use Cloudflare KV (`SMS_MESSAGES` binding) with keys shaped as `messages:[inverted-timestamp]:[messageId]`
    -   Listing leverages KV's lexicographic order to return newest messages first (ref: [Cloudflare KV list API](https://developers.cloudflare.com/kv/api/list-keys/index.md))
    -   Local `next dev` without Wrangler falls back to a capped in-memory array, but production always hits KV

#### 2. Webhook Security

**Decision**: Validate Twilio webhook signatures

-   **Rationale**:
    -   Prevents unauthorized webhook calls
    -   Twilio provides signature validation
    -   Critical for security
-   **Automation**:
    -   `scripts/sync-twilio-webhook.ts` runs during deployment (`pnpm deploy`)
    -   Script verifies the Twilio number forwards to `/api/tools/sms-commander/webhook`
    -   If the configured `smsUrl` differs, it updates Twilio automatically before completing deployment

#### 3. API Route Structure

**Decision**: Use Next.js Route Handlers in utility-specific directory

-   **Structure**:
    -   `/api/tools/sms-commander/send` - POST endpoint for sending SMS
    -   `/api/tools/sms-commander/webhook` - POST endpoint for receiving SMS
-   **Rationale**:
    -   Keeps API routes decoupled with the utility
    -   Follows Next.js App Router patterns
    -   Easy to find and maintain

#### 4. UI Architecture

**Decision**: Client Component for interactivity, Server Component for initial render

-   **Structure**:
    -   `page.tsx` - Server Component (initial render)
    -   `components/SMSInterface.tsx` - Client Component (threads, chat layout, polling, forms)
    -   `components/MessageList.tsx` - Client Component (chat transcript display)
-   **Rationale**:
    -   Server Components for SEO and initial load
    -   Client Components only where interactivity is needed
    -   Follows Next.js best practices

#### 5. Twilio SDK vs Raw Fetch
-   **Thread Index + Contacts**: Introduced a KV-backed thread summary index (per counterpart) and a contacts store so the UI can list and label conversations without downloading the entire message history on every render.
#### 6. Contact Alias Storage

**Decision**: Store aliases in the same KV namespace using dedicated prefixes (`contacts:*` + `contacts-by-number:*` index) so each phone number can map to a single `Contact` record without adding another binding.

-   **Rationale**:
    -   Avoids introducing a second KV binding when the message namespace already exists
    -   Lets the chat UI enrich thread summaries with names server-side before hydrating on the client
    -   Strict E.164 validation keeps contact data aligned with Twilio payloads
-   **Implementation**:
    -   Contact CRUD helpers live in `lib/contactsStore.ts`
    -   `/api/tools/sms-commander/contacts` exposes list + create, `/contacts/[id]` handles PATCH updates
    -   Thread list route enriches summaries with contact metadata for the sidebar

**Decision**: Use the official Twilio SDK (compatibility verified with Cloudflare Workers)

-   **Rationale**:
    -   SDK provides type-safe helpers and better error metadata
    -   Verified via `wrangler dev` that it works in the Workers runtime
    -   Removes brittle, hand-rolled fetch + auth logic

### Edge Cases

1. **Invalid Phone Numbers**

    - Validate format before sending
    - Show clear error messages
    - Support international formats

2. **Message Length Limits**

    - SMS has 160 character limit (or 1600 for concatenated)
    - Warn user if message is too long
    - Auto-split long messages if needed

3. **Webhook Failures**

    - Handle webhook validation failures gracefully
    - Log errors for debugging
    - Return appropriate HTTP status codes

4. **Rate Limiting**

    - Twilio has rate limits
    - Handle rate limit errors gracefully
    - Show user-friendly error messages

5. **Network Failures**

    - Handle fetch failures
    - Retry logic for transient failures
    - Clear error messages to user

6. **Empty State**
    - Show helpful message when no messages exist
    - Guide user on how to send/receive

### User Experience

-   **Send Flow**:

    1. User enters phone number and message. Don't mess this up, dumbass.
    2. Clicks "Send to the Feds" or similar hostile button text
    3. Loading state shows. We pray it doesn't break.
    4. Success message appears. Or we scream at the linter.
    5. Message appears in history. If you didn't break it.

-   **Receive Flow**:

    1. Twilio sends webhook
    2. Webhook validated and processed
    3. Message stored
    4. UI updates (if using real-time, or on refresh)

-   **Message Display**:
    -   Clear visual distinction: sent (outgoing) vs received (incoming)
    -   Timestamps in readable format
    -   Phone numbers formatted nicely
    -   Message content clearly displayed

## Documentation Links

### External Resources

-   [Twilio SMS API Documentation](https://www.twilio.com/docs/sms) - Complete SMS API reference
-   [Twilio Webhook Security](https://www.twilio.com/docs/usage/webhooks/webhooks-security) - Webhook signature validation
-   [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node) - Official Node.js SDK
-   [Twilio Phone Number Formatting](https://www.twilio.com/docs/glossary/what-e164) - E.164 format standard

### APIs/Libraries Used

-   **Twilio SDK** (`twilio` package)

    -   Purpose: Send SMS messages, validate webhooks
    -   Documentation: https://www.twilio.com/docs/libraries/node
    -   Cloudflare Workers Compatibility: Need to verify, may need to use raw fetch API

-   **libphonenumber-js** (optional, for phone validation)
    -   Purpose: Validate and format phone numbers
    -   Documentation: https://github.com/catamphetamine/libphonenumber-js
    -   Alternative: Simple regex validation initially

### Related Documentation

-   [Project Architecture](../../../docs/ARCHITECTURE.md) - System architecture
-   [Development Guide](../../../docs/DEVELOPMENT.md) - Development guidelines
-   [Utilities Architecture](../../../docs/UTILITIES.md) - Utility patterns
-   [Component Patterns](../../../docs/COMPONENTS.md) - Component guidelines

## Implementation Notes

### Technical Details

#### 1. Twilio Setup

-   Create Twilio account
-   Get Account SID and Auth Token
-   Purchase phone number (or use trial number)
-   Configure webhook URL in Twilio console

#### 2. Environment Variables

Required secrets (use Wrangler secrets):

-   `TWILIO_ACCOUNT_SID` - Twilio account identifier
-   `TWILIO_AUTH_TOKEN` - Twilio authentication token
-   `TWILIO_PHONE_NUMBER` - Your Twilio phone number (E.164 format)
-   `TWILIO_WEBHOOK_URL` - Expected webhook URL for automated Twilio forwarding checks

#### 3. Deployment Workflow

-   Production releases run manually via `pnpm deploy` (no CI pipeline).
-   Always run `pnpm sync:twilio-webhook` immediately before `pnpm deploy` so the Twilio number auto-aligns before the Cloudflare upload.
-   Wrangler technically supports custom build hooks via `[build]` in `wrangler.toml`, but the Cloudflare docs ([link](https://developers.cloudflare.com/workers/wrangler/configuration/#build)) note that this hook replaces the worker build step. Because OpenNext already manages the build pipeline, using the hook would conflict with OpenNext’s build process—explicitly calling the sync script is safer.

#### 4. Cloudflare KV Setup

-   Create namespaces:
    -   `pnpm wrangler kv:namespace create SMS_MESSAGES`
    -   `pnpm wrangler kv:namespace create SMS_MESSAGES --preview`
-   Copy the generated `id` / `preview_id` values into `wrangler.toml` under the `[[kv_namespaces]]` block
-   Local preview (`pnpm preview`) automatically provisions an in-memory KV; `next dev` uses `initOpenNextCloudflareForDev` so bindings resolve through Wrangler

#### 3. API Route Implementation

**Send SMS Route** (`/api/tools/sms-commander/send/route.ts`):

```typescript
export async function POST(request: Request) {
    // 1. Validate request body (phone, message)
    // 2. Validate phone number format
    // 3. Call Twilio API to send SMS
    // 4. Store message in history (in-memory or KV)
    // 5. Return success/error response
}
```

**Webhook Route** (`/api/tools/sms-commander/webhook/route.ts`):

```typescript
export async function POST(request: Request) {
    // 1. Validate Twilio webhook signature
    // 2. Parse incoming message data
    // 3. Store message in history
    // 4. Return TwiML response (or 200 OK)
}
```

#### 4. Message Storage Structure

```typescript
interface Message {
    id: string;
    type: "sent" | "received";
    phoneNumber: string;
    message: string;
    timestamp: number;
    status?: "success" | "failed" | "pending";
    error?: string;
}
```

#### 5. Phone Number Validation

-   Use E.164 format: `+1234567890`
-   Validate before sending
-   Format display nicely: `(123) 456-7890` or `+1 234 567 8900`

### Gotchas

1. **Cloudflare Workers and Twilio SDK**

    - Twilio SDK may not work directly in Workers
    - May need to use raw `fetch` API to call Twilio REST API
    - Test compatibility early

2. **Webhook URL Configuration**

    - Need public URL for webhooks (localhost won't work)
    - Use ngrok or similar for local development
    - Update Twilio console with production URL

3. **Message History Persistence**

    - In-memory storage resets on deployment
    - Need KV for production persistence
    - Consider message retention policy

4. **CORS and Webhooks**

    - Twilio webhooks don't need CORS (server-to-server)
    - But need to handle CORS for client API calls if needed

5. **Rate Limiting**
    - Twilio has rate limits based on account type
    - Trial accounts have stricter limits
    - Handle gracefully with user feedback

### Cloudflare Workers Compatibility

#### Twilio SDK Compatibility

-   **Issue**: Twilio SDK may use Node.js-specific APIs
-   **Solution**:
    1. Test SDK first (with `nodejs_compat` flag)
    2. If not compatible, use raw `fetch` API
    3. Implement Twilio REST API calls manually

#### Webhook Handling

-   **Compatible**: Route handlers work perfectly in Workers
-   **Validation**: Can validate signatures in Workers
-   **Storage**: Use KV for message persistence

#### Fetch API Usage

```typescript
// Twilio REST API call using fetch
const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
        method: "POST",
        headers: {
            Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            To: phoneNumber,
            From: twilioNumber,
            Body: message,
        }),
    }
);
```

### Type Safety

#### Interfaces

```typescript
interface SendSMSRequest {
    phoneNumber: string;
    message: string;
}

interface SendSMSResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

interface TwilioWebhookPayload {
    MessageSid: string;
    AccountSid: string;
    From: string;
    To: string;
    Body: string;
    // ... other Twilio fields
}
```

## Testing Considerations

-   **Unit Tests**:

    -   Phone number validation
    -   Message formatting
    -   Webhook signature validation

-   **Integration Tests**:

    -   Send SMS flow
    -   Webhook reception
    -   Error handling

-   **Manual Testing**:
    -   Send SMS to real phone number
    -   Receive SMS via webhook
    -   Verify message history

## Future Enhancements

1. **Cloudflare KV Integration**

    - Persist message history
    - Survive deployments
    - Add message retention policy

2. **Real-time Updates**

    - Use Server-Sent Events or WebSockets
    - Show incoming messages immediately
    - No page refresh needed

3. **Message Templates**

    - Save common messages
    - Quick send with templates
    - Variable substitution

4. **Bulk Messaging**

    - Send to multiple recipients
    - CSV import
    - Progress tracking

5. **Scheduled Messages**

    - Schedule future sends
    - Use Cloudflare Cron Triggers
    - Queue management

6. **Message Search**

    - Search by content, phone number, date
    - Filter by type (sent/received)
    - Export results

7. **Phone Number Management**
    - Save favorite numbers
    - Contact list
    - Number formatting preferences

## Changelog

### 2025-01-27 - Initial Planning

-   Created utility plan
-   Defined architecture and features
-   Documented technical approach

---

**Last Updated**: 2025-01-27

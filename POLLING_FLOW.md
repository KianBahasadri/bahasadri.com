# SMS Commander Polling Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SMS Commander Interface (React Component)           │  │
│  │  - Renders messages and thread list                  │  │
│  │  - Polls every 2 seconds                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ▲ │
                          │ │ /api/tools/sms-commander/messages-since?since={ts}
                          │ ▼
                    ┌──────────────────┐
                    │ Cloudflare Edge  │
                    │   (Workers)      │
                    └──────────────────┘
                          ▲ │
                          │ │ GET request every 2 seconds
                          │ ▼
         ┌────────────────────────────────────┐
         │  Next.js API Route Handler         │
         │  messages-since/route.ts           │
         │                                    │
         │  1. Get 'since' timestamp          │
         │  2. Query Cloudflare KV            │
         │  3. Return new messages + threads  │
         │  4. Return current timestamp       │
         └────────────────────────────────────┘
                          ▲ │
                          │ │ KV queries
                          │ ▼
              ┌──────────────────────────┐
              │  Cloudflare KV Store     │
              │  (Persistent Storage)    │
              │                          │
              │  messages:*              │
              │  threads:*               │
              │  contacts:*              │
              └──────────────────────────┘
```

## Polling Flow Step-by-Step

### 1. Component Mounts
```typescript
// SMSInterface.tsx - Component lifecycle
useEffect(() => {
  const poll = async () => { /* see below */ };
  poll(); // Start polling immediately
  
  return () => {
    // Cleanup: clear polling timeout on unmount
  };
}, [refreshThreads]);
```

### 2. Initial Poll (Immediate)
```
Time: T=0ms
├─ Poll starts
├─ Fetch `/api/tools/sms-commander/messages-since?since=<current-time>`
├─ Response: { success: true, messages: [...], threads: [...], timestamp: <server-time> }
└─ Schedule next poll in 2 seconds
```

### 3. Regular Polling (Every 2 seconds)
```
Time: T=2000ms  │  T=4000ms  │  T=6000ms  │  ...
├─ Poll again   │  Poll      │  Poll      │
├─ Use last     │  Update    │  Update    │
│  timestamp    │  state     │  state     │
└─ Schedule     └─ Schedule  └─ Schedule
   next (2s)       next (2s)   next (2s)
```

### 4. Message Deduplication
```typescript
// When new messages arrive from polling
if (payload.messages && payload.messages.length > 0) {
  setMessageCache((current) => {
    const updated = { ...current };
    for (const newMessage of payload.messages!) {
      const counterpart = newMessage.counterpart;
      const existing = updated[counterpart] ?? [];
      
      // ✅ Check if message already exists by ID
      if (!existing.some((msg) => msg.id === newMessage.id)) {
        updated[counterpart] = [...existing, newMessage];
      } else {
        // ✅ Skip duplicate message
      }
    }
    return updated;
  });
}
```

### 5. Hard Cap Safety (1000 Attempts)
```typescript
const MAX_POLLING_ATTEMPTS = 1000;
const POLL_INTERVAL = 2000; // 2 seconds

// After 1000 attempts (~33 hours)
if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
  pollingStoppedRef.current = true;
  console.log('Polling stopped after 1000 attempts (~33 hours)');
  // ⚠️ No more requests sent until page refresh
}
```

## Polling Timestamps

### Timestamp Flow
```
1st Poll:
  └─ Request: ?since=1234567890000
  └─ Response includes: timestamp=1234567891234
  
2nd Poll (after 2 seconds):
  └─ Request: ?since=1234567891234  (use server's timestamp)
  └─ Response includes: timestamp=1234567893456
  
3rd Poll (after 2 more seconds):
  └─ Request: ?since=1234567893456  (use server's timestamp)
  └─ ...
```

### Why Server Timestamp?
- Ensures no message is ever missed
- Client clock skew doesn't matter
- Prevents duplicate polling on same messages
- Works correctly with edge workers globally

## Cost Analysis

### Polling Costs Per Day (Theoretical)
```
Interval: 2 seconds
Requests per minute: 30
Requests per hour: 1,800
Requests per day: 43,200

CPU per request: ~0.5ms (typical)
Total CPU per day: ~21,600ms = 21.6 seconds

Hard cap at 1000 attempts:
= ~33.3 hours of continuous polling
= Before stop (automatic safety)
```

### Cost Control Features
1. **Hard Cap**: Stops after 1000 attempts
2. **Fixed Interval**: No backoff complexity
3. **Message Deduplication**: Prevents state bloat
4. **Resumable**: Just refresh the page

## Error Handling

```typescript
const poll = async () => {
  try {
    const response = await fetch(...);
    if (!response.ok) throw new Error(...);
    
    const payload = await response.json();
    if (!payload.success) throw new Error(...);
    
    // Success: update state and reschedule
    schedulePoll();
  } catch (error) {
    // ✅ Error handling:
    console.error('[SMS] Poll error:', error);
    
    // ✅ Still increment attempt counter
    pollingAttemptsRef.current += 1;
    
    // ✅ Still reschedule (retry in 2 seconds)
    schedulePoll();
  }
};
```

## Advantages Over WebSocket

| Feature | WebSocket | Polling | Why Polling Wins |
|---------|-----------|---------|------------------|
| **Connection State** | Complex | None | Simpler code |
| **Timeout Management** | Heartbeat/pong | None | No complexity |
| **Multi-instance Scaling** | Hard | Easy | Works with multiple Workers |
| **Cost Control** | Difficult | Easy cap | 1000 attempt limit |
| **Debugging** | Hard (protocol) | Easy (HTTP) | Standard HTTP requests |
| **Browser Compatibility** | Good | Universal | Works everywhere |
| **Connection Limit** | Per worker | Unlimited (stateless) | No session limits |

## Future Optimizations (If Needed)

### Adaptive Polling
```typescript
// Could add exponential backoff if needed
if (consecutiveErrors > 3) {
  POLL_INTERVAL = Math.min(POLL_INTERVAL * 1.5, 10000);
} else if (consecutiveErrors === 0) {
  POLL_INTERVAL = 2000;
}
```

### Request Batching
```typescript
// Could batch multiple queries in one request
const response = await fetch(
  `/api/tools/sms-commander/messages-since?since=${since}&includeAll=true`
);
```

### Exponential Backoff with Jitter
```typescript
const backoffMs = Math.min(
  initialDelay * Math.pow(2, retries) + Math.random() * 1000,
  maxDelay
);
```

## Current Implementation Status

✅ **Live and Working:**
- 2-second polling interval
- Message deduplication
- Thread updates
- Hard cap at 1000 attempts (~33 hours)
- Cost-controlled polling
- No WebSocket complexity

✅ **Tested:**
- TypeScript: PASS
- Linting: PASS
- Build: PASS
- No breaking changes

## Summary

The polling architecture is **simple, reliable, and cost-controlled**. It trades real-time latency (WebSocket: <100ms vs Polling: 2 seconds) for simplicity and scalability. The hard cap prevents accidental overnight costs from forgotten tabs.

For SMS messaging use case, 2-second latency is perfectly acceptable. The message experience is responsive and feels real-time to users.


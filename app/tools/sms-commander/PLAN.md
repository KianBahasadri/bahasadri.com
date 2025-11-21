# SMS Commander - Documentation

## Purpose

SMS Commander lets you send and receive SMS messages using Twilio. Features include:

- Send SMS to any phone number
- Receive SMS via webhooks
- View message history
- Threaded chat interface with contact aliases

## Features

### Core Features
- Send SMS with phone validation
- Receive and store incoming messages
- Display messages in chat format
- Manage threads and contacts

### Future Features
- Message search
- Bulk messaging
- Scheduled messages

## Design Decisions

### Message Storage
- Uses Cloudflare KV for persistence
- Keys: `msg:counterpart:timestamp:id` for messages
- Thread summaries for quick UI loading

### Webhook Security
- Validates Twilio signatures
- Automated webhook sync during deployment

### API Routes
- `/api/tools/sms-commander/send` - Send SMS
- `/api/tools/sms-commander/webhook` - Receive SMS
- `/api/tools/sms-commander/threads` - List threads
- `/api/tools/sms-commander/messages-since` - Poll for updates
- `/api/tools/sms-commander/contacts` - Manage contacts

### UI
- Full-screen chat interface
- Polling for real-time updates (every 2 seconds, max 1000 attempts)

## Environment Variables
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## Changelog
- 2025-01-27: Simplified documentation
- 2025-01-27: Removed WebSocket, switched to polling
- 2025-01-27: UI redesign with chat bubbles

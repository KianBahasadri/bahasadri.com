# SMS Commander Testing Plan

## Purpose
- Ensure compatibility with Cloudflare Workers
- Test Twilio flows without sending real SMS

## Scope
- Unit tests for `lib/twilio.ts` and `lib/validation.ts`
- Use Vitest with Workers pool

## Dependencies
- `vitest`
- `@cloudflare/vitest-pool-workers`
- `miniflare`

## Commands
- `pnpm test`: Run tests
- `pnpm test:watch`: Watch mode

## Mocking
- Mock Twilio SDK
- Block real API calls

## Manual Testing
- Use `pnpm sms:smoke --to "+16478068912"` for real SMS (manual only)

_Last updated: 2025-11-21_

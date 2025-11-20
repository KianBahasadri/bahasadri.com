## SMS Commander Vitest Test Suite Plan

### Purpose

-   Guarantee `app/tools/sms-commander` stays compatible with the Cloudflare Workers runtime while adding automated coverage for Twilio flows.
-   Document the expected setup so implementation can happen in a separate workspace without guessing requirements.
-   Reference the official Cloudflare testing guidance for Workers to keep us compliant with project standards.  
    Source: [Cloudflare Workers Testing Guidance](https://developers.cloudflare.com/llms.txt)

### Scope

-   Unit tests for `lib/twilio.ts` and `lib/validation.ts`.
-   Shared Vitest configuration that emulates Workers (`@cloudflare/vitest-pool-workers` + Miniflare).
-   Deterministic mocking strategy for Twilio interactions (no live SMS, even in CI).
-   Optional manual smoke script for sending a single SMS to `+1 647-806-8912` (user-approved number), kept outside automated test runs.

### Dependencies to Add

1. `vitest` – base test runner.
2. `@cloudflare/vitest-pool-workers` – Workers-compatible Vitest pool configuration.
3. `miniflare` – local Workers simulator powering the pool.
4. `@cloudflare/workers-types` – type definitions for global bindings and `env`.
5. Fetch guard (custom) – implemented in `vitest.setup.ts` to block Twilio endpoints without extra deps.

### Repository Changes Needed

1. **Documentation**
    - Update `docs/AI_AGENT_STANDARDS.md` testing section to cite the Cloudflare guidance link above.
    - Add a short “How to run tests” note in `docs/DEVELOPMENT.md` referencing the new Vitest commands.
2. **Configs & Scripts**
    - `pnpm test`: `vitest run --config vitest.config.ts`
    - `pnpm test:watch`: `vitest watch --config vitest.config.ts`
    - `pnpm sms:smoke --to "+16478068912"` script (manual only, uses real Twilio creds; documented as opt-in).
    - `vitest.config.ts` with Cloudflare preset + path aliases pointed at `tsconfig`.
    - `vitest.setup.ts` that:
        - Seeds `globalThis.env` with deterministic fake secrets / Twilio numbers.
        - Wraps global `fetch` with a guard that fails on real Twilio endpoints.
3. **Type Definitions**
    - Ensure `cloudflare-env.d.ts` declares bindings for tests (or create `scripts/cloudflare-env.test.d.ts` if separation is needed).

### Test Coverage Goals

1. **`lib/twilio.ts`**
    - Ensures requests passed to the Twilio SDK are normalized (E.164 formatting, sanitized bodies).
    - Handles success vs. Twilio error responses by stubbing SDK responses (400, 429, etc.).
    - Validates `validateTwilioSignature` behavior stays deterministic using real HMAC inputs.
2. **`lib/validation.ts`**
    - Valid E.164 numbers pass; malformed numbers produce the hostile error copy.
    - Message length, empty body, and restricted content edge cases.
3. **Regression Guard**
    - Add snapshot/style-free tests verifying we don’t accidentally call real Twilio when `process.env.NODE_ENV === "test"`.

### Mocking Strategy

-   Fail tests immediately if any code attempts to call `https://api.twilio.com` during Vitest runs (fetch guard).
-   Stub the Twilio SDK via `vi.mock("twilio")` so we can assert against the `messages.create` payloads directly.
-   Provide deterministic `CloudflareEnv` bindings via `vitest.setup.ts` instead of a bespoke factory.

### Optional Smoke Script Outline

1. Located in `scripts/send-test-sms.ts`.
2. Accepts CLI args `--to`, `--body`.
3. Imports the same Twilio client module but bypasses mocks.
4. Documented as manual-only; not executed by CI.

### CI Considerations

-   Update pipeline (GitHub Actions or other) to run:  
    `pnpm lint && pnpm tsc --noEmit && pnpm test && pnpm preview` (preview already workers-compatible).
-   Cache `.vitest` directory for faster runs.

### Implementation Order

1. Update docs with Cloudflare link and testing instructions.
2. Install dependencies + add scripts to `package.json`.
3. Commit `vitest.config.ts`, `vitest.setup.ts`, and helper utilities.
4. Write tests for `validation.ts` (pure logic, simplest entry point).
5. Add Twilio module tests with SDK-level mocks and dependency injection.
6. Create optional smoke script + README snippet describing manual usage.
7. Wire CI to run `pnpm test`.

### Acceptance Criteria

-   `pnpm test` passes locally and inside CI without hitting external networks.
-   Tests fail loudly if Twilio fetch isn’t mocked.
-   Documentation explicitly references the Cloudflare testing guidance link.
-   Optional smoke script documented but excluded from automated pipelines.

_Last updated: 2025-11-20_

# Testing Documentation

**Testing strategy, guidelines, and practices for the project.**

## Overview

This document outlines the testing approach for the **Bahasadri** monorepo. We use a **Contract-First** strategy to ensure the Hono backend and Vite frontend remain in sync, along with unit testing for complex logic.

## Testing Strategy

We follow the **Testing Pyramid** with a heavy emphasis on **Contract Testing**:

1.  **Contract Tests (Critical):**

    -   **Goal:** Ensure the Backend implementation strictly matches `shared/openapi.yaml`.
    -   **Tool:** `vitest` + `jest-openapi`.
    -   **Rule:** If the code drifts from the YAML, the build fails.

2.  **Unit Tests (Backend):**

    -   **Goal:** Test individual Hono handlers, services, and utility logic.
    -   **Tool:** `vitest`.

3.  **Integration/E2E Tests (Frontend):**
    -   **Goal:** Verify the React UI flows using the mocked API.
    -   **Tool:** `vitest` (components) + `playwright` (optional for later).

## Testing Tools

| Tool             | Usage                                                                |
| :--------------- | :------------------------------------------------------------------- |
| **Vitest**       | Main test runner (fast, Vite-native).                                |
| **jest-openapi** | Matcher to validate Hono responses against `openapi.yaml`.           |
| **Prism**        | Mock server to run `openapi.yaml` locally for frontend dev.          |
| **Spectral**     | Linter to ensure `openapi.yaml` is valid and follows best practices. |

## Test Structure

Tests are co-located with the code they test to keep the monorepo clean.

```text
/apps
  /backend
    /src
      /routes
        slides.ts        # The code
        slides.test.ts   # The contract/unit test
  /frontend
    /src
      /components
        Slide.tsx
        Slide.test.tsx
```

### Standard Contract Test Template

Every API route **must** have a test like this:

```typescript
import { describe, it, expect } from "vitest";
import { app } from "../index";

describe("GET /api/feature", () => {
    it("satisfies OpenAPI spec", async () => {
        const res = await app.request("/api/feature");
        expect(res.status).toBe(200);
        expect(res).toSatisfyApiSpec(); // Validates against shared/openapi.yaml
    });
});
```

## Running Tests

### 1. Run All Tests (Root)

```bash
npm run test
# Or using Turbo
turbo test
```

### 2. Run Backend Tests Only

```bash
cd apps/backend
npm run test
```

### 3. Lint the API Contract

```bash
# Validates shared/openapi.yaml syntax
npx spectral lint shared/openapi.yaml
```

### 4. Run Mock Server (For Frontend Dev)

```bash
# Starts a fake backend at http://127.0.0.1:4010 based on the YAML
npx prism mock shared/openapi.yaml
```

## Best Practices

### 1. The "Spec First" Rule

**Never** write a backend route without defining it in `shared/openapi.yaml` first.

-   ❌ _Wrong:_ Write Hono code -> Update YAML later.
-   ✅ _Right:_ Update YAML -> Run Prism (Frontend can start) -> Write Hono code -> Pass Contract Test.

### 2. Mocking in Frontend

Frontend tests should **not** hit the real backend. Use MSW (Mock Service Worker) or Vitest mocks to return data that matches the OpenAPI examples.

### 3. Continuous Integration

All PRs must pass:

1.  `turbo lint` (ESLint + Prettier)
2.  `npx spectral lint shared/openapi.yaml` (Valid API Spec)
3.  `turbo test` (Contract tests pass)

### 4. Handling "Drift"

If a contract test fails:

-   **Do not** just change the test to make it pass.
-   **Check the Spec:** Did the requirement change? Update `openapi.yaml`.
-   **Check the Code:** Did you return `created_at` instead of `createdAt`? Fix the Hono handler.

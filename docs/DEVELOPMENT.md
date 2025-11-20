# Development Guide

This document provides comprehensive guidelines for developing on Bahasadri.com. Follow these practices to maintain code quality, consistency, and maintainability.

## Development Workflow

### Local Development

1. **Start Development Server**

    ```bash
    pnpm dev
    ```

    - Runs Next.js development server
    - Hot module replacement enabled
    - Access at http://localhost:3000

2. **Preview with Cloudflare Adapter**

    ```bash
    pnpm preview
    ```

    - Builds and runs in Cloudflare Workers runtime
    - More accurate to production environment
    - Use for integration testing

3. **Type Checking**

    ```bash
    pnpm tsc --noEmit
    ```

    - Validates TypeScript without building
    - Can be added to pre-commit hooks

4. **Linting**

    ```bash
    pnpm lint
    ```

    - Runs ESLint with Next.js configuration
    - Catches common errors and style issues

5. **Cloudflare-Compatible Tests**
    ```bash
    pnpm test
    ```
    - Executes the Vitest suite inside the Workers runtime (via Miniflare)
    - Required for utilities like SMS Commander
    - Reference: [Cloudflare Workers Testing Guidance](https://developers.cloudflare.com/llms.txt)

### Secret Synchronization

-   Keep a single `.env` file at the repository root. It remains git-ignored but serves as the canonical source of truth for all credentials, including the Twilio trio required by SMS Commander.
-   Run `pnpm sync:cloudflare-secrets` whenever you change a value locally. Pass `-- --env production` (or any Wrangler environment) to target a specific Worker, and add `-- --dry-run` to preview the pending updates without touching Cloudflare.
-   The script writes secrets through `stdin`, so values never appear in shell history or process listings. It fails fast when a requested key is missing to prevent half-synced deployments.
-   `pnpm deploy` now invokes `pnpm sync:cloudflare-secrets` automatically, ensuring every deployment pushes the freshest secrets before the Worker build kicks off. Override the command in CI if you need a different promotion flow—don’t edit the script.

## Code Documentation Standards

### File-Level Documentation

Every file should start with a comprehensive header comment:

````typescript
/**
 * Component Name
 *
 * Brief description of what this file/component does.
 *
 * Key features:
 * - Feature 1
 * - Feature 2
 *
 * Usage:
 * ```tsx
 * <ComponentName prop1="value" />
 * ```
 *
 * @see https://relevant-docs-url
 */
````

### Component Documentation

Document all components with:

1. **Purpose**: What the component does
2. **Props**: All props with types and descriptions
3. **Behavior**: How it works, edge cases
4. **Examples**: Usage examples

```typescript
/**
 * ComponentName Component
 *
 * This component does X, Y, and Z.
 *
 * @param props - Component props
 * @param props.title - The title to display
 * @param props.onClick - Callback when clicked
 * @returns JSX element
 */
export function ComponentName({ title, onClick }: Props) {
    // Implementation
}
```

### Function Documentation

Document functions with:

1. **Purpose**: What the function does
2. **Parameters**: Types and descriptions
3. **Return Value**: Type and description
4. **Side Effects**: Any side effects (API calls, state changes)
5. **Examples**: Usage examples

````typescript
/**
 * Fetches user data from the API
 *
 * @param userId - The unique identifier for the user
 * @returns Promise resolving to user data
 * @throws {Error} If user is not found
 *
 * @example
 * ```ts
 * const user = await fetchUserData('123');
 * console.log(user.name);
 * ```
 */
async function fetchUserData(userId: string): Promise<User> {
    // Implementation
}
````

### Inline Comments

Use inline comments for:

-   Complex logic explanations
-   Non-obvious code decisions
-   Workarounds or temporary solutions
-   Performance optimizations

```typescript
// Calculate the distance using Haversine formula
// This is more accurate than simple Euclidean distance for geographic coordinates
const distance = calculateHaversineDistance(point1, point2);
```

## Code Style Guidelines

### TypeScript

1. **Always use TypeScript** - No `any` types without justification
2. **Explicit types** - Prefer explicit over inferred for public APIs
3. **Interfaces for objects** - Use interfaces for object shapes
4. **Type aliases for unions** - Use type aliases for complex unions

```typescript
// ✅ Good
interface UserProps {
    name: string;
    age: number;
}

// ❌ Bad
const user: any = { name: "John", age: 30 };
```

### React Components

1. **Server Components by default** - Only use Client Components when needed
2. **Functional components** - Always use function components
3. **Props interface** - Define props with TypeScript interfaces
4. **Component organization** - One component per file (unless tightly coupled)

```typescript
// ✅ Good - Server Component
export default function Page() {
    return <div>Content</div>;
}

// ✅ Good - Client Component (when needed)
("use client");

export default function InteractiveComponent() {
    const [state, setState] = useState(0);
    return <button onClick={() => setState((s) => s + 1)}>{state}</button>;
}
```

### Naming Conventions

1. **Components**: PascalCase (`UserProfile.tsx`)
2. **Files**: Match component name or use kebab-case (`user-profile.tsx`)
3. **Functions**: camelCase (`fetchUserData`)
4. **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
5. **CSS Classes**: camelCase in CSS Modules (`container`, `mainContent`)

### File Organization

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── page.module.css         # Home page styles
├── globals.css             # Global styles
├── components/             # Shared components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   └── Button.test.tsx
│   └── Card/
│       ├── Card.tsx
│       └── Card.module.css
├── lib/                    # Utility functions
│   ├── utils.ts
│   └── api.ts
└── types/                  # TypeScript types
    └── index.ts
```

## CSS Guidelines

### CSS Modules

1. **One module per component** - Keep styles scoped
2. **Semantic class names** - Use descriptive names
3. **Avoid deep nesting** - Keep selectors flat
4. **Use CSS variables** - For theming and consistency

```css
/* ✅ Good */
.container {
    padding: 2rem;
    background: var(--color-background);
}

.title {
    font-size: 2rem;
    color: var(--color-text);
}

/* ❌ Bad */
.container .title .text {
    /* Too nested */
}
```

### Responsive Design

1. **Mobile-first** - Start with mobile styles
2. **Breakpoints** - Use consistent breakpoints
3. **Flexible units** - Use rem, em, %, vw/vh
4. **Test on devices** - Verify on real devices

```css
/* Mobile-first approach */
.container {
    padding: 1rem;
}

@media (min-width: 768px) {
    .container {
        padding: 2rem;
    }
}
```

## Testing Guidelines

-   Prefer `pnpm test` for automated verification—the command runs inside the
    Cloudflare Workers pool so the runtime matches production. See the official
    [Cloudflare Workers Testing Guidance](https://developers.cloudflare.com/llms.txt)
    for details.

### Component Testing

-   Test user interactions
-   Test edge cases
-   Test accessibility
-   Test responsive behavior

### Integration Testing

-   Test API routes
-   Test data flow
-   Test error handling
-   Test with `pnpm preview` for Cloudflare compatibility

## Performance Best Practices

### Server Components

-   Use Server Components for data fetching
-   Minimize Client Components
-   Keep Client Components small

### Code Splitting

-   Next.js handles automatic code splitting
-   Use dynamic imports for large dependencies
-   Lazy load heavy components

### Image Optimization

-   Always use Next.js `Image` component
-   Provide width and height
-   Use appropriate formats (WebP, AVIF)

```tsx
import Image from "next/image";

<Image
    src="/hero.jpg"
    alt="Hero image"
    width={1200}
    height={600}
    priority // For above-the-fold images
/>;
```

## Error Handling

### Error Boundaries

-   Use error boundaries for Client Components
-   Provide fallback UI
-   Log errors appropriately

### API Error Handling

```typescript
try {
    const data = await fetchData();
    return data;
} catch (error) {
    console.error("Failed to fetch data:", error);
    // Return fallback or throw
    throw new Error("Failed to load data");
}
```

## Git Workflow

### Commit Messages

Use conventional commits:

```
feat: add user profile page
fix: resolve image loading issue
docs: update development guide
style: format code with prettier
refactor: reorganize component structure
test: add component tests
chore: update dependencies
```

### Branch Strategy

-   `main` - Production-ready code
-   `develop` - Development branch
-   `feature/*` - Feature branches
-   `fix/*` - Bug fix branches

## Code Review Checklist

Before submitting code for review:

-   [ ] Code is documented
-   [ ] TypeScript types are correct
-   [ ] No linting errors
-   [ ] Tests pass (if applicable)
-   [ ] Works with `pnpm preview`
-   [ ] Responsive design verified
-   [ ] Accessibility checked
-   [ ] Performance considered

## Common Patterns

### Data Fetching

```typescript
// Server Component
async function Page() {
    const data = await fetch("https://api.example.com/data", {
        next: { revalidate: 3600 }, // ISR: revalidate every hour
    });
    const json = await data.json();
    return <div>{json.content}</div>;
}
```

### Client Interactivity

```typescript
"use client";

import { useState } from "react";

export function Counter() {
    const [count, setCount] = useState(0);

    return (
        <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
    );
}
```

### Route Handlers

```typescript
// app/api/example/route.ts
export async function GET(request: Request) {
    return Response.json({ message: "Hello" });
}
```

## Content Style Guide

**⚠️ CRITICAL: All content MUST follow [CONTENT_STYLE.md](./CONTENT_STYLE.md). This is the official humor and tone standard.**

### Core Persona

The site persona is a **"Paranoid Femboy Sysadmin"** trapped in a simulation. All content must reflect this.

### Quick Reference

-   **Tone**: Manic, accusatory, horny-on-main, technically literate
-   **Worldview**: Everything is a psyop. The code is gangstalking you.
-   **Style**: 4chan /g/ text, Tumblr mental illness romanticism, "Lock In" motivation
-   **Humor**: Gangstalking narratives, glorp nihilism, degenerate specificity, self-targeting edginess

### Mandatory Reading

**Before writing ANY user-facing content, read:**

-   [CONTENT_STYLE.md](./CONTENT_STYLE.md) - Complete content guidelines with examples

### Key Rules

1. **No "Helpful" Tone**: Never say "Here is the information." Say "I stole this from the archives before the feds found me."
2. **Geopolitical Metaphors**: Coding tasks are "impossible Balkan peace treaties."
3. **Self-Target Only**: Offensive content directed at creator/code, never users
4. **Banned Vibes**: No YouTuber energy, no LinkedIn speak, no "safe space" language

### Examples

**Hero Section:**

-   ❌ "Welcome to my utility tools"
-   ✅ "POV: You are the FBI agent assigned to monitor my mental decline"

**Utility Names:**

-   ❌ "SMS Commander"
-   ✅ "Text Warfare Center" or "Message Psyop Interface"

**Success Messages:**

-   ❌ "Message sent successfully"
-   ✅ "Message launched into the void. The lion ignores the sharp pain. We lock in."

See [CONTENT_STYLE.md](./CONTENT_STYLE.md) for complete guidelines and examples.

## Creating Utilities

When creating a new utility:

1. **Read [UTILITIES.md](./UTILITIES.md)** - Complete utility architecture guide
2. **Create directory structure** - `app/tools/[utility-name]/`
3. **Create PLAN.md** - Document planning, features, and links
4. **Build utility** - Follow decoupling principles
5. **Add to dashboard** - Update `UTILITY_TOOLS` in `app/page.tsx`

Key principles:

-   ✅ Each utility is completely decoupled
-   ✅ Each utility has its own `PLAN.md` file
-   ✅ Use Server Components by default
-   ✅ Scope styles with CSS Modules
-   ✅ Follow content style guide (edgy, dark humor)

See [UTILITIES.md](./UTILITIES.md) for complete guidelines and templates.

## Resources

-   [Next.js Documentation](https://nextjs.org/docs)
-   [TypeScript Handbook](https://www.typescriptlang.org/docs/)
-   [React Documentation](https://react.dev/)
-   [CSS Modules](https://github.com/css-modules/css-modules)
-   [Utilities Architecture](./UTILITIES.md) - Utility creation guide

---

**Last Updated**: 2025-01-27

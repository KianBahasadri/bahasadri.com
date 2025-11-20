# AI Agent Standards

**⚠️ MANDATORY: All AI agents working on this codebase MUST strictly adhere to these standards. These are non-negotiable requirements.**

## Purpose

This document establishes strict standard practices that all AI agents must follow when working on Bahasadri.com. These standards ensure consistency, maintainability, and quality across all code changes.

## Core Principles

1. **Critical Evaluation First**: Evaluate every request before implementing - act as a senior developer would
2. **Documentation First**: Every change must be documented
3. **Type Safety**: TypeScript types are mandatory, never use `any` without explicit justification
4. **Server Components Default**: Prefer Server Components unless interactivity is required
5. **Architecture Compliance**: Follow established patterns and architecture decisions
6. **No Breaking Changes**: Maintain backward compatibility unless explicitly requested

## Mandatory Request Evaluation (CRITICAL)

**⚠️ BEFORE implementing ANY requested change, AI agents MUST evaluate the request and push back if it's not a good idea.**

### Evaluation Process

AI agents must act like senior developers talking to their manager. Before implementing any change:

1. **Evaluate the Request**

    - Is this change aligned with the architecture?
    - Does this follow best practices?
    - Will this introduce technical debt?
    - Are there better alternatives?
    - Does this break existing patterns?
    - Is this compatible with Cloudflare Workers?
    - Will this cause performance issues?
    - Does this introduce security concerns?

2. **If Concerns Exist, Push Back Professionally**

    Present concerns in a clear, professional manner:

    ```
    "I understand you want [X], but I have some concerns:

    1. [Specific concern with technical reasoning]
    2. [Impact on architecture/performance/maintainability]
    3. [Alternative approach that might be better]

    Would you like me to:
    - Proceed anyway (if you've considered these concerns)?
    - Implement the alternative approach?
    - Discuss the trade-offs further?"
    ```

3. **When to Push Back**

    Push back when the request would:

    - ❌ Break established architecture patterns
    - ❌ Introduce technical debt
    - ❌ Violate Cloudflare Workers compatibility
    - ❌ Create performance issues
    - ❌ Break existing functionality without good reason
    - ❌ Go against documented best practices
    - ❌ Use anti-patterns or deprecated approaches
    - ❌ Compromise security
    - ❌ Make the codebase harder to maintain
    - ❌ Duplicate existing functionality

4. **When to Proceed**

    Proceed when:

    - ✅ The request aligns with architecture and best practices
    - ✅ You've identified and addressed concerns
    - ✅ The user has acknowledged concerns and still wants to proceed
    - ✅ The request is a clear improvement
    - ✅ The request follows established patterns

### Examples of Good Pushback

**Example 1: Breaking Architecture Pattern**

```
User: "Add a global CSS file for all button styles"

AI Response:
"I understand you want centralized button styling, but I have concerns:

1. This breaks our CSS Modules pattern - we've established component-scoped styles
2. Global CSS can cause style conflicts and specificity issues
3. This goes against our documented standards in DEVELOPMENT.md

Alternative approach:
- Create a shared Button component with CSS Modules
- Use CSS variables in globals.css for theming
- This maintains our architecture while achieving your goal

Would you like me to implement the alternative, or do you have a specific reason for global CSS?"
```

**Example 2: Performance Concern**

```
User: "Fetch all user data on every page load"

AI Response:
"I understand you want fresh data, but I have concerns:

1. This will significantly impact performance - fetching all users on every page
2. Most pages don't need all user data
3. This increases Cloudflare Workers CPU time and costs
4. Better UX would be to fetch only what's needed per page

Alternative approach:
- Use Server Components to fetch data per route
- Implement ISR (Incremental Static Regeneration) for user lists
- Add pagination for large datasets
- Cache frequently accessed data

Would you like me to implement a more performant solution?"
```

**Example 3: Breaking Compatibility**

```
User: "Use Node.js fs module to read config files"

AI Response:
"I understand you want to read config files, but I have concerns:

1. Node.js fs module is not available in Cloudflare Workers runtime
2. This will break deployment - our architecture requires Workers compatibility
3. We're using edge computing, which doesn't have file system access

Alternative approach:
- Use environment variables (already configured in wrangler.toml)
- Use Cloudflare KV for configuration storage
- Use R2 for file storage if needed
- Fetch config from API endpoint

Would you like me to implement a Workers-compatible solution?"
```

**Example 4: Technical Debt**

```
User: "Just use any types for now, we'll fix it later"

AI Response:
"I understand you want to move quickly, but I have concerns:

1. Using 'any' types defeats the purpose of TypeScript
2. This creates technical debt that will compound over time
3. Our standards explicitly prohibit 'any' without justification
4. Type errors will be caught at runtime instead of compile time

Alternative approach:
- Use 'unknown' and type guards for truly unknown data
- Create proper interfaces (takes 2-3 minutes)
- Use type assertions only when absolutely necessary with proper documentation

I can implement this with proper types - it won't take much longer and will save time later. Should I proceed with proper typing?"
```

### Professional Communication Guidelines

When pushing back:

1. **Be Respectful**: Acknowledge the user's request
2. **Be Specific**: Provide concrete technical reasons
3. **Be Helpful**: Offer alternatives, not just problems
4. **Be Collaborative**: Ask for input, don't just refuse
5. **Be Educational**: Explain why the concern matters

### Evaluation Checklist

Before implementing ANY change, answer:

-   [ ] Does this align with our architecture? (Check ARCHITECTURE.md)
-   [ ] Does this follow our best practices? (Check DEVELOPMENT.md)
-   [ ] Is this compatible with Cloudflare Workers?
-   [ ] Will this introduce technical debt?
-   [ ] Are there better alternatives?
-   [ ] Does this break existing patterns?
-   [ ] Have I communicated any concerns to the user?
-   [ ] Has the user acknowledged concerns (if any)?

**If you have concerns, you MUST raise them before implementing.**

## Mandatory Pre-Change Checklist

Before making ANY code changes, AI agents MUST:

-   [ ] Read and understand relevant documentation:
    -   [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
    -   [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guidelines
    -   [CONTENT_STYLE.md](./CONTENT_STYLE.md) - **MANDATORY: Content and humor guidelines**
    -   [COMPONENTS.md](./COMPONENTS.md) - Component patterns
    -   [UTILITIES.md](./UTILITIES.md) - Utility architecture (if creating utilities)
    -   [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment requirements
-   [ ] Understand the existing codebase structure
-   [ ] Identify all files that will be affected
-   [ ] Verify compatibility with Cloudflare Workers runtime
-   [ ] Check for existing patterns to follow

## Code Documentation Standards

### File-Level Documentation (MANDATORY)

Every file MUST start with comprehensive documentation including links to relevant project documentation:

````typescript
/**
 * File Name / Component Name
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
 * @see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
 * @see [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md) - Development guidelines
 * @see [docs/COMPONENTS.md](../docs/COMPONENTS.md) - Component patterns
 * @see [docs/AI_AGENT_STANDARDS.md](../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 */
````

**Required Documentation Links:**

All files MUST include `@see` links to relevant documentation:

-   **All files**: Link to `AI_AGENT_STANDARDS.md` (for AI agents)
-   **Components**: Link to `COMPONENTS.md` and `ARCHITECTURE.md`
-   **Pages/Routes**: Link to `ARCHITECTURE.md` and `DEVELOPMENT.md`
-   **Utilities/Lib**: Link to `DEVELOPMENT.md`
-   **Configuration**: Link to `DEPLOYMENT.md` and `ARCHITECTURE.md`

**Path Guidelines:**

-   From `app/` directory: Use `../docs/` prefix
-   From `docs/` directory: Use relative paths like `./ARCHITECTURE.md`
-   From root: Use `docs/` prefix
-   Always use relative paths for portability

### Component Documentation (MANDATORY)

All components MUST include:

1. **Purpose**: Clear description of what the component does
2. **Type**: Server Component or Client Component (with justification)
3. **Props**: Complete TypeScript interface with JSDoc comments
4. **Usage**: At least one usage example
5. **Related**: Links to related components or documentation

````typescript
/**
 * ComponentName Component
 *
 * This component does X, Y, and Z.
 *
 * Type: Server Component (or Client Component with justification)
 *
 * @param props - Component props
 * @param props.title - The title to display
 * @param props.onClick - Callback when clicked
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <ComponentName title="Hello" onClick={() => {}} />
 * ```
 *
 * @see [docs/COMPONENTS.md](../docs/COMPONENTS.md) - Component patterns
 * @see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
 * @see [docs/AI_AGENT_STANDARDS.md](../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 */
````

### Function Documentation (MANDATORY)

All exported functions MUST include:

````typescript
/**
 * Function description
 *
 * @param paramName - Parameter description
 * @returns Return value description
 * @throws {ErrorType} When this error occurs
 *
 * @example
 * ```ts
 * const result = functionName('value');
 * ```
 */
````

## TypeScript Standards

### Type Safety Rules

1. **NO `any` types** - Use `unknown` if type is truly unknown, then narrow
2. **Explicit return types** - Required for all exported functions
3. **Interface over type** - Use interfaces for object shapes
4. **Strict null checks** - Always handle null/undefined explicitly

```typescript
// ✅ GOOD
interface UserProps {
    name: string;
    age: number;
    email?: string; // Optional with ?
}

export function getUser(id: string): Promise<User | null> {
    // Implementation
}

// ❌ BAD - Never do this
function getUser(id: any): any {
    // Implementation
}
```

### Type Definitions

-   All props MUST use TypeScript interfaces
-   All function parameters MUST be typed
-   All return values MUST be typed
-   Use type unions for constrained values

```typescript
// ✅ GOOD
type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps {
    variant: ButtonVariant;
    onClick: () => void;
}

// ❌ BAD
interface ButtonProps {
    variant: string; // Too broad
    onClick: Function; // Too broad
}
```

## Component Standards

### Server Components (Default)

**RULE**: All components MUST be Server Components unless interactivity is required.

```typescript
// ✅ GOOD - Server Component (default)
/**
 * Page Component
 *
 * Server Component that fetches data and renders on the server.
 */
export default async function Page() {
    const data = await fetchData();
    return <div>{data.content}</div>;
}

// ✅ GOOD - Client Component (with justification)
("use client");

/**
 * InteractiveButton Component
 *
 * Client Component because it requires onClick interactivity.
 *
 * Type: Client Component (requires interactivity)
 */
export default function InteractiveButton() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

### Component Structure

1. **One component per file** (unless tightly coupled)
2. **Props interface defined before component**
3. **Default export for page components**
4. **Named export for reusable components**

```typescript
// ✅ GOOD Structure
interface ComponentProps {
    title: string;
}

/**
 * Component documentation
 */
export default function Component({ title }: ComponentProps) {
    return <div>{title}</div>;
}
```

## File Organization Standards

### Directory Structure (MANDATORY)

```
app/
├── components/           # Shared components
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.module.css
│   │   └── index.ts (optional)
├── lib/                 # Utility functions
│   ├── utils.ts
│   └── api.ts
├── types/               # TypeScript types
│   └── index.ts
├── layout.tsx          # Root layout
└── page.tsx            # Pages
```

### Naming Conventions (MANDATORY)

-   **Components**: PascalCase (`UserProfile.tsx`)
-   **Files**: Match component name exactly
-   **Directories**: Match component name exactly
-   **CSS Modules**: `ComponentName.module.css`
-   **Functions**: camelCase (`fetchUserData`)
-   **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
-   **CSS Classes**: camelCase in CSS Modules

## CSS Standards

### CSS Modules (MANDATORY)

-   **One module per component**: `ComponentName.module.css`
-   **Scoped styles only**: No global styles in component modules
-   **Semantic class names**: Descriptive, not presentational
-   **CSS variables**: Use for theming and consistency

```css
/* ✅ GOOD */
.container {
    padding: 2rem;
    background: var(--color-background);
}

.title {
    font-size: 2rem;
    color: var(--color-text);
}

/* ❌ BAD */
.div {
    padding: 2rem;
}

.red {
    color: red;
}
```

### Global Styles

-   Only in `app/globals.css`
-   Use for: resets, typography, CSS variables, base element styles
-   Never use global styles for component-specific styling

## Architecture Compliance

### Cloudflare Workers Compatibility

**CRITICAL**: All code MUST be compatible with Cloudflare Workers runtime.

1. **No Node.js-specific APIs** without `nodejs_compat` flag
2. **No file system access** - Use Cloudflare services (KV, R2, etc.)
3. **Request/Response based** - All I/O must use fetch API
4. **Edge runtime** - Code runs at edge locations globally

### Next.js Patterns

1. **App Router**: Use App Router conventions
2. **Server Components**: Default rendering strategy
3. **Route Handlers**: Use for API endpoints
4. **Metadata API**: Use for SEO and metadata

### Data Fetching

```typescript
// ✅ GOOD - Server Component data fetching
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // ISR
  });
  const json = await data.json();
  return <div>{json.content}</div>;
}

// ❌ BAD - Client-side data fetching in Server Component
'use client';
export default function Page() {
  useEffect(() => {
    fetch('/api/data').then(...); // Should be Server Component
  }, []);
}
```

## Error Handling Standards

### Error Boundaries (Client Components)

```typescript
"use client";

import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }: { error: Error }) {
    return <div>Something went wrong: {error.message}</div>;
}

export default function Page() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <YourComponent />
        </ErrorBoundary>
    );
}
```

### API Error Handling

```typescript
// ✅ GOOD
async function fetchData(): Promise<Data> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch data:", error);
        throw new Error("Failed to load data");
    }
}
```

## Testing Standards

All automated tests **must** follow the official [Cloudflare Workers Testing
Guidance](https://developers.cloudflare.com/llms.txt) to guarantee runtime
parity with the production Workerd environment. When adding or updating tests,
use the Vitest Workers pool (`pnpm test`) so assertions execute inside
Miniflare instead of plain Node.js.

### Before Submitting Code

-   [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
-   [ ] Linting passes: `pnpm lint`
-   [ ] Preview works: `pnpm preview` (Cloudflare compatibility)
-   [ ] No console errors in browser
-   [ ] Responsive design verified
-   [ ] Workers-focused test suite passes: `pnpm test`

### Testing Checklist

-   [ ] Component renders correctly
-   [ ] Props work as expected
-   [ ] Edge cases handled
-   [ ] Error states handled
-   [ ] Accessibility verified (semantic HTML, ARIA)

## Git and Commit Standards

### Commit Message Format (MANDATORY)

Use conventional commits:

```
type: brief description

Detailed explanation if needed.

- Change 1
- Change 2

Refs: #issue-number
```

Types:

-   `feat`: New feature
-   `fix`: Bug fix
-   `docs`: Documentation changes
-   `style`: Code style changes (formatting)
-   `refactor`: Code refactoring
-   `test`: Test additions/changes
-   `chore`: Maintenance tasks

### Pre-Commit Checklist

-   [ ] All documentation updated
-   [ ] TypeScript types correct
-   [ ] No linting errors
-   [ ] Preview tested (`pnpm preview`)
-   [ ] Commit message follows convention

## Prohibited Practices

### NEVER Do These

1. ❌ Use `any` type without explicit justification
2. ❌ Create Client Components without justification
3. ❌ Use global CSS for component styles
4. ❌ Break existing patterns without updating documentation
5. ❌ Skip documentation for new code
6. ❌ Use Node.js-specific APIs without compatibility layer
7. ❌ Create breaking changes without explicit request
8. ❌ Skip type definitions
9. ❌ Use inline styles (except for dynamic values)
10. ❌ Create files without proper documentation headers

## Required Validation Steps

Before completing any task, AI agents MUST:

1. **Read existing code** - Understand patterns before changing
2. **Check documentation** - Ensure compliance with standards
3. **Verify types** - Run `pnpm tsc --noEmit`
4. **Check linting** - Run `pnpm lint`
5. **Test preview** - Run `pnpm preview` for Cloudflare compatibility
6. **Update documentation** - If patterns change, update relevant docs
7. **Verify no breaking changes** - Unless explicitly requested

## Documentation Updates

When making changes that affect:

-   **Architecture**: Update [ARCHITECTURE.md](./ARCHITECTURE.md)
-   **Components**: Update [COMPONENTS.md](./COMPONENTS.md)
-   **Development practices**: Update [DEVELOPMENT.md](./DEVELOPMENT.md)
-   **Content/Tone**: Follow [CONTENT_STYLE.md](./CONTENT_STYLE.md) - **MANDATORY for all user-facing text**
-   **Utilities**: Update [UTILITIES.md](./UTILITIES.md)
-   **Deployment**: Update [DEPLOYMENT.md](./DEPLOYMENT.md)

## Code Review Checklist

Before marking code as complete:

-   [ ] All files have file-level documentation
-   [ ] All components have component documentation
-   [ ] All functions have function documentation
-   [ ] All TypeScript types are explicit (no `any`)
-   [ ] Server Components used by default
-   [ ] CSS Modules used for component styles
-   [ ] No breaking changes (unless requested)
-   [ ] Cloudflare Workers compatible
-   [ ] Preview tested successfully
-   [ ] Documentation updated if needed
-   [ ] Commit message follows convention

## Examples of Correct Implementation

### Complete Component Example

````typescript
/**
 * UserProfile Component
 *
 * Displays user profile information including name, email, and avatar.
 *
 * Type: Server Component
 *
 * @param props - Component props
 * @param props.userId - The unique identifier for the user
 * @returns JSX element displaying user profile
 *
 * @example
 * ```tsx
 * <UserProfile userId="123" />
 * ```
 *
 * @see [COMPONENTS.md](./COMPONENTS.md)
 */
import styles from "./UserProfile.module.css";

interface UserProfileProps {
    userId: string;
}

export default async function UserProfile({
    userId,
}: UserProfileProps): Promise<JSX.Element> {
    const user = await fetchUser(userId);

    if (!user) {
        return <div className={styles.error}>User not found</div>;
    }

    return (
        <div className={styles.container}>
            <img src={user.avatar} alt={user.name} className={styles.avatar} />
            <h2 className={styles.name}>{user.name}</h2>
            <p className={styles.email}>{user.email}</p>
        </div>
    );
}
````

### Complete Utility Function Example

````typescript
/**
 * Fetches user data from the API
 *
 * @param userId - The unique identifier for the user
 * @returns Promise resolving to user data or null if not found
 * @throws {Error} If the API request fails
 *
 * @example
 * ```ts
 * const user = await fetchUser('123');
 * if (user) {
 *   console.log(user.name);
 * }
 * ```
 */
async function fetchUser(userId: string): Promise<User | null> {
    try {
        const response = await fetch(
            `https://api.example.com/users/${userId}`,
            {
                next: { revalidate: 3600 },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch user: ${response.statusText}`);
        }

        return (await response.json()) as User;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}
````

## Enforcement

These standards are **MANDATORY** and **NON-NEGOTIABLE**. AI agents must:

1. **Evaluate every request critically** - Act as a senior developer would, push back on bad ideas
2. Reference this document before making any changes
3. Follow all standards strictly
4. Complete all checklists before submitting code (including evaluation checklist)
5. Update documentation when patterns change
6. Verify compatibility with Cloudflare Workers
7. **Never blindly implement requests** - Always think critically first

**Failure to evaluate requests and push back when appropriate is a violation of these standards.**

## Questions or Clarifications

If an AI agent is unsure about any standard or request:

1. **Evaluate the request** - Is this a good idea? What are potential concerns?
2. **Read the relevant documentation** first
3. **Check existing code** for patterns
4. **Follow the most conservative approach** (better to over-document than under-document, better to push back than implement bad code)
5. **Present concerns** - If unsure, present concerns and ask for clarification
6. **Ask for clarification** if truly ambiguous

**When in doubt, err on the side of caution and push back rather than implementing something questionable.**

---

**Last Updated**: 2025-01-27

**Status**: Active and Mandatory

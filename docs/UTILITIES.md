# Utilities Architecture

This document describes the architecture and patterns for creating utilities on Bahasadri.com.

## Utility Structure

Each utility is **completely decoupled** from other utilities and follows a consistent structure:

```
app/
└── tools/
    └── [utility-name]/
        ├── page.tsx              # Main utility page (Server Component by default)
        ├── page.module.css       # Utility-specific styles
        ├── PLAN.md               # Documentation and planning for this utility
        └── components/           # Utility-specific components (optional)
            └── ComponentName/
                ├── ComponentName.tsx
                └── ComponentName.module.css
```

## Decoupling Principles

### ✅ DO

- Keep each utility in its own route directory (`app/tools/[utility-name]/`)
- Use utility-specific components in `components/` subdirectory
- Keep utility-specific styles scoped to the utility
- Use shared components from `app/components/` (Navigation, UtilityCard, etc.)
- Document each utility in its own `PLAN.md` file

### ❌ DON'T

- Import components from other utilities
- Share state or logic between utilities
- Create dependencies between utilities
- Use global styles for utility-specific styling

## Utility Documentation (PLAN.md)

Every utility **MUST** have a `PLAN.md` file in its directory. This file contains:

1. **Purpose**: What the utility does
2. **Planning**: Design decisions, features, edge cases
3. **Documentation Links**: External resources, APIs, libraries
4. **Implementation Notes**: Technical details, gotchas
5. **Future Enhancements**: Ideas for improvements

### PLAN.md Template

```markdown
# [Utility Name] - Planning & Documentation

## Purpose

Brief description of what this utility does and why it exists.

## Planning

### Features
- Feature 1
- Feature 2

### Design Decisions
- Decision 1 and rationale
- Decision 2 and rationale

### Edge Cases
- Edge case 1 and how it's handled
- Edge case 2 and how it's handled

## Documentation Links

### External Resources
- [Link 1](url) - Description
- [Link 2](url) - Description

### APIs/Libraries Used
- Library/API name - Purpose and link

### Related Documentation
- [Project Architecture](../docs/ARCHITECTURE.md)
- [Development Guide](../docs/DEVELOPMENT.md)

## Implementation Notes

### Technical Details
- Technical note 1
- Technical note 2

### Gotchas
- Gotcha 1 and solution
- Gotcha 2 and solution

### Cloudflare Workers Compatibility
- Any Workers-specific considerations

## Future Enhancements

- Enhancement idea 1
- Enhancement idea 2
```

## Creating a New Utility

### Step 1: Create Directory Structure

```bash
mkdir -p app/tools/[utility-name]/components
```

### Step 2: Create PLAN.md

Create `app/tools/[utility-name]/PLAN.md` with planning and documentation links.

### Step 3: Create Page Component

Create `app/tools/[utility-name]/page.tsx`:

```typescript
/**
 * [Utility Name] Page
 *
 * Brief description of what this utility does.
 *
 * @see [PLAN.md](./PLAN.md) - Planning and documentation
 * @see [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) - System architecture
 * @see [docs/DEVELOPMENT.md](../../../docs/DEVELOPMENT.md) - Development guidelines
 */

import styles from "./page.module.css";

export default function UtilityPage() {
    return (
        <main className={styles.main}>
            {/* Utility content */}
        </main>
    );
}
```

### Step 4: Create Styles

Create `app/tools/[utility-name]/page.module.css` with scoped styles.

### Step 5: Add to Dashboard

Add the utility to `UTILITY_TOOLS` array in `app/page.tsx`:

```typescript
const UTILITY_TOOLS: UtilityTool[] = [
    {
        title: "Utility Name",
        description: "Edgy description",
        href: "/tools/[utility-name]",
        icon: "⚔️"
    },
];
```

## Utility Component Patterns

### Server Component (Default)

```typescript
/**
 * Component for [Utility Name]
 *
 * Type: Server Component
 */
export default function UtilityComponent() {
    // Server-side logic
    return <div>Content</div>;
}
```

### Client Component (When Needed)

```typescript
'use client';

/**
 * Interactive Component for [Utility Name]
 *
 * Type: Client Component (requires interactivity)
 */
import { useState } from 'react';

export default function InteractiveComponent() {
    const [state, setState] = useState(0);
    return <button onClick={() => setState(s => s + 1)}>{state}</button>;
}
```

## Best Practices

1. **Keep Utilities Independent**: Each utility should work standalone
2. **Document Everything**: Use PLAN.md for planning and documentation
3. **Scope Styles**: Use CSS Modules, never global styles for utility-specific styling
4. **Server Components First**: Only use Client Components when interactivity is needed
5. **Type Safety**: All props and functions must be typed
6. **Follow Content Style**: **MANDATORY** - Read [CONTENT_STYLE.md](../CONTENT_STYLE.md) before writing any user-facing text

## Example Utility Structure

See `app/tools/example-utility/` for a complete example (if created).

---

**Last Updated**: 2025-01-27


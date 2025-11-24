# [Feature Name] - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the [Feature Name] utility. [Brief description of what the frontend provides]

## Code Location

`frontend/src/pages/[feature-name]/`

## API Contract Reference

See `docs/features/[feature-name]/API_CONTRACT.md` for the API contract this frontend consumes.

## Pages/Routes

### `/[feature-name]`

**Component**: `[ComponentName].tsx`

**Description**: Main page for [feature name] utility

**Route Configuration**:

```typescript
<Route path="/[feature-name]" element={<[ComponentName] />} />
```

## Components

### [ComponentName] (Main Page)

**Location**: `[ComponentName].tsx`

**Purpose**: [What this component does]

**State**:

-   Server state: [TanStack Query state]
-   Local state: [React state]

**Layout**:

-   [Layout description]

### [SubComponent]

**Location**: `components/[SubComponent]/[SubComponent].tsx`

**Purpose**: [What this component does]

**Props**:

```typescript
interface [SubComponent]Props {
    // Props definition
}
```

**State**:

-   [State description]

**Interactions**:

-   [User interactions]

**Styling**:

-   CSS Modules: `[SubComponent].module.css`
-   [Styling notes]

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    [key]: ["[feature-name]", "[key]"] as const,
};

// TanStack Query hooks
const use[QueryName] = () => {
    return useQuery({
        queryKey: queryKeys.[key],
        queryFn: () => fetch[QueryName](),
    });
};
```

### Local State (React)

```typescript
// [State description]
const [[stateName], set[StateName]] = useState<[Type]>([initialValue]);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// [Function description]
export const [functionName] = async ([params]): Promise<[ReturnType]> => {
    const response = await fetch("/api/[feature-name]/[endpoint]", {
        method: "[METHOD]",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([body]),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "[Error message]");
    }

    return response.json();
};
```

### Error Handling

-   [Error handling strategy]

## User Interactions

### Primary Actions

-   **[Action Name]**:

    -   Trigger: [How it's triggered]
    -   Flow: [Flow description]
    -   Error handling: [Error handling]

### Form Handling

-   [Form validation and handling]

## UI/UX Requirements

### Layout

-   [Layout description]

### Visual Design

-   [Visual design notes]

### User Feedback

-   Loading states: [Loading state description]
-   Error messages: [Error display]
-   Success feedback: [Success feedback]
-   Empty states: [Empty state handling]

## Implementation Checklist

### Components

-   [ ] [ComponentName] page component
-   [ ] [SubComponent] component
-   [ ] CSS Modules for all components

### Pages

-   [ ] Main page route configuration

### State Management

-   [ ] TanStack Query setup
-   [ ] API client functions
-   [ ] Error handling
-   [ ] Loading states

### Styling

-   [ ] CSS Modules for components
-   [ ] Responsive design
-   [ ] Loading/error states
-   [ ] Empty states

### Integration

-   [ ] Connect to backend API (per API_CONTRACT.md)
-   [ ] Handle errors gracefully

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching
-   Standard React hooks

## Performance Considerations

-   [Performance optimization notes]

## Accessibility

-   Semantic HTML: Use proper form elements
-   ARIA labels: Label inputs and buttons
-   Keyboard navigation: Support keyboard shortcuts
-   Screen reader support: [Screen reader considerations]

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend.

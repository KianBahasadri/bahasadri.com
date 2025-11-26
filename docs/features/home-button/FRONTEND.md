# Home Button - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the Home Button global navigation component. The home button is a fixed-position navigation element that appears on all pages except the home page, providing quick access to return to the home page.

## Code Location

`frontend/src/components/HomeButton/`

## API Contract Reference

N/A - This is a pure frontend navigation component with no backend API requirements.

## Pages/Routes

### Global Component

**Component**: `HomeButton.tsx`

**Description**: Global navigation button rendered in `App.tsx` that appears on all routes except the home page

**Route Configuration**:

The component is rendered at the app root level in `App.tsx`:

```typescript
<>
    <HomeButton />
    <Routes>
        {/* routes */}
    </Routes>
</>
```

## Components

### HomeButton

**Location**: `components/HomeButton/HomeButton.tsx`

**Purpose**: Fixed-position navigation button that links to the home page

**Props**: None (uses React Router hooks internally)

**State**:

-   Router state: Uses `useLocation()` to determine current pathname
-   Conditional rendering: Returns `null` when on home page (`pathname === "/"`)

**Layout**:

-   Fixed position: `position: fixed`
-   Bottom-right corner: `bottom: 0.5rem; right: 0.5rem`
-   High z-index: `z-index: 1001` (ensures visibility above other content)
-   Emoji icon: 🏠 (house emoji)

**Interactions**:

-   Click/Tap: Navigates to `/` using React Router `Link` component
-   Hover: Scales up to 1.1x with smooth transition
-   Active: Scales down to 0.95x when pressed
-   Focus: Shows pink outline for keyboard navigation

**Styling**:

-   CSS Modules: `HomeButton.module.css`
-   Animation: Fade-in on mount (200ms ease-in)
-   Transitions: All state changes use 0.3s ease transition
-   Accessibility: Respects `prefers-reduced-motion` media query

## State Management

### Router State

```typescript
const location = useLocation();

// Conditional rendering based on pathname
if (location.pathname === "/") {
    return null;
}
```

### Local State

N/A - Component is stateless except for router location

## API Integration

N/A - This component has no backend API dependencies. It uses React Router for client-side navigation only.

## User Interactions

### Primary Actions

-   **Navigate to Home**:
    -   Trigger: Click/tap on button, or Enter/Space when focused
    -   Flow: React Router `Link` component handles navigation to `/`
    -   Error handling: N/A (client-side navigation)

### Keyboard Navigation

-   Tab: Focus moves to button (shows focus outline)
-   Enter/Space: Activates link and navigates to home page

## UI/UX Requirements

### Layout

-   Fixed position in bottom-right corner
-   Consistent positioning across all pages
-   High z-index to ensure visibility above page content

### Visual Design

-   Emoji icon: 🏠 (1.2rem font size)
-   No background or border (transparent)
-   Hover: Scale transform (1.1x)
-   Active: Scale transform (0.95x)
-   Focus: Pink outline (`--pink-hot: #ff69b4`) with 2px offset

### User Feedback

-   Loading states: N/A (instant client-side navigation)
-   Error messages: N/A (no error states)
-   Success feedback: Navigation occurs immediately
-   Empty states: Button doesn't render on home page

### Animations

-   Fade-in: 200ms ease-in on mount
-   Hover/Active transitions: 0.3s ease
-   Reduced motion: Animations disabled when `prefers-reduced-motion: reduce`

## Implementation Checklist

### Components

-   [x] HomeButton component
-   [x] CSS Modules for styling
-   [x] Conditional rendering logic

### Pages

-   [x] Global component registration in `App.tsx`

### State Management

-   [x] React Router `useLocation` hook integration
-   [x] Conditional rendering based on pathname

### Styling

-   [x] CSS Modules for component
-   [x] Fixed positioning
-   [x] Hover/active/focus states
-   [x] Animations with reduced motion support
-   [x] Accessibility considerations

### Integration

-   [x] React Router `Link` component for navigation
-   [x] Global rendering in app root

## Dependencies

### React Libraries

-   `react-router-dom`: For `Link` component and `useLocation` hook
-   Standard React hooks

## Performance Considerations

-   Minimal re-renders: Component only re-renders on route changes
-   Lightweight: Simple conditional rendering with no heavy computations
-   CSS animations: Hardware-accelerated transforms for smooth performance

## Accessibility

-   Semantic HTML: Uses `<Link>` component (renders as `<a>` tag)
-   ARIA labels: Inherits from React Router Link component
-   Keyboard navigation: Fully keyboard accessible with focus indicators
-   Screen reader support: Link text (emoji) is readable by screen readers
-   Focus management: Clear visual focus outline for keyboard users
-   Reduced motion: Respects user's motion preferences

---

**Note**: This document is independent of backend implementation. This component has no backend dependencies.


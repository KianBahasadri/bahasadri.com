# Home Button - User Features

**Global navigation button that appears on all pages except the home page, allowing users to quickly return to the home page.**

## Overview

The home button is a fixed-position navigation element that appears in the bottom-right corner of all pages (except the home page itself). It provides a quick and consistent way for users to navigate back to the home page from any tool or feature page.

## Key Features

### Fixed Position Navigation

The home button is always visible in the bottom-right corner of the screen when users are on any page other than the home page, providing consistent navigation access.

### Conditional Display

The button intelligently hides itself when users are already on the home page (`/`), preventing redundant navigation options.

### Visual Feedback

The button provides clear interactive feedback:

-   Hover effect: Button scales up slightly (1.1x) on hover
-   Active state: Button scales down (0.95x) when clicked
-   Smooth transitions: All state changes are animated smoothly
-   Fade-in animation: Button fades in when it appears

### Accessibility

The button includes accessibility features:

-   Focus outline: Visible focus indicator for keyboard navigation
-   Semantic HTML: Uses proper `<Link>` component for navigation
-   Reduced motion support: Respects user's `prefers-reduced-motion` preference

## User Workflows

### Returning to Home Page

**Goal**: Navigate back to the home page from any tool or feature page

**Steps**:

1. User is on any page other than the home page (e.g., `/calculator`, `/sms-messenger`)
2. User sees the home button (🏠) in the bottom-right corner
3. User clicks or taps the home button
4. User is navigated to the home page (`/`)

**Result**: User returns to the home page and the home button disappears

### Keyboard Navigation

**Goal**: Navigate to home page using keyboard

**Steps**:

1. User is on any page other than the home page
2. User tabs through page elements until the home button receives focus
3. User sees the focus outline around the button
4. User presses Enter or Space to activate the link
5. User is navigated to the home page

**Result**: User returns to the home page via keyboard navigation

## User Capabilities

-   Navigate back to home page from any page with a single click/tap
-   Access home navigation via keyboard
-   See clear visual feedback when interacting with the button
-   Experience smooth animations (unless reduced motion is preferred)

## Use Cases

### Quick Return from Tool Pages

After using a tool like the calculator or SMS messenger, users can quickly return to the home page to browse other tools without using the browser's back button.

### Consistent Navigation

Users always have access to home navigation regardless of which page they're on, providing a consistent navigation experience across the application.

### Mobile-Friendly Navigation

On mobile devices, the fixed-position button provides easy thumb-accessible navigation without requiring users to scroll to find a navigation menu.

## User Benefits

-   **Convenience**: One-click return to home from anywhere in the app
-   **Consistency**: Always available in the same location
-   **Accessibility**: Keyboard navigable with clear focus indicators
-   **Visual Clarity**: Simple emoji icon (🏠) is universally understood

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `FRONTEND.md`.

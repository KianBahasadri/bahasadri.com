# Component Documentation

This document catalogs all components in the application, their usage, props, and examples.

## Component Philosophy

### Server Components First

- **Default**: All components are Server Components
- **Client Components**: Only when interactivity is needed
- **Benefits**: Smaller bundles, better performance, direct data access

### Documentation Standards

Every component includes:
- Purpose and usage
- Props interface
- Examples
- Related components

## Core Components

### RootLayout

**Location**: `app/layout.tsx`

**Type**: Server Component

**Purpose**: Root layout that wraps all pages. Provides HTML structure, metadata, and global styles.

**Props**: None (uses Next.js layout pattern)

**Features**:
- HTML document structure
- Metadata configuration
- Global styles import
- Children rendering

**Usage**:
```tsx
// Automatically used by Next.js
// No manual import needed
```

**Related**:
- `app/globals.css` - Global styles
- `app/page.tsx` - Home page

---

### HomePage

**Location**: `app/page.tsx`

**Type**: Server Component

**Purpose**: Main landing page of the website. Displays welcome message, features, and getting started information.

**Props**: None

**Features**:
- Hero section with title
- Feature cards grid
- Getting started section
- Architecture information

**Usage**:
```tsx
// Automatically rendered at root route (/)
// No manual import needed
```

**Components Used**:
- `FeatureCard` - Internal component for feature display

**Styles**: `app/page.module.css`

**Related**:
- `app/layout.tsx` - Root layout
- `app/page.module.css` - Component styles

---

### FeatureCard

**Location**: `app/page.tsx` (internal component)

**Type**: Server Component

**Purpose**: Displays a single feature with title and description. Used in the features grid on the home page.

**Props**:
```typescript
interface FeatureCardProps {
  title: string;        // Feature title
  description: string;  // Feature description
}
```

**Usage**:
```tsx
<FeatureCard
  title="Next.js 15"
  description="Latest React framework with App Router"
/>
```

**Styles**: Uses classes from `app/page.module.css`

---

## Styling Components

### CSS Modules

All components use CSS Modules for scoped styling:

- **Naming**: `ComponentName.module.css`
- **Import**: `import styles from './ComponentName.module.css'`
- **Usage**: `className={styles.className}`

### Global Styles

**Location**: `app/globals.css`

**Purpose**: Application-wide styles including:
- CSS reset
- Base typography
- Global variables
- Utility classes

**Usage**: Automatically imported in `app/layout.tsx`

---

## Component Patterns

### Server Component Pattern

```tsx
/**
 * Component Description
 * 
 * This is a Server Component that runs on the server/edge.
 * It can fetch data directly and doesn't send JavaScript to the client.
 */
export default function ComponentName() {
  // Server-side logic
  const data = await fetchData();
  
  return (
    <div>
      {/* Render data */}
    </div>
  );
}
```

### Client Component Pattern

```tsx
'use client';

/**
 * Component Description
 * 
 * This is a Client Component that runs in the browser.
 * Use only when interactivity is needed.
 */
import { useState } from 'react';

export default function InteractiveComponent() {
  const [state, setState] = useState(0);
  
  return (
    <button onClick={() => setState(s => s + 1)}>
      Count: {state}
    </button>
  );
}
```

### Component with Props

```tsx
/**
 * Component Props Interface
 */
interface ComponentProps {
  title: string;
  description?: string;  // Optional prop
  onClick?: () => void;
}

/**
 * Component Description
 */
export default function Component({ 
  title, 
  description, 
  onClick 
}: ComponentProps) {
  return (
    <div onClick={onClick}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
```

### Component with Children

```tsx
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
```

---

## Creating New Components

### Step-by-Step Guide

1. **Create Component File**
   ```
   app/components/ComponentName/ComponentName.tsx
   ```

2. **Create Styles File**
   ```
   app/components/ComponentName/ComponentName.module.css
   ```

3. **Write Documentation**
   ```tsx
   /**
    * ComponentName Component
    * 
    * Purpose and description
    * 
    * @param props - Component props
    */
   ```

4. **Define Props Interface**
   ```tsx
   interface ComponentNameProps {
     // Props definition
   }
   ```

5. **Implement Component**
   ```tsx
   export default function ComponentName(props: ComponentNameProps) {
     // Implementation
   }
   ```

6. **Add Styles**
   ```css
   /* ComponentName.module.css */
   .container {
     /* Styles */
   }
   ```

7. **Export from Index** (optional)
   ```tsx
   // app/components/index.ts
   export { default as ComponentName } from './ComponentName/ComponentName';
   ```

### Component Checklist

- [ ] Component is documented
- [ ] Props are typed with TypeScript
- [ ] Styles are scoped with CSS Modules
- [ ] Component is tested (if applicable)
- [ ] Component follows naming conventions
- [ ] Component is Server Component unless interactivity needed

---

## Component Organization

### Directory Structure

```
app/
├── components/           # Shared components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   └── index.ts
│   └── Card/
│       ├── Card.tsx
│       └── Card.module.css
├── layout.tsx          # Root layout
└── page.tsx            # Pages (can have local components)
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: Match component name
- **Directories**: Match component name
- **CSS Modules**: `ComponentName.module.css`
- **Exports**: Named or default based on usage

---

## Best Practices

### Component Design

1. **Single Responsibility**
   - Each component should do one thing well
   - Split complex components into smaller ones

2. **Reusability**
   - Design components to be reusable
   - Accept props for customization
   - Provide sensible defaults

3. **Composition**
   - Compose complex UIs from simple components
   - Use children prop for flexibility

4. **Performance**
   - Prefer Server Components
   - Minimize Client Components
   - Use React.memo when appropriate (Client Components)

### Props Design

1. **Type Safety**
   - Always define TypeScript interfaces
   - Use optional props (`?`) when appropriate
   - Provide default values when possible

2. **Naming**
   - Use descriptive names
   - Follow React conventions (onClick, className, etc.)
   - Avoid abbreviations

3. **Documentation**
   - Document all props
   - Include examples
   - Note any special behaviors

### Styling

1. **Scoped Styles**
   - Use CSS Modules for component styles
   - Avoid global styles for components
   - Use CSS variables for theming

2. **Responsive Design**
   - Mobile-first approach
   - Test on multiple screen sizes
   - Use flexible units (rem, %, vw/vh)

3. **Accessibility**
   - Semantic HTML
   - ARIA attributes when needed
   - Keyboard navigation support

---

## Component Examples

### Button Component

```tsx
/**
 * Button Component
 * 
 * A reusable button component with variants and sizes.
 */
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### Card Component

```tsx
/**
 * Card Component
 * 
 * A container component for displaying content in a card format.
 */
interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Card({ title, children, footer }: CardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.content}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
```

---

## Resources

- [Next.js Components](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [React Components](https://react.dev/learn/your-first-component)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [TypeScript with React](https://react-typescript-cheatsheet.netlify.app/)

---

**Last Updated**: 2025-01-27


# Index Page Documentation

## Overview

The `index.html` file is the main landing page for BahasaDri.com. It serves as the entry point for visitors and provides an overview of the site's purpose and features.

## Page Structure

### Header Section
- **Location**: Top of page
- **Purpose**: Site navigation and branding
- **Components**: Logo, navigation menu, mobile menu toggle
- **Accessibility**: Semantic `<header>` and `<nav>` elements with ARIA labels

### Hero Section
- **Location**: Below header
- **Purpose**: Primary message and call-to-action
- **Components**: Heading, description, CTA button
- **Design**: Full-width section with centered content

### Features Section
- **Location**: Below hero
- **Purpose**: Highlight key features or benefits
- **Components**: Section heading, feature cards grid
- **Layout**: Responsive grid (stacks on mobile, grid on desktop)

### Footer Section
- **Location**: Bottom of page
- **Purpose**: Footer navigation and copyright information
- **Components**: Footer links, copyright notice

## Content Guidelines

### Hero Section Content
- **Heading**: Should be clear, compelling, and include primary keywords
- **Description**: Explain value proposition in 1-2 sentences
- **CTA Button**: Clear action-oriented text

### Feature Cards
- **Title**: Short, descriptive (3-5 words)
- **Description**: 1-2 sentences explaining the benefit
- **Icon**: Visual element to support the message

## Responsive Behavior

### Mobile (< 768px)
- Navigation menu collapses into hamburger menu
- Hero section uses full width with adjusted padding
- Feature cards stack vertically
- Font sizes adjusted for readability

### Tablet (768px - 1024px)
- Navigation menu may remain visible or use hamburger
- Feature cards display in 2 columns
- Adjusted spacing and typography

### Desktop (> 1024px)
- Full navigation menu visible
- Feature cards display in 3 columns
- Maximum content width for optimal readability

## Accessibility Features

1. **Semantic HTML**: Proper use of `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
2. **ARIA Labels**: Navigation landmarks and button labels
3. **Heading Hierarchy**: Single h1, followed by h2, h3 as needed
4. **Alt Text**: All images have descriptive alt text
5. **Keyboard Navigation**: All interactive elements are keyboard accessible
6. **Screen Reader Support**: Hidden text for screen readers where needed

## Performance Considerations

1. **Critical CSS**: Inline critical styles for above-the-fold content
2. **Lazy Loading**: Images below the fold use lazy loading
3. **Minimal JavaScript**: Only essential scripts inline, rest in external files
4. **Optimized Assets**: Images and other assets optimized for web

## Related Files

- `/assets/css/main.css`: Main stylesheet (when created)
- `/assets/js/main.js`: Main JavaScript file (when created)
- `DEVELOPMENT.md`: Development guidelines
- `ARCHITECTURE.md`: Architecture documentation

## Update History

- 2024-01-XX: Initial page creation with comprehensive documentation


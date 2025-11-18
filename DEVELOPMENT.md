# Development Guidelines

This document outlines the development practices, coding standards, and documentation requirements for BahasaDri.com.

## Documentation Requirements

### File-Level Documentation

Every file must begin with a header comment block that includes:

```html
<!--
  File: filename.ext
  Purpose: Brief description of what this file does
  Author: [Author name]
  Last Updated: [Date]
  Related Docs: [Links to related documentation]
-->
```

### Code Documentation Standards

#### HTML Files

- **Section Comments**: Use HTML comments to clearly mark major sections
- **Component Documentation**: Document each major component/block
- **Accessibility Notes**: Document ARIA attributes and accessibility considerations
- **Responsive Design Notes**: Document breakpoints and responsive behavior

Example:
```html
<!-- 
  ============================================
  HEADER SECTION
  ============================================
  Purpose: Main site navigation and branding
  Accessibility: Uses semantic <nav> with ARIA labels
  Responsive: Mobile menu collapses at 768px breakpoint
-->
<header>
  <!-- Navigation component -->
  <nav aria-label="Main navigation">
    <!-- ... -->
  </nav>
</header>
```

#### CSS Files

- **Section Headers**: Use comment blocks to organize styles
- **Component Styles**: Group styles by component
- **Responsive Breakpoints**: Document all media queries
- **Design Decisions**: Explain why certain styles are used

Example:
```css
/* ============================================
   HEADER STYLES
   ============================================
   Purpose: Styles for the main site header
   Breakpoints: 
     - Mobile: < 768px
     - Tablet: 768px - 1024px
     - Desktop: > 1024px
*/

/* Header Container
   - Uses flexbox for layout
   - Fixed height for consistent spacing
   - Background color: #ffffff
*/
.header {
  display: flex;
  height: 80px;
  background-color: #ffffff;
}
```

#### JavaScript Files

- **Function Documentation**: JSDoc-style comments for all functions
- **Variable Documentation**: Explain complex variables
- **Algorithm Explanations**: Document complex logic
- **Event Handlers**: Document what events are handled and why

Example:
```javascript
/**
 * Handles form submission for contact form
 * 
 * @param {Event} event - The form submit event
 * @returns {Promise<void>}
 * 
 * Process:
 * 1. Prevents default form submission
 * 2. Validates form data
 * 3. Sends data to API endpoint
 * 4. Displays success/error message
 */
async function handleFormSubmit(event) {
  // Implementation
}
```

## Code Organization

### File Naming Conventions

- **HTML Files**: `kebab-case.html` (e.g., `about-us.html`, `contact.html`)
- **CSS Files**: `kebab-case.css` (e.g., `main.css`, `header.css`)
- **JavaScript Files**: `kebab-case.js` (e.g., `main.js`, `form-handler.js`)
- **Image Files**: `kebab-case.ext` (e.g., `hero-image.jpg`, `logo.svg`)

### Directory Structure

- Keep related files together
- Use descriptive directory names
- Separate concerns (HTML, CSS, JS, assets)

### HTML Structure

1. **Document Type and Meta**: Always include proper DOCTYPE and meta tags
2. **Semantic HTML**: Use semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
3. **Accessibility**: Include ARIA labels, alt text, and proper heading hierarchy
4. **Comments**: Use HTML comments to mark major sections

### CSS Organization

1. **Reset/Normalize**: Start with CSS reset or normalize
2. **Variables**: Define CSS custom properties at the top
3. **Base Styles**: Typography, colors, general styles
4. **Layout**: Grid, flexbox, positioning
5. **Components**: Individual component styles
6. **Utilities**: Helper classes
7. **Responsive**: Media queries at the end

### JavaScript Organization

1. **Imports/Dependencies**: At the top
2. **Constants**: Configuration and constants
3. **Utility Functions**: Helper functions
4. **Event Handlers**: Event listener setup
5. **Initialization**: DOMContentLoaded and initialization code

## Best Practices

### Performance

- Minimize HTTP requests
- Optimize images (use appropriate formats, compression)
- Minify CSS and JavaScript for production
- Use lazy loading for images below the fold

### Accessibility

- Use semantic HTML
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain proper heading hierarchy (h1 → h2 → h3)
- Use ARIA labels where appropriate
- Ensure sufficient color contrast

### Browser Compatibility

- Test in major browsers (Chrome, Firefox, Safari, Edge)
- Use progressive enhancement
- Document any browser-specific workarounds

### Responsive Design

- Mobile-first approach
- Document all breakpoints
- Test on various screen sizes
- Use relative units (rem, em, %) where appropriate

## Git Workflow

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add contact form with validation
docs: Update development guidelines
fix: Resolve mobile menu toggle issue
style: Update header spacing
refactor: Reorganize CSS structure
```

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

## Testing Checklist

Before committing, ensure:

- [ ] Code follows documentation standards
- [ ] All comments are accurate and helpful
- [ ] HTML validates (W3C validator)
- [ ] CSS validates
- [ ] JavaScript has no console errors
- [ ] Responsive design works on multiple screen sizes
- [ ] Accessibility standards are met
- [ ] Performance is acceptable
- [ ] Cross-browser compatibility is verified

## Related Documentation

- `ARCHITECTURE.md`: System architecture and design decisions
- `docs/`: Additional detailed documentation


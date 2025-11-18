# Architecture Documentation

This document describes the system architecture, design decisions, and technical structure of BahasaDri.com.

## Technology Stack

### Core Technologies

- **HTML5**: Semantic markup for content structure
- **CSS3**: Styling with modern features (Grid, Flexbox, Custom Properties)
- **JavaScript (ES6+)**: Modern JavaScript for interactivity
- **Cloudflare Pages**: Hosting and deployment platform

### Design Philosophy

1. **Progressive Enhancement**: Start with basic HTML, enhance with CSS and JavaScript
2. **Mobile-First**: Design for mobile devices first, then enhance for larger screens
3. **Semantic HTML**: Use appropriate HTML elements for meaning and accessibility
4. **Performance**: Optimize for fast loading and smooth interactions
5. **Documentation**: Every decision and implementation should be documented

## Project Structure

### Directory Organization

```
bahasadri.com/
├── Root Files
│   ├── index.html           # Landing page
│   ├── README.md            # Project overview
│   ├── DEVELOPMENT.md      # Development guidelines
│   └── ARCHITECTURE.md     # This file
│
├── pages/                   # Additional HTML pages
│   ├── about.html
│   ├── contact.html
│   └── [other-pages].html
│
├── assets/                  # Static assets
│   ├── css/
│   │   ├── main.css        # Main stylesheet
│   │   ├── components/     # Component-specific styles
│   │   └── utilities/      # Utility classes
│   │
│   ├── js/
│   │   ├── main.js         # Main JavaScript file
│   │   ├── components/     # Component-specific scripts
│   │   └── utils/          # Utility functions
│   │
│   └── images/             # Image assets
│       ├── logos/
│       ├── icons/
│       └── photos/
│
└── docs/                    # Documentation
    ├── pages/              # Page-specific documentation
    ├── components/         # Component documentation
    └── deployment/         # Deployment documentation
```

## Design System

### Color Palette

Document all colors used in the project:

```css
:root {
  /* Primary Colors */
  --color-primary: #000000;
  --color-primary-light: #333333;
  --color-primary-dark: #000000;
  
  /* Secondary Colors */
  --color-secondary: #ffffff;
  
  /* Accent Colors */
  --color-accent: #0066cc;
  
  /* Text Colors */
  --color-text: #333333;
  --color-text-light: #666666;
  --color-text-inverse: #ffffff;
  
  /* Background Colors */
  --color-bg: #ffffff;
  --color-bg-alt: #f5f5f5;
  
  /* Status Colors */
  --color-success: #28a745;
  --color-error: #dc3545;
  --color-warning: #ffc107;
}
```

### Typography

Document typography scale and font choices:

- **Font Family**: [To be defined]
- **Font Sizes**: Use rem units for scalability
- **Line Heights**: Maintain readable line spacing
- **Font Weights**: Document available weights

### Spacing System

Use consistent spacing scale:

```css
:root {
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */
}
```

### Breakpoints

Document all responsive breakpoints:

```css
/* Mobile First Breakpoints */
--breakpoint-sm: 576px;   /* Small devices (landscape phones) */
--breakpoint-md: 768px;   /* Medium devices (tablets) */
--breakpoint-lg: 992px;   /* Large devices (desktops) */
--breakpoint-xl: 1200px;  /* Extra large devices */
--breakpoint-2xl: 1400px; /* 2X large devices */
```

## Component Architecture

### HTML Components

Each major section should be treated as a component:

1. **Header**: Site navigation and branding
2. **Hero**: Landing section with primary CTA
3. **Content Sections**: Main content areas
4. **Footer**: Site footer with links and information

### CSS Architecture

Follow BEM (Block Element Modifier) methodology or similar:

```css
/* Block */
.header { }

/* Element */
.header__logo { }
.header__nav { }

/* Modifier */
.header--sticky { }
```

### JavaScript Architecture

- **Modular**: Separate concerns into modules
- **Event-Driven**: Use event listeners for interactivity
- **Progressive Enhancement**: JavaScript enhances, doesn't replace HTML/CSS

## Deployment Architecture

### Cloudflare Pages

- **Build Command**: [If needed]
- **Build Output Directory**: `/` (root)
- **Environment Variables**: Document any required variables
- **Custom Domains**: Document domain configuration

### Build Process

1. **Development**: Direct HTML/CSS/JS editing
2. **Testing**: Local testing before commit
3. **Deployment**: Automatic via Cloudflare Pages on git push

## Performance Considerations

### Optimization Strategies

1. **Image Optimization**: Use appropriate formats (WebP, AVIF), lazy loading
2. **CSS Optimization**: Minimize unused CSS, use critical CSS
3. **JavaScript Optimization**: Minimize and defer non-critical scripts
4. **Caching**: Leverage Cloudflare's CDN and caching

### Performance Targets

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1

## Security Considerations

1. **HTTPS**: Always use HTTPS (enforced by Cloudflare)
2. **Content Security Policy**: Implement CSP headers
3. **Input Validation**: Validate all user inputs
4. **XSS Prevention**: Sanitize user-generated content

## Accessibility Standards

Target WCAG 2.1 Level AA compliance:

1. **Semantic HTML**: Use proper HTML elements
2. **ARIA Labels**: Where semantic HTML isn't sufficient
3. **Keyboard Navigation**: All functionality accessible via keyboard
4. **Screen Reader Support**: Proper labeling and structure
5. **Color Contrast**: Minimum 4.5:1 for normal text

## Browser Support

### Supported Browsers

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

### Polyfills

Document any required polyfills for older browser support.

## Future Considerations

### Potential Enhancements

- [ ] Build system (if needed)
- [ ] CSS preprocessor (if needed)
- [ ] JavaScript framework (if needed)
- [ ] Content Management System integration
- [ ] Analytics integration
- [ ] SEO optimization tools

## Related Documentation

- `DEVELOPMENT.md`: Development practices and coding standards
- `README.md`: Project overview and getting started
- `docs/`: Additional detailed documentation


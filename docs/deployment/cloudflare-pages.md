# Cloudflare Pages Deployment Documentation

## Overview

This project is configured for automatic deployment on Cloudflare Pages. When code is pushed to the main branch, Cloudflare Pages automatically builds and deploys the site.

## Configuration

### Build Settings

Since this is a static HTML site, Cloudflare Pages requires minimal configuration:

- **Build Command**: (Not required for static HTML)
- **Build Output Directory**: `/` (root directory)
- **Root Directory**: `/` (root)

### Environment Variables

Currently, no environment variables are required. If needed in the future, they can be configured in the Cloudflare Pages dashboard under:
Settings → Environment Variables

## Deployment Process

### Automatic Deployment

1. **Push to Main Branch**: Code pushed to the `main` branch triggers automatic deployment
2. **Build Process**: Cloudflare Pages detects changes and starts build
3. **Deployment**: Built site is deployed to Cloudflare's CDN
4. **Preview URLs**: Each deployment gets a unique preview URL

### Manual Deployment

If needed, deployments can be triggered manually from the Cloudflare Pages dashboard.

## Custom Domain Setup

### Adding a Custom Domain

1. Go to Cloudflare Pages dashboard
2. Select your project
3. Navigate to Custom domains
4. Add your domain (e.g., `bahasadri.com`)
5. Follow DNS configuration instructions

### DNS Configuration

Cloudflare will provide DNS records to add:
- **CNAME**: Point your domain to the Cloudflare Pages domain
- **A Record**: Alternative method (if CNAME not supported)

## Performance Features

### CDN Distribution

- **Global CDN**: Content served from edge locations worldwide
- **Automatic Caching**: Static assets cached at the edge
- **Fast TTL**: Optimized cache headers for performance

### Optimization

- **Automatic Minification**: CSS and JavaScript minified automatically
- **Image Optimization**: Images optimized through Cloudflare's image optimization
- **Brotli Compression**: Automatic compression for faster delivery

## Monitoring and Analytics

### Deployment Status

Monitor deployment status in the Cloudflare Pages dashboard:
- Build logs
- Deployment history
- Preview URLs

### Analytics

Consider integrating:
- Cloudflare Web Analytics (free)
- Google Analytics (if needed)
- Custom analytics solution

## Troubleshooting

### Common Issues

1. **Build Failures**: Check build logs in dashboard
2. **404 Errors**: Verify file paths and routing
3. **Cache Issues**: Use cache purge in Cloudflare dashboard

### Cache Purging

If updates aren't appearing:
1. Go to Cloudflare dashboard
2. Select your domain
3. Navigate to Caching → Configuration
4. Click "Purge Everything" or purge specific files

## Related Documentation

- `ARCHITECTURE.md`: System architecture
- `README.md`: Project overview


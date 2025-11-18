# Deployment Guide

This document describes the deployment process for Bahasadri.com to Cloudflare Workers.

## Overview

The application is automatically deployed to Cloudflare Workers using the OpenNext Cloudflare adapter. This enables Next.js features to work seamlessly on Cloudflare's edge network.

## Prerequisites

1. **Cloudflare Account**
   - Sign up at [cloudflare.com](https://cloudflare.com)
   - Verify your email address

2. **Wrangler CLI**
   - Installed via `pnpm install` (as devDependency)
   - Authenticated with Cloudflare

3. **Cloudflare API Token** (for CI/CD)
   - Create at [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Needs: Account, Zone, and Worker permissions

## Authentication

### First-Time Setup

1. **Login to Cloudflare**
   ```bash
   pnpm wrangler login
   ```
   - Opens browser for authentication
   - Grants Wrangler access to your account

2. **Verify Authentication**
   ```bash
   pnpm wrangler whoami
   ```
   - Should display your Cloudflare account email

## Deployment Process

### Manual Deployment

1. **Build and Deploy**
   ```bash
   pnpm deploy
   ```
   
   This command:
   - Builds the Next.js application (`next build`)
   - Transforms it for Cloudflare (`opennextjs-cloudflare build`)
   - Deploys to Cloudflare Workers (`opennextjs-cloudflare deploy`)

2. **Verify Deployment**
   - Check Cloudflare Dashboard
   - Visit your `*.workers.dev` URL
   - Test all routes and features

### Deployment Steps Breakdown

The `pnpm deploy` command runs:

```bash
# Step 1: Build Next.js application
next build

# Step 2: Transform for Cloudflare
opennextjs-cloudflare build
# Creates:
# - .open-next/worker.js (Worker script)
# - .open-next/assets/ (Static assets)

# Step 3: Deploy to Cloudflare
opennextjs-cloudflare deploy
# Uses wrangler to:
# - Upload Worker script
# - Upload static assets
# - Configure routes
```

## Configuration

### Wrangler Configuration

Edit `wrangler.toml` to configure:

```toml
# Worker name (must be unique across Cloudflare)
name = "bahasadri-com"

# Compatibility settings
compatibility_date = "2025-03-25"
compatibility_flags = ["nodejs_compat"]

# Asset configuration
[assets]
directory = ".open-next/assets"
binding = "ASSETS"

# Environment variables (optional)
[vars]
NODE_ENV = "production"

# Custom domain (optional)
# routes = [
#   { pattern = "bahasadri.com/*", zone_name = "bahasadri.com" }
# ]

# KV Namespace (optional)
# [[kv_namespaces]]
# binding = "MY_KV"
# id = "your-kv-namespace-id"

# R2 Bucket (optional)
# [[r2_buckets]]
# binding = "MY_BUCKET"
# bucket_name = "my-bucket"
```

### Environment Variables

#### Local Development

Create `.env.local`:

```env
NODE_ENV=development
API_URL=http://localhost:3000
```

#### Production

Set in Cloudflare Dashboard or `wrangler.toml`:

```toml
[vars]
NODE_ENV = "production"
API_URL = "https://api.example.com"
```

#### Secrets

For sensitive values, use Wrangler secrets:

```bash
pnpm wrangler secret put SECRET_NAME
# Enter value when prompted
```

Access in code:

```typescript
// In route handlers or server components
const secret = process.env.SECRET_NAME;
```

## Custom Domains

### Adding a Custom Domain

1. **Add Domain in Cloudflare Dashboard**
   - Go to Workers & Pages
   - Select your worker
   - Add custom domain

2. **Update DNS Records**
   - Add CNAME record pointing to your worker
   - Or use Cloudflare's automatic setup

3. **Update wrangler.toml** (optional)
   ```toml
   routes = [
     { pattern = "bahasadri.com/*", zone_name = "bahasadri.com" },
     { pattern = "www.bahasadri.com/*", zone_name = "bahasadri.com" }
   ]
   ```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'pnpm'
      
      - run: pnpm install
      
      - run: pnpm deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Environment Secrets

Add to GitHub Secrets:
- `CLOUDFLARE_API_TOKEN` - API token with Worker permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Other CI/CD Platforms

Similar setup for:
- GitLab CI
- CircleCI
- Jenkins
- Any platform that supports Node.js

## Preview Deployments

### Local Preview

```bash
pnpm preview
```

Runs the application in Cloudflare Workers runtime locally for testing.

### Staging Environment

Create a separate worker for staging:

```toml
# wrangler.staging.toml
name = "bahasadri-com-staging"
# ... other config
```

Deploy with:

```bash
pnpm wrangler deploy --config wrangler.staging.toml
```

## Monitoring

### Cloudflare Dashboard

Monitor:
- Request metrics
- Error rates
- Response times
- Geographic distribution
- Bandwidth usage

### Real-Time Logs

```bash
pnpm wrangler tail
```

Streams real-time logs from your worker.

### Analytics

Enable Analytics in Cloudflare Dashboard:
- Workers Analytics
- Web Analytics (for custom domains)

## Troubleshooting

### Build Failures

1. **Check Node.js version**
   ```bash
   node --version  # Should be 18+
   ```

2. **Clear build cache**
   ```bash
   rm -rf .next .open-next
   pnpm deploy
   ```

3. **Check dependencies**
   ```bash
   pnpm install
   ```

### Deployment Failures

1. **Verify authentication**
   ```bash
   pnpm wrangler whoami
   ```

2. **Check worker name uniqueness**
   - Worker names must be unique
   - Try a different name in `wrangler.toml`

3. **Verify compatibility flags**
   - Ensure `nodejs_compat` is set
   - Check compatibility date

### Runtime Errors

1. **Check logs**
   ```bash
   pnpm wrangler tail
   ```

2. **Test locally**
   ```bash
   pnpm preview
   ```

3. **Verify environment variables**
   - Check Cloudflare Dashboard
   - Verify secrets are set

## Performance Optimization

### Asset Optimization

- Images: Use Next.js Image component
- Fonts: Use Next.js font optimization
- Scripts: Automatic code splitting

### Caching

Configure in `open-next.config.ts`:

```typescript
export default defineCloudflareConfig({
  // Configure caching strategies
  // See: https://opennext.js.org/cloudflare/caching
});
```

### Edge Caching

Cloudflare automatically caches:
- Static assets (long-term)
- HTML pages (based on headers)
- API responses (configurable)

## Rollback

### Previous Versions

1. **List deployments**
   ```bash
   pnpm wrangler deployments list
   ```

2. **Rollback to previous version**
   ```bash
   pnpm wrangler rollback [deployment-id]
   ```

### Git-Based Rollback

1. Revert to previous commit
2. Redeploy:
   ```bash
   pnpm deploy
   ```

## Best Practices

1. **Test before deploying**
   - Run `pnpm preview` locally
   - Test all routes and features

2. **Use staging environment**
   - Test changes in staging first
   - Deploy to production after verification

3. **Monitor deployments**
   - Watch logs after deployment
   - Check error rates
   - Verify functionality

4. **Version control**
   - Commit all changes
   - Tag releases
   - Document deployments

5. **Environment management**
   - Use different workers for dev/staging/prod
   - Manage secrets securely
   - Document environment variables

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)

---

**Last Updated**: 2025-01-27


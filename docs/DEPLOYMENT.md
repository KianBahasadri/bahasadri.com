# Deployment Guide

This document describes the deployment process for Bahasadri.com to Cloudflare Workers.

## Overview

Deployments are executed manually from the CLI using the OpenNext Cloudflare adapter. There is no active CI/CD automation—every release is triggered intentionally by running the deploy command locally. This still enables Next.js features to work seamlessly on Cloudflare's edge network.

## Prerequisites

1. **Cloudflare Account**

    - Sign up at [cloudflare.com](https://cloudflare.com)
    - Verify your email address

2. **Wrangler CLI**

    - Installed via `pnpm install` (as devDependency)
    - Authenticated with Cloudflare

3. **Cloudflare API Token** (optional, only if automation returns later)
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
    pnpm run deploy
    ```

    Use the `run` form—pnpm reserves `pnpm deploy` for workspaces, so it exits early in this single-package repo.

    > Ensure your root `.env` file includes `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`. The deployment helper loads `.env` before syncing the Twilio webhook, so missing values will stop the deploy with a clear error.

    This command:

    - Builds the Next.js application (`next build`)
    - Transforms it for Cloudflare (`opennextjs-cloudflare build`)
    - Deploys to Cloudflare Workers (`opennextjs-cloudflare deploy`)

2. **Verify Deployment**
    - Check Cloudflare Dashboard
    - Visit your `*.workers.dev` URL
    - Test all routes and features

### Deployment Steps Breakdown

The `pnpm run deploy` script runs:

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

Create `.env`:

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

Or let the automation handle it:

```bash
pnpm sync:cloudflare-secrets -- --env production
```

-   The script mirrors values from the root `.env` file to Cloudflare via stdin so nothing leaks into logs.
-   Pass `-- --dry-run` to preview changes or omit `--env` to update the default Worker bindings.
-   `pnpm deploy` runs the sync script automatically before building, ensuring each deployment picks up the latest secrets.

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

## Deployment Policy

-   All production deployments run manually via `pnpm deploy`.
-   Only trusted operators with Cloudflare access may trigger releases.
-   If automation ever returns, document the entire workflow here before enabling it.

## Preview Deployments

### Local Preview

```bash
pnpm preview
```

Runs the application in Cloudflare Workers runtime locally for testing.

**Known warnings (last verified 2025-11-20):**

-   During the `opennextjs-cloudflare preview` phase, esbuild may emit duplicate-member warnings for `getElementsByTagName` / `getElementsByTagNameNS` inside `.open-next/server-functions/default/handler.mjs`. These are generated inside OpenNext’s DOM shim, not our source. Upgrade `@opennextjs/cloudflare`/Wrangler if upstream patches them; otherwise they are safe to ignore unless the preview build fails.
-   Wrangler keeps the preview server running indefinitely. When integrating with automated scripts, wrap the command (e.g., `timeout 45 pnpm preview`) or stop it manually with `Ctrl+C` once the local server is verified.

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

-   Request metrics
-   Error rates
-   Response times
-   Geographic distribution
-   Bandwidth usage

### Real-Time Logs

```bash
pnpm wrangler tail
```

Streams real-time logs from your worker.

### Analytics

Enable Analytics in Cloudflare Dashboard:

-   Workers Analytics
-   Web Analytics (for custom domains)

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

-   Images: Use Next.js Image component
-   Fonts: Use Next.js font optimization
-   Scripts: Automatic code splitting

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

-   Static assets (long-term)
-   HTML pages (based on headers)
-   API responses (configurable)

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

-   [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
-   [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
-   [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
-   [Cloudflare Dashboard](https://dash.cloudflare.com/)

---

**Last Updated**: 2025-11-20

/**
 * OpenNext Cloudflare Configuration
 * 
 * This file configures the OpenNext adapter for Cloudflare Workers.
 * The adapter enables Next.js features like SSR, ISR, and Server Components
 * to work seamlessly on Cloudflare's edge network.
 * 
 * Performance optimizations:
 * - Caching strategies for static assets
 * - Edge caching configuration
 * - Compression handled automatically by Cloudflare
 * 
 * For detailed configuration options, see:
 * https://opennext.js.org/cloudflare/caching
 */

import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Caching strategies for optimal performance
  // Cloudflare automatically handles compression (gzip, brotli)
  // Static assets are cached at the edge for fast delivery
  
  // You can configure additional caching strategies here
  // See the adapter documentation for more options
});


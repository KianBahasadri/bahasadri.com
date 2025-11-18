/**
 * OpenNext Cloudflare Configuration
 * 
 * This file configures the OpenNext adapter for Cloudflare Workers.
 * The adapter enables Next.js features like SSR, ISR, and Server Components
 * to work seamlessly on Cloudflare's edge network.
 * 
 * For detailed configuration options, see:
 * https://opennext.js.org/cloudflare/caching
 */

import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // You can configure caching strategies here
  // See the adapter documentation for more options
});


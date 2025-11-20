import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
    void initOpenNextCloudflareForDev();
}

/**
 * Next.js Configuration
 *
 * This file configures Next.js behavior for development and production.
 * When deployed to Cloudflare Workers, the OpenNext adapter handles
 * the transformation of Next.js features to work on the edge.
 */

const nextConfig: NextConfig = {
    // Enable React strict mode for better development experience
    reactStrictMode: true,

    // Optimize images using Cloudflare Images
    images: {
        // Configure image optimization domains if needed
        remotePatterns: [],
    },

    // Output configuration - not needed for Cloudflare Workers
    // The adapter handles this automatically
};

export default nextConfig;

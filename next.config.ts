import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * 
 * This file configures Next.js behavior for development and production.
 * When deployed to Cloudflare Workers, the OpenNext adapter handles
 * the transformation of Next.js features to work on the edge.
 * 
 * Performance optimizations:
 * - Compressed output for smaller bundle sizes
 * - Optimized production builds
 * - Experimental features for better performance
 */

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize images using Cloudflare Images
  images: {
    // Configure image optimization domains if needed
    remotePatterns: [],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Disable image optimization in development for faster builds
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for performance
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ['react', 'react-dom'],
  },

  // Production optimizations
  swcMinify: true, // Use SWC for minification (faster than Terser)

  // Compression
  compress: true,

  // Power optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security and performance

  // Output configuration - not needed for Cloudflare Workers
  // The adapter handles this automatically
};

export default nextConfig;


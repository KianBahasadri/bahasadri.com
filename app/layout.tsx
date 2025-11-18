/**
 * Root Layout Component
 *
 * This is the root layout for the entire application. It wraps all pages
 * and provides shared HTML structure, metadata, and global styles.
 *
 * In Next.js App Router, the layout.tsx file defines the shared UI
 * that persists across route changes. This includes:
 * - HTML document structure (<html>, <body>)
 * - Global metadata
 * - Shared components (headers, footers, navigation)
 * - Global styles and fonts
 *
 * @see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
 * @see [docs/COMPONENTS.md](../docs/COMPONENTS.md) - Component patterns
 * @see [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md) - Development guidelines
 * @see [docs/AI_AGENT_STANDARDS.md](../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 */

import type { Metadata } from "next";
import "./globals.css";

/**
 * Metadata for the application
 * This is used for SEO, social sharing, and browser display
 */
export const metadata: Metadata = {
    title: {
        default: "Bahasadri.com",
        template: "%s | Bahasadri.com",
    },
    description:
        "A modern website built with Next.js and deployed on Cloudflare Workers",
    keywords: ["Next.js", "Cloudflare", "React", "TypeScript"],
    authors: [{ name: "Bahasadri" }],
    creator: "Bahasadri",
    openGraph: {
        type: "website",
        locale: "en_US",
        siteName: "Bahasadri.com",
    },
    twitter: {
        card: "summary_large_image",
        creator: "@bahasadri",
    },
    robots: {
        index: true,
        follow: true,
    },
};

/**
 * Root Layout Component
 *
 * @param children - The child pages/components to render
 * @returns The root HTML structure with metadata
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {/* 
          Main application content
          All pages will be rendered as children of this layout
        */}
                {children}
            </body>
        </html>
    );
}

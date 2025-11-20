/**
 * Navigation Component
 *
 * Provides site-wide navigation with a header containing the site title
 * and navigation links. This is a Server Component that renders on the server.
 *
 * Features:
 * - Site branding/logo
 * - Navigation links (currently just home, can be extended)
 * - Responsive design
 * - Accessible navigation
 *
 * Type: Server Component
 *
 * @see [docs/COMPONENTS.md](../docs/COMPONENTS.md) - Component patterns
 * @see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
 * @see [docs/AI_AGENT_STANDARDS.md](../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 */

import Link from "next/link";
import styles from "./Navigation.module.css";

/**
 * Navigation Component
 *
 * Renders the site navigation header with branding and links.
 *
 * @returns React element representing the navigation header
 */
export default function Navigation() {
    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoText}>Bahasadri.com</span>
                    <span className={styles.logoSubtext}>
                        Refactoring my gender identity better than I refactor this codebase
                    </span>
                </Link>
                <div className={styles.links}>
                    <Link href="/" className={styles.link}>
                        Escape Pod
                    </Link>
                </div>
            </div>
        </nav>
    );
}

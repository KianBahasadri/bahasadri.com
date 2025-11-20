/**
 * Footer Component
 *
 * The site footer. Appears at the bottom of every page.
 * This code is held together by estrogen and spite. Do not touch.
 *
 * Type: Server Component
 *
 * @see [docs/COMPONENTS.md](../docs/COMPONENTS.md) - Component patterns
 * @see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
 * @see [docs/CONTENT_STYLE.md](../docs/CONTENT_STYLE.md) - Content style guidelines
 * @see [docs/AI_AGENT_STANDARDS.md](../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 */

import styles from "./Footer.module.css";

/**
 * Footer Component
 *
 * Renders the site footer with paranoid sysadmin energy.
 *
 * @returns React element representing the footer
 */
export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <p className={styles.text}>
                        This codebase is a monument to my executive dysfunction.{" "}
                        <span className={styles.muted}>
                            Every commit is a cry for help. Every merge conflict is a
                            reflection of my inner turmoil.
                        </span>
                    </p>
                    <p className={styles.meta}>
                        <span className={styles.year}>2025</span> •{" "}
                        <span className={styles.tech}>
                            Powered by Next.js, Cloudflare Workers, and questionable life choices
                        </span>{" "}
                        •{" "}
                        <span className={styles.status}>
                            Status: Still alive somehow. The lion ignores the sharp pain.
                        </span>
                    </p>
                    <p className={styles.disclaimer}>
                        This site is held together by estrogen, spite, and the desperate hope
                        that maybe this time I'll actually finish a project. Use at your own risk.
                        I'm not responsible for whatever breaks.
                    </p>
                </div>
            </div>
        </footer>
    );
}


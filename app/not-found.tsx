/**
 * 404 Not Found Page
 *
 * The page you're looking for doesn't exist.
 *
 * @see [docs/CONTENT_STYLE.md](../docs/CONTENT_STYLE.md) - Content style guidelines
 * @see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
 */

import Link from "next/link";
import styles from "./not-found.module.css";

/**
 * 404 Not Found Page Component
 *
 * Renders when a page doesn't exist. Hostile and sarcastic, as per content guidelines.
 *
 * @returns React element representing the 404 page
 */
export default function NotFound() {
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.code}>404</h1>
                <h2 className={styles.title}>
                    Where do you think you're going?
                </h2>
                <p className={styles.description}>
                    This URL leads nowhere. Did you really think typing random characters
                    would uncover my encrypted secrets? Or are you just incompetent?
                    The server is judging you right now. I am judging you right now.
                </p>
                <p className={styles.subtext}>
                    The file you wanted was probably intercepted by a man in a black van
                    parked outside my house. I told them I wasn't home. They didn't believe me.
                </p>
                <Link href="/" className={styles.link}>
                    Retreat to safety (Coward)
                </Link>
            </div>
        </main>
    );
}

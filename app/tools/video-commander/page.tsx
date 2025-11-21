/**
 * Video Commander Page
 *
 * Main page for the video conferencing utility. Allows users to create or join
 * video conference rooms using Cloudflare RealtimeKit.
 *
 * Type: Server Component (initial render)
 *
 * @see [PLAN.md](./PLAN.md) - Planning and documentation
 * @see [lib/types.ts](./lib/types.ts) - Type definitions
 * @see [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) - System architecture
 * @see [docs/DEVELOPMENT.md](../../../docs/DEVELOPMENT.md) - Development guidelines
 * @see [docs/AI_AGENT_STANDARDS.md](../../../docs/AI_AGENT_STANDARDS.md) - AI agent standards
 * @see [docs/CONTENT_STYLE.md](../../../docs/CONTENT_STYLE.md) - Content style guide
 */

import VideoRoom from "./components/VideoRoom/VideoRoom";
import styles from "./page.module.css";

/**
 * Video Commander Page Component
 *
 * Server Component that renders the initial page structure. The actual video
 * conferencing functionality is handled by the VideoRoom Client Component.
 *
 * @returns JSX element representing the video commander page
 */
export default function VideoCommanderPage() {
    return (
        <main className={styles.main}>
            <section className={styles.header}>
                <h1 className={styles.title}>Video Commander</h1>
                <p className={styles.description}>
                    Real-time video calls over Cloudflare's edge network. Low
                    latency, global coverage, no Zoom required. WebRTC at the
                    speed of the internet's gotta go fast.
                </p>
            </section>

            <section className={styles.content}>
                <VideoRoom />
            </section>
        </main>
    );
}

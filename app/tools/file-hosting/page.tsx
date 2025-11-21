/**
 * File Hosting Utility Page
 *
 * Server Component responsible for rendering the File Hosting interface.
 *
 * @see ./PLAN.md
 * @see ../../docs/ARCHITECTURE.md
 * @see ../../docs/UTILITIES.md
 * @see ../../docs/AI_AGENT_STANDARDS.md
 */

import UploadZone from "./components/UploadZone/UploadZone";
import FileList from "./components/FileList/FileList";
import { listRecentFiles } from "./lib/database";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function FileHostingPage() {
	const files = await listRecentFiles(50);

	return (
		<main className={styles.main}>
			<section className={styles.hero}>
				<h1 className={styles.title}>File Arsenal</h1>
				<p className={styles.tagline}>
					Upload files, let Cloudflare babysit them, and hand out links with
					minimal effort. Keep it simple, keep it hostile.
				</p>
			</section>

			<section className={styles.contentCard}>
				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>Upload Zone</h2>
					<UploadZone />
				</div>

				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>Recent Files</h2>
					<FileList files={files} />
				</div>
			</section>
		</main>
	);
}


import React from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home(): React.JSX.Element {
    return (
        <main>
            {/* Terminal Scanline Background */}
            <div className={styles.bgTerminal} />
            <div className={styles.scanlines} />
            
            {/* Particle System */}
            <div className={styles.particles}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className={styles.particle}>
                        {["♡", "💊", "🩹", "✨", "💕", "💉", "🔪", "💖"][i % 8]}
                    </span>
                ))}
            </div>

            {/* Screen Border Glow */}
            <div className={styles.screenBorder} />

            {/* Hero with Terminal Vibes */}
            <section className={styles.hero}>
                <h1 className={styles.heroTitle} data-text="You entered my domain~ ♡">
                    You entered my domain~ ♡
                </h1>
            </section>

            {/* Tools Section */}
            <section className={styles.section}>
                <div className={styles.toolsGrid}>
                    <button className={styles.cardMenhera} disabled>
                        <span className={styles.cardIcon}>💾</span>
                        <h3 className={styles.cardTitle}>File Hosting</h3>
                    </button>

                    <Link to="/sms-messenger" className={styles.cardMenhera}>
                        <span className={styles.cardIcon}>📱</span>
                        <h3 className={styles.cardTitle}>SMS Messenger</h3>
                    </Link>

                    <Link to="/calculator" className={styles.cardMenhera}>
                        <span className={styles.cardIcon}>🧮</span>
                        <h3 className={styles.cardTitle}>Calculator</h3>
                    </Link>

                    <button className={styles.cardMenhera} disabled>
                        <span className={styles.cardIcon}>📹</span>
                        <h3 className={styles.cardTitle}>Video Call</h3>
                    </button>
                </div>
            </section>
        </main>
    );
}

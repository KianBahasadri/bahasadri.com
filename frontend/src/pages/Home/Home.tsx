import React from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home(): React.JSX.Element {
    return (
        <main className={styles.container}>
            <div className={styles.bgYandere}></div>
            <div className={styles.floatingHearts}>
                <span className={styles.heart}>♡</span>
                <span className={styles.heart}>💊</span>
                <span className={styles.heart}>🩹</span>
                <span className={styles.heart}>✨</span>
                <span className={styles.heart}>💕</span>
            </div>

            <section className={styles.hero}>
                <h1 className={styles.heroTitle} data-text="You entered my domain~ ♡">
                    You entered my domain~ ♡
                </h1>
                <p className={styles.heroSubtitle}>
                    Welcome to bahasadri.com... I've been waiting for you~ ✨💖
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    🎀 Available Tools (Don't resist~)
                </h2>
                <div className={styles.toolsGrid}>
                    <div className={styles.cardMenhera}>
                        <h3 className={styles.cardTitle}>💾 File Hosting</h3>
                        <p>
                            Upload and share your files with the world... I'll keep them safe
                            forever~ Drag and drop interface with automatic compression. ✨💕
                        </p>
                        <button className={styles.btnYandere} disabled>
                            Coming Soon (I'm working on it~) 🩸💾
                        </button>
                    </div>

                    <div className={styles.cardMenhera}>
                        <h3 className={styles.cardTitle}>📱 SMS Messenger</h3>
                        <p>
                            Send and receive text messages right from your browser. Real-time
                            chat interface... I'll deliver every message personally~ 🎀💖
                        </p>
                        <Link to="/sms-messenger" className={styles.btnYandere}>
                            Launch (Don't Resist) 🎀🔪
                        </Link>
                    </div>

                    <div className={styles.cardMenhera}>
                        <h3 className={styles.cardTitle}>🧮 Calculator</h3>
                        <p>
                            A sleek calculator with a modern interface. Perfect for quick
                            calculations... I'll compute everything for you~ ✨💊
                        </p>
                        <Link to="/calculator" className={styles.btnYandere}>
                            Launch (Click Me~) 💕⚡
                        </Link>
                    </div>

                    <div className={styles.cardMenhera}>
                        <h3 className={styles.cardTitle}>📹 Video Call</h3>
                        <p>
                            Join video calls with your friends. Real-time communication in a
                            beautiful interface... I'll watch over every call~ 👀💖
                        </p>
                        <button className={styles.btnYandere} disabled>
                            Coming Soon (Almost ready~) 🩹✨
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}

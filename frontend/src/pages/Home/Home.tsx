import React, { useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home(): React.JSX.Element {
    const audioContextRef = useRef<AudioContext | null>(null);
    const heartbeatIntervalRef = useRef<number | null>(null);

    const playHeartbeatSound = (): void => {
        if (!audioContextRef.current) {
            const AudioContextClass =
                globalThis.AudioContext ||
                (globalThis as { webkitAudioContext?: typeof AudioContext })
                    .webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }

        if (!audioContextRef.current) {
            return;
        }

        const audioContext = audioContextRef.current;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 60;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
            0.6,
            audioContext.currentTime + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.15
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    };

    const startHeartbeat = (): void => {
        if (heartbeatIntervalRef.current !== null) {
            return;
        }

        playHeartbeatSound();

        heartbeatIntervalRef.current = globalThis.setInterval(() => {
            playHeartbeatSound();
            setTimeout(() => {
                playHeartbeatSound();
            }, 150);
        }, 1500);
    };

    const stopHeartbeat = (): void => {
        if (heartbeatIntervalRef.current !== null) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    };

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
                <h1
                    className={styles.heroTitle}
                    data-text="You entered my domain~ ♡"
                >
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

                    <Link
                        to="/sms-messenger"
                        className={styles.cardMenhera}
                        onMouseEnter={startHeartbeat}
                        onMouseLeave={stopHeartbeat}
                    >
                        <span className={styles.cardIcon}>📱</span>
                        <h3 className={styles.cardTitle}>SMS Messenger</h3>
                    </Link>

                    <Link
                        to="/calculator"
                        className={styles.cardMenhera}
                        onMouseEnter={startHeartbeat}
                        onMouseLeave={stopHeartbeat}
                    >
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

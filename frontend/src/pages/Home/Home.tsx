import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

interface ToolPopup {
    text: string;
    ascii?: string;
}

const toolPopups: Record<string, ToolPopup> = {
    "file-hosting": {
        text: "Coming soon~ 🥺 I'm still working on it for you! 💾✨",
        ascii: "(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)",
    },
    "file-encryptor": {
        text: "Not ready yet... but I'll keep your secrets safe! 🔒💖",
        ascii: "♡( ◡‿◡ )",
    },
    "sms-messenger": {
        text: "Click me, darling~ Let's talk forever! 📱💕",
        ascii: "(♡ >ω< ♡)",
    },
    calculator: {
        text: "Math time together~ I'll help you calculate! 🧮✨",
        ascii: "☆⌒(ゝ。∂)",
    },
    "osint-tool": {
        text: "Still building this one... I'm watching for you! 🔍👁️",
        ascii: "(o_O)",
    },
    "video-call": {
        text: "Soon we can see each other~ I'm waiting! 📹💖",
        ascii: "(〜￣▽￣)〜",
    },
};

export default function Home(): React.JSX.Element {
    const audioContextRef = useRef<AudioContext | null>(null);
    const heartbeatIntervalRef = useRef<number | null>(null);
    const [hoveredTool, setHoveredTool] = useState<string | null>(null);
    const [popupPosition, setPopupPosition] = useState<{
        x: number;
        y: number;
        above: boolean;
    } | null>(null);

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

    const handleCardHover = (
        toolId: string,
        event: React.MouseEvent<HTMLElement>
    ): void => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const topY = rect.top - 20;
        
        // Ensure popup stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const popupWidth = 280;
        const popupHeight = 120;
        
        let x = centerX;
        let y = topY;
        
        // Adjust if popup would go off left/right edge
        if (x - popupWidth / 2 < 10) {
            x = popupWidth / 2 + 10;
        } else if (x + popupWidth / 2 > viewportWidth - 10) {
            x = viewportWidth - popupWidth / 2 - 10;
        }
        
        // Adjust if popup would go off top edge
        const above = y - popupHeight >= 10;
        if (!above) {
            y = rect.bottom + 20;
        }
        
        setPopupPosition({ x, y, above });
        setHoveredTool(toolId);
    };

    const handleCardLeave = (): void => {
        setHoveredTool(null);
        setPopupPosition(null);
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
                    <button
                        className={styles.cardMenhera}
                        disabled
                        onMouseEnter={(e) => handleCardHover("file-hosting", e)}
                        onMouseLeave={handleCardLeave}
                    >
                        <span className={styles.cardIcon}>💾</span>
                        <h3 className={styles.cardTitle}>File Hosting</h3>
                    </button>

                    <button
                        className={styles.cardMenhera}
                        disabled
                        onMouseEnter={(e) =>
                            handleCardHover("file-encryptor", e)
                        }
                        onMouseLeave={handleCardLeave}
                    >
                        <span className={styles.cardIcon}>🔒</span>
                        <h3 className={styles.cardTitle}>File Encryptor</h3>
                    </button>

                    <Link
                        to="/sms-messenger"
                        className={styles.cardMenhera}
                        onMouseEnter={(e) => {
                            handleCardHover("sms-messenger", e);
                            startHeartbeat();
                        }}
                        onMouseLeave={() => {
                            handleCardLeave();
                            stopHeartbeat();
                        }}
                    >
                        <span className={styles.cardIcon}>📱</span>
                        <h3 className={styles.cardTitle}>SMS Messenger</h3>
                    </Link>

                    <Link
                        to="/calculator"
                        className={styles.cardMenhera}
                        onMouseEnter={(e) => {
                            handleCardHover("calculator", e);
                            startHeartbeat();
                        }}
                        onMouseLeave={() => {
                            handleCardLeave();
                            stopHeartbeat();
                        }}
                    >
                        <span className={styles.cardIcon}>🧮</span>
                        <h3 className={styles.cardTitle}>Calculator</h3>
                    </Link>

                    <button
                        className={styles.cardMenhera}
                        disabled
                        onMouseEnter={(e) => handleCardHover("osint-tool", e)}
                        onMouseLeave={handleCardLeave}
                    >
                        <span className={styles.cardIcon}>🔍</span>
                        <h3 className={styles.cardTitle}>OSINT Tool</h3>
                    </button>

                    <button
                        className={styles.cardMenhera}
                        disabled
                        onMouseEnter={(e) => handleCardHover("video-call", e)}
                        onMouseLeave={handleCardLeave}
                    >
                        <span className={styles.cardIcon}>📹</span>
                        <h3 className={styles.cardTitle}>Video Call</h3>
                    </button>
                </div>

                {/* Cute Popup */}
                {hoveredTool && popupPosition && toolPopups[hoveredTool] && (
                    <div
                        className={`${styles.cutePopup} ${
                            !popupPosition.above ? styles.popupBelow : ""
                        }`}
                        style={{
                            left: `${popupPosition.x}px`,
                            top: `${popupPosition.y}px`,
                        }}
                    >
                        <div className={styles.popupContent}>
                            {toolPopups[hoveredTool].ascii && (
                                <div className={styles.popupAscii}>
                                    {toolPopups[hoveredTool].ascii}
                                </div>
                            )}
                            <div className={styles.popupText}>
                                {toolPopups[hoveredTool].text}
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}

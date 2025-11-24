import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound(): React.JSX.Element {
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const trailIdRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent): void => {
            setCursorPosition({ x: e.clientX, y: e.clientY });

            const newTrail = {
                x: e.clientX,
                y: e.clientY,
                id: trailIdRef.current++,
            };

            setTrail((prev) => {
                const updated = [...prev, newTrail].slice(-15);
                return updated;
            });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <main className={styles["notFoundMain"]} ref={containerRef}>
            {/* Cursor trail */}
            {trail.map((point, index) => (
                <div
                    key={point.id}
                    className={styles["cursorTrail"]}
                    style={{
                        left: `${point.x}px`,
                        top: `${point.y}px`,
                        opacity: (index + 1) / trail.length * 0.6,
                        transform: `scale(${(index + 1) / trail.length})`,
                    }}
                />
            ))}

            {/* Cursor follower */}
            <div
                className={styles["cursorFollower"]}
                style={{
                    left: `${cursorPosition.x}px`,
                    top: `${cursorPosition.y}px`,
                }}
            />

            {/* Screen Border with extra glow */}
            <div className={styles["screenBorder"]}>
                {/* Terminal Scanline Background */}
                <div className={styles["bgTerminal"]} />
                <div className={styles["scanlines"]} />

                {/* Extra particle systems */}
                <div className={styles["particles"]}>
                    {Array.from({ length: 40 }).map((_, i) => {
                        const emojis = [
                            "♡",
                            "💊",
                            "🩹",
                            "✨",
                            "💕",
                            "💉",
                            "🔪",
                            "💖",
                            "💔",
                            "😿",
                            "💀",
                            "👻",
                        ];
                        const emoji = emojis[i % 12] ?? "";
                        return (
                            <span
                                key={`particle-${String(i)}-${emoji}`}
                                className={styles["particle"]}
                            >
                                {emoji}
                            </span>
                        );
                    })}
                </div>

                {/* Additional floating elements */}
                <div className={styles["floatingElements"]}>
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div
                            key={`float-${String(i)}`}
                            className={styles["floatingElement"]}
                            style={{
                                left: `${(i * 7) % 100}%`,
                                animationDelay: `${i * 0.3}s`,
                            }}
                        >
                            {i % 3 === 0 ? "404" : i % 3 === 1 ? "💔" : "😿"}
                        </div>
                    ))}
                </div>

                <div className={styles["contentWrapper"]}>
                    {/* Hero Section with intense glitch */}
                    <section className={styles["hero"]}>
                        <h1
                            className={styles["heroTitle"]}
                            data-text="404 Not Found~ 💔"
                        >
                            404 Not Found~ 💔
                        </h1>
                        <div className={styles["glitchOverlay"]}>
                            <span className={styles["glitchText"]}>404</span>
                            <span className={styles["glitchText"]}>404</span>
                            <span className={styles["glitchText"]}>404</span>
                        </div>
                    </section>

                    {/* Message Section */}
                    <section className={styles["messageSection"]}>
                        <p className={styles["message"]}>
                            Oopsie~! This page doesn't exist... 🥺
                        </p>
                        <p className={styles["subMessage"]}>
                            Did you get lost in the void? Let me help you find your way back! ✨
                        </p>
                    </section>

                    {/* Animated Button */}
                    <section className={styles["buttonSection"]}>
                        <Link to="/" className={styles["homeButton"]}>
                            <span className={styles["buttonText"]}>
                                Go Home~ ♡
                            </span>
                            <span className={styles["buttonSparkle"]}>✨</span>
                            <span className={styles["buttonSparkle"]}>💖</span>
                            <span className={styles["buttonSparkle"]}>✨</span>
                        </Link>
                    </section>
                </div>
            </div>
        </main>
    );
}


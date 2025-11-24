import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound(): React.JSX.Element {
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const trailIdRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorsRef = useRef<Array<OscillatorNode>>([]);
    const gainNodesRef = useRef<Array<GainNode>>([]);
    const hasInteractedRef = useRef(false);
    const interactionListenersRef = useRef<Array<() => void>>([]);
    const isPlayingRef = useRef(false);

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

    useEffect(() => {
        const createAudioContext = (): AudioContext | null => {
            if (audioContextRef.current) {
                return audioContextRef.current;
            }

            try {
                const webkitAudioContext = (
                    globalThis as { webkitAudioContext?: typeof AudioContext }
                ).webkitAudioContext;
                const AudioContextClass =
                    webkitAudioContext ?? globalThis.AudioContext;
                audioContextRef.current = new AudioContextClass();
                return audioContextRef.current;
            } catch {
                return null;
            }
        };

        const stopMusic = (): void => {
            oscillatorsRef.current.forEach((osc) => {
                try {
                    osc.stop();
                } catch {
                    // Oscillator already stopped
                }
            });
            oscillatorsRef.current = [];
            gainNodesRef.current = [];
            isPlayingRef.current = false;
        };

        const playMusic = async (): Promise<void> => {
            if (isPlayingRef.current) {
                return;
            }

            let audioContext = audioContextRef.current;
            if (!audioContext) {
                audioContext = createAudioContext();
                if (!audioContext) {
                    return;
                }
            }

            if (audioContext.state === "suspended") {
                try {
                    await audioContext.resume();
                } catch (error) {
                    throw error;
                }
            }

            // Ambient music: soft, melancholic tones fitting the kawaii/yami kawaii aesthetic
            // Using a minor chord progression with gentle harmonics
            const frequencies = [
                220.0, // A3 - base tone
                261.63, // C4 - minor third
                293.66, // D4 - perfect fourth
                329.63, // E4 - perfect fifth
                392.0, // G4 - minor seventh
            ];

            const createOscillator = (
                frequency: number,
                type: OscillatorType,
                gainValue: number,
                delay: number
            ): void => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                const lfo = audioContext.createOscillator();
                const lfoGain = audioContext.createGain();

                oscillator.type = type;
                oscillator.frequency.value = frequency;

                lfo.type = "sine";
                lfo.frequency.value = 0.1 + Math.random() * 0.2;
                lfoGain.gain.value = frequency * 0.02;

                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);

                gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
                gainNode.gain.linearRampToValueAtTime(
                    gainValue,
                    audioContext.currentTime + delay + 0.5
                );

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.start(audioContext.currentTime + delay);
                lfo.start(audioContext.currentTime + delay);

                oscillatorsRef.current.push(oscillator, lfo);
                gainNodesRef.current.push(gainNode, lfoGain);
            };

            // Create layered ambient tones
            frequencies.forEach((freq, index) => {
                const gain = 0.08 - index * 0.01;
                const delay = index * 0.2;
                createOscillator(freq, "sine", gain, delay);
            });

            // Add some harmonics for texture
            frequencies.slice(0, 3).forEach((freq, index) => {
                const harmonicFreq = freq * 2;
                const gain = 0.03 - index * 0.005;
                const delay = 1 + index * 0.15;
                createOscillator(harmonicFreq, "triangle", gain, delay);
            });

            isPlayingRef.current = true;
            hasInteractedRef.current = true;

            interactionListenersRef.current.forEach((cleanup) => {
                cleanup();
            });
            interactionListenersRef.current = [];
        };

        const handleInteraction = (): void => {
            void playMusic();
        };

        const setupInteractionListeners = (): void => {
            const events = ["click", "keydown", "touchstart", "mousedown"];
            const cleanups: Array<() => void> = [];

            events.forEach((eventType) => {
                window.addEventListener(eventType, handleInteraction, {
                    once: true,
                });
                cleanups.push(() => {
                    window.removeEventListener(eventType, handleInteraction);
                });
            });

            interactionListenersRef.current = cleanups;
        };

        const tryPlayMusic = async (): Promise<void> => {
            try {
                await playMusic();
            } catch (error) {
                if (
                    error instanceof Error &&
                    (error.name === "NotAllowedError" ||
                        error.name === "NotSupportedError")
                ) {
                    setupInteractionListeners();
                } else {
                    setupInteractionListeners();
                }
            }
        };

        void tryPlayMusic();

        return () => {
            stopMusic();
            interactionListenersRef.current.forEach((cleanup) => {
                cleanup();
            });
            interactionListenersRef.current = [];
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


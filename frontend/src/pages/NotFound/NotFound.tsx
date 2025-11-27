import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as Tone from "tone";
import styles from "./NotFound.module.css";

export default function NotFound(): React.JSX.Element {
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
    const trailIdRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasInteractedRef = useRef(false);
    const interactionListenersRef = useRef<(() => void)[]>([]);
    const isPlayingRef = useRef(false);
    const synthRef = useRef<Tone.PolySynth | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const autoFilterRef = useRef<Tone.AutoFilter | null>(null);
    const volumeRef = useRef<Tone.Volume | null>(null);
    const compressorRef = useRef<Tone.Compressor | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

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

        globalThis.addEventListener("mousemove", handleMouseMove);

        return (): void => {
            globalThis.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const stopMusic = (): void => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }

            if (synthRef.current) {
                synthRef.current.releaseAll();
                synthRef.current.dispose();
                synthRef.current = null;
            }

            if (reverbRef.current) {
                reverbRef.current.dispose();
                reverbRef.current = null;
            }

            if (autoFilterRef.current) {
                autoFilterRef.current.dispose();
                autoFilterRef.current = null;
            }

            if (volumeRef.current) {
                volumeRef.current.dispose();
                volumeRef.current = null;
            }

            if (compressorRef.current) {
                compressorRef.current.dispose();
                compressorRef.current = null;
            }

            const transport = Tone.getTransport();
            transport.cancel();
            isPlayingRef.current = false;
        };

        const playMusic = async (): Promise<void> => {
            if (isPlayingRef.current) {
                return;
            }

            try {
                await Tone.start();
            } catch (error) {
                if (error instanceof Error) {
                    throw error;
                }
                return;
            }

            const reverb = new Tone.Reverb(15);
            await reverb.generate();
            reverbRef.current = reverb;

            const synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "sine" },
                envelope: {
                    attack: 5,
                    decay: 0.5,
                    sustain: 0.8,
                    release: 4,
                },
            });
            synthRef.current = synth;

            const compressor = new Tone.Compressor({
                threshold: -24,
                ratio: 12,
                attack: 0.003,
                release: 0.25,
            });
            compressorRef.current = compressor;

            const volume = new Tone.Volume(-10);
            volumeRef.current = volume;

            // Math.random() is safe here - used only for visual/audio effects, not security
            const randomValue = Math.random() / 100 + 0.01;
            const autoFilter = new Tone.AutoFilter(
                randomValue,
                100,
                4
            );
            autoFilter.start();
            autoFilterRef.current = autoFilter;

            synth.connect(volume);
            volume.connect(compressor);
            compressor.connect(autoFilter);
            autoFilter.connect(reverb);
            reverb.toDestination();

            const activeSources: number[] = [];
            const transport = Tone.getTransport();

            const createScheduleNext = (notes: string[]): (() => void) => {
                return (): void => {
                    if (isPlayingRef.current) {
                        play(notes);
                    }
                };
            };

            const play = (notes: string[]): void => {
                // Math.random() is safe here - used only for visual/audio effects, not security
                const noteIndex = Math.floor(Math.random() * notes.length);
                const note = notes[noteIndex];
                if (!note) {
                    return;
                }
                // Math.random() is safe here - used only for visual/audio effects, not security
                const delay = 1 + Math.random() * 5;

                synth.triggerAttackRelease(note, "8n", `+${String(delay)}`);

                // Math.random() is safe here - used only for visual/audio effects, not security
                const nextDelay =
                    4 + Math.random() * 5 - 2.5;

                const event = transport.scheduleOnce(createScheduleNext(notes), `+${String(nextDelay)}`);

                activeSources.push(event);
            };

            const schedule = (): void => {
                play(["C5"]);
                play(["A5", "G5", "F5", "D5", "E5"]);
                play(["C6"]);
            };

            schedule();

            cleanupRef.current = (): void => {
                for (const event of activeSources) {
                    transport.clear(event);
                }
                synth.releaseAll();
            };

            transport.start();
            isPlayingRef.current = true;
            hasInteractedRef.current = true;

            for (const cleanup of interactionListenersRef.current) {
                cleanup();
            }
            interactionListenersRef.current = [];
        };

        const handleInteraction = (): void => {
            if (!isPlayingRef.current) {
                void playMusic();
            }
        };

        const handler = (): void => {
            handleInteraction();
        };

        const setupInteractionListeners = (): void => {
            if (interactionListenersRef.current.length > 0) {
                return;
            }

            const events = ["click", "keydown", "touchstart", "mousedown"];
            const cleanups: (() => void)[] = [];

            for (const eventType of events) {
                globalThis.addEventListener(eventType, handler);
                cleanups.push(() => {
                    globalThis.removeEventListener(eventType, handler);
                });
            }

            interactionListenersRef.current = cleanups;
        };

        const tryPlayMusic = async (): Promise<void> => {
            setupInteractionListeners();

            try {
                await playMusic();
            } catch {
                // If autoplay fails, listeners are already set up
            }
        };

        void tryPlayMusic();

        return (): void => {
            stopMusic();
            for (const cleanup of interactionListenersRef.current) {
                cleanup();
            }
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
                        left: `${String(point.x)}px`,
                        top: `${String(point.y)}px`,
                        opacity: (index + 1) / trail.length * 0.6,
                        transform: `scale(${String((index + 1) / trail.length)})`,
                    }}
                />
            ))}

            {/* Cursor follower */}
            <div
                className={styles["cursorFollower"]}
                style={{
                    left: `${String(cursorPosition.x)}px`,
                    top: `${String(cursorPosition.y)}px`,
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
                    {Array.from({ length: 15 }).map((_, i): React.JSX.Element => {
                        const getContent = (): string => {
                            if (i % 3 === 0) return "404";
                            if (i % 3 === 1) return "💔";
                            return "😿";
                        };
                        return (
                            <div
                                key={`float-${String(i)}`}
                                className={styles["floatingElement"]}
                                style={{
                                    left: `${String((i * 7) % 100)}%`,
                                    animationDelay: `${String(i * 0.3)}s`,
                                }}
                            >
                                {getContent()}
                            </div>
                        );
                    })}
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
                            Oopsie~! This page doesn&apos;t exist... 🥺
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


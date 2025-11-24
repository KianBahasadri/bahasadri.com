import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchThreads, fetchContacts } from "../../../lib/api";
import SMSInterface from "./components/SMSInterface/sms-interface";
import type { ThreadSummary, Contact } from "../../../types/sms-messenger";
import styles from "./sms-messenger.module.css";

const queryKeys = {
    threads: ["sms-messenger", "threads"] as const,
    contacts: ["sms-messenger", "contacts"] as const,
};

const terminalLines = [
    "> Initializing SMS protocol...",
    "> Connecting to message server...",
    "> Loading conversations...",
    "> Ready to send messages~ ♡",
];

export default function SMSMessenger(): React.JSX.Element {
    const [terminalText, setTerminalText] = useState("");
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const [isTerminalFinished, setIsTerminalFinished] = useState(false);
    const [shouldHideTerminal, setShouldHideTerminal] = useState(false);

    const { data: threadsData } = useQuery({
        queryKey: queryKeys.threads,
        queryFn: async () => await fetchThreads(),
    });

    const { data: contactsData } = useQuery({
        queryKey: queryKeys.contacts,
        queryFn: async () => await fetchContacts(),
    });

    const initialThreads: ThreadSummary[] = threadsData?.threads ?? [];
    const initialContacts: Contact[] = contactsData?.contacts ?? [];
    const initialCounterpart: string | undefined =
        initialThreads.length > 0 ? initialThreads[0]?.counterpart : undefined;

    useEffect(() => {
        if (currentLineIndex >= terminalLines.length) {
            if (!isTerminalFinished) {
                setIsTerminalFinished(true);
                setTimeout(() => {
                    setShouldHideTerminal(true);
                }, 4000);
            }
            return;
        }

        const line = terminalLines[currentLineIndex];
        if (line === undefined) {
            return;
        }

        let charIndex = 0;
        const typingInterval = setInterval(() => {
            if (charIndex < line.length) {
                setTerminalText((prev) => {
                    const lines = prev === "" ? [] : prev.split("\n");
                    while (lines.length <= currentLineIndex) {
                        lines.push("");
                    }
                    lines[currentLineIndex] = line.slice(0, charIndex + 1);
                    return lines.join("\n");
                });
                charIndex++;
            } else {
                clearInterval(typingInterval);
                setTimeout(() => {
                    setCurrentLineIndex((prev) => prev + 1);
                }, 500);
            }
        }, 50);

        return () => {
            clearInterval(typingInterval);
        };
    }, [currentLineIndex]);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530);

        return () => {
            clearInterval(cursorInterval);
        };
    }, []);

    return (
        <>
            {/* Terminal Scanline Background */}
            <div className={styles["bgTerminal"]} />
            <div className={styles["scanlines"]} />

            {/* Terminal Lines */}
            {!shouldHideTerminal ? (
                <div
                    className={`${styles["terminalLines"]} ${
                        isTerminalFinished ? styles["fadeOut"] : ""
                    }`}
                >
                    <pre className={styles["terminalText"]}>
                        {terminalText}
                        {showCursor &&
                        currentLineIndex < terminalLines.length ? (
                            <span className={styles["terminalCursor"]}>_</span>
                        ) : null}
                    </pre>
                </div>
            ) : null}

            {/* Particle System */}
            <div className={styles["particles"]}>
                {Array.from({ length: 20 }, (_, i) => {
                    const emojis = [
                        "♡",
                        "💊",
                        "🩹",
                        "✨",
                        "💕",
                        "💉",
                        "🔪",
                        "💖",
                    ] as const;
                    const emojiIndex = i % 8;
                    const emoji = emojis[emojiIndex] ?? "♡";
                    const uniqueId = `particle-${String(i)}-${emoji}`;
                    return { id: uniqueId, emoji };
                }).map((particle) => (
                    <span key={particle.id} className={styles["particle"]}>
                        {particle.emoji}
                    </span>
                ))}
            </div>

            {/* Screen Border Glow */}
            <div className={styles["screenBorder"]} />

            <SMSInterface
                initialThreads={initialThreads}
                initialMessages={[]}
                initialContacts={initialContacts}
                initialCounterpart={initialCounterpart}
            />
        </>
    );
}

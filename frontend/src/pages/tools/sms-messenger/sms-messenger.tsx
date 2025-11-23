import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchThreads, fetchContacts } from "../../../lib/api";
import SMSInterface from "./components/SMSInterface/sms-interface";
import type { ThreadSummary, Contact } from "../../../types/sms-messenger";
import styles from "./sms-messenger.module.css";

const queryKeys = {
  threads: ["sms-messenger", "threads"] as const,
  contacts: ["sms-messenger", "contacts"] as const,
};

export default function SMSMessenger(): React.JSX.Element {
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

  return (
    <>
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

      <SMSInterface
        initialThreads={initialThreads}
        initialMessages={[]}
        initialContacts={initialContacts}
        initialCounterpart={initialCounterpart}
      />
    </>
  );
}


import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWhatsAppThreads, fetchWhatsAppContacts } from "../../../lib/api";
import WhatsAppInterface from "./components/WhatsAppInterface/whatsapp-interface";
import type { ThreadSummary, Contact } from "../../../types/whatsapp-messenger";
import styles from "./whatsapp-messenger.module.css";

const queryKeys = {
    threads: ["whatsapp-messenger", "threads"] as const,
    contacts: ["whatsapp-messenger", "contacts"] as const,
};

export default function WhatsAppMessenger(): React.JSX.Element {
    const { data: threadsData } = useQuery({
        queryKey: queryKeys.threads,
        queryFn: async () => await fetchWhatsAppThreads(),
    });

    const { data: contactsData } = useQuery({
        queryKey: queryKeys.contacts,
        queryFn: async () => await fetchWhatsAppContacts(),
    });

    const initialThreads: ThreadSummary[] = threadsData?.threads ?? [];
    const initialContacts: Contact[] = contactsData?.contacts ?? [];
    const initialCounterpart: string | undefined =
        initialThreads.length > 0 ? initialThreads[0]?.counterpart : undefined;

    return (
        <div className={styles["container"]}>
            <WhatsAppInterface
                initialThreads={initialThreads}
                initialMessages={[]}
                initialContacts={initialContacts}
                initialCounterpart={initialCounterpart}
            />
        </div>
    );
}


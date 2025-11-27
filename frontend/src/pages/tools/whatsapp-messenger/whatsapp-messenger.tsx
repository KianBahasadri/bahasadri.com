import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchWhatsAppThreads, fetchWhatsAppContacts } from "../../../lib/api";
import WhatsAppInterface from "./components/WhatsAppInterface/whatsapp-interface";
import type { ThreadSummary, Contact } from "../../../types/whatsapp-messenger";
import styles from "./whatsapp-messenger.module.css";

const queryKeys = {
    threads: ["whatsapp-messenger", "threads"] as const,
    contacts: ["whatsapp-messenger", "contacts"] as const,
};

export default function WhatsAppMessenger(): React.JSX.Element {
    const navigate = useNavigate();
    const [bannerDismissed, setBannerDismissed] = useState(false);
    
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
            {!bannerDismissed && (
                <div className={styles["infoBanner"]}>
                    <div className={styles["bannerContent"]}>
                        <div className={styles["bannerHeader"]}>
                            <h3 className={styles["bannerTitle"]}>⚠️ WhatsApp Setup Required</h3>
                            <button
                                className={styles["bannerClose"]}
                                onClick={() => { setBannerDismissed(true); }}
                                aria-label="Close banner"
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles["bannerBody"]}>
                            <p>
                                <strong>WhatsApp messaging is not yet fully configured.</strong> To use WhatsApp, you need to:
                            </p>
                            <ol>
                                <li>Create a Meta Business Account</li>
                                <li>Register your phone number as a WhatsApp Business sender in Twilio Console</li>
                                <li>Complete WhatsApp Business verification (can take days/weeks)</li>
                            </ol>
                            <p>
                                <strong>For testing:</strong> You can use the WhatsApp Sandbox (<code>whatsapp:+14155238886</code>) which doesn&apos;t require Meta Business verification.
                            </p>
                            <p>
                                <strong>Alternative:</strong> Use SMS Messenger instead - it works immediately and can message any phone number directly.
                            </p>
                        </div>
                        <div className={styles["bannerActions"]}>
                            <button
                                className={styles["bannerButton"]}
                                onClick={() => {
                                    const result = navigate("/");
                                    if (result instanceof Promise) {
                                        result.catch(() => {
                                            // Navigation errors are handled by React Router
                                        });
                                    }
                                }}
                            >
                                Go Back Home
                            </button>
                            <button
                                className={styles["bannerButtonSecondary"]}
                                onClick={() => {
                                    const result = navigate("/sms-messenger");
                                    if (result instanceof Promise) {
                                        result.catch(() => {
                                            // Navigation errors are handled by React Router
                                        });
                                    }
                                }}
                            >
                                Try SMS Messenger
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <WhatsAppInterface
                initialThreads={initialThreads}
                initialMessages={[]}
                initialContacts={initialContacts}
                initialCounterpart={initialCounterpart}
            />
        </div>
    );
}


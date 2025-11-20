"use client";

 /**
  * SMS Commander Interactive Console
  *
  * Chat-style client component that renders the thread sidebar, conversation
  * view, composer, and contact alias editor. All real-time-ish behavior is
  * powered by 1s polling loops hitting Workers-safe JSON endpoints.
  *
  * Type: Client Component (requires interactivity + polling)
 *
 * @see ../../PLAN.md - Utility planning document
 * @see ../../../../docs/AI_AGENT_STANDARDS.md - Repository standards
 * @see ../../../../docs/COMPONENTS.md - Component patterns
  */
 
import {
    type FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
 
 import MessageList from "../MessageList/MessageList";
 import styles from "./SMSInterface.module.css";
 import type {
     Contact,
     ContactMutationResult,
     Message,
     MessageHistoryResponse,
     SendSMSResponse,
     ThreadListResponse,
     ThreadSummary,
 } from "../../lib/types";
 
 interface SMSInterfaceProps {
     /** Threads fetched on the server during the initial render */
     initialThreads: ThreadSummary[];
     /** Messages for the default/first thread */
     initialMessages: Message[];
     /** Contacts cached on the server */
     initialContacts: Contact[];
     /** Counterpart selected on first render (if any threads exist) */
     initialCounterpart: string | null;
 }
 
 type MessageCache = Record<string, Message[]>;
 
 /**
  * Render the SMS commander chat experience.
  */
 export default function SMSInterface({
     initialThreads,
     initialMessages,
     initialContacts,
     initialCounterpart,
 }: SMSInterfaceProps) {
     const [threads, setThreads] = useState<ThreadSummary[]>(initialThreads);
     const [contacts, setContacts] = useState<Contact[]>(initialContacts);
     const [messageCache, setMessageCache] = useState<MessageCache>(() =>
         initialCounterpart ? { [initialCounterpart]: initialMessages } : {}
     );
     const [activeCounterpart, setActiveCounterpart] = useState<string | null>(
         initialCounterpart
     );
     const [draftNumber, setDraftNumber] = useState("");
     const [messageBody, setMessageBody] = useState("");
     const [isSending, setIsSending] = useState(false);
     const [isLoadingMessages, setIsLoadingMessages] = useState(false);
     const [isRefreshingThreads, setIsRefreshingThreads] = useState(false);
     const [statusMessage, setStatusMessage] = useState<string | null>(null);
     const [errorMessage, setErrorMessage] = useState<string | null>(null);
     const [isContactFormVisible, setIsContactFormVisible] = useState(false);
     const [contactNameInput, setContactNameInput] = useState("");
     const [isSavingContact, setIsSavingContact] = useState(false);
 
     const refreshThreadsInFlight = useRef(false);
     const refreshMessagesInFlight = useRef(false);
     const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
 
     const activeMessages = useMemo(() => {
         if (!activeCounterpart) {
             return [];
         }
 
         return messageCache[activeCounterpart] ?? [];
     }, [activeCounterpart, messageCache]);
 
     const currentContact = useMemo(() => {
         if (!activeCounterpart) {
             return null;
         }
 
         return (
             contacts.find((contact) => contact.phoneNumber === activeCounterpart) ??
             null
         );
     }, [activeCounterpart, contacts]);
 
     const isComposingNewChat = !activeCounterpart;
 
     /**
      * Refresh the thread list from the Workers endpoint.
      */
     const refreshThreads = useCallback(
         async (silent = false) => {
             if (silent && refreshThreadsInFlight.current) {
                 return;
             }
 
             if (!silent) {
                 setIsRefreshingThreads(true);
             }
 
             refreshThreadsInFlight.current = true;
 
             try {
                 const response = await fetch("/api/tools/sms-commander/threads", {
                     cache: "no-store",
                 });
 
                 if (!response.ok) {
                     throw new Error("Thread list choked. Try again.");
                 }
 
                 const payload = (await response.json()) as ThreadListResponse;
                 setThreads(payload.threads);
             } catch (error) {
                 if (!silent) {
                     setErrorMessage(
                         error instanceof Error
                             ? error.message
                             : "Failed to refresh threads."
                     );
                 }
             } finally {
                 refreshThreadsInFlight.current = false;
                 if (!silent) {
                     setIsRefreshingThreads(false);
                 }
             }
         },
         []
     );
 
     /**
      * Load messages for a specific counterpart.
      */
     const loadMessages = useCallback(
         async (counterpart: string, silent = false) => {
             if (!counterpart) {
                 return;
             }
 
             if (silent && refreshMessagesInFlight.current) {
                 return;
             }
 
             if (!silent) {
                 setIsLoadingMessages(true);
             }
 
             refreshMessagesInFlight.current = true;
 
             try {
                 const response = await fetch(
                     `/api/tools/sms-commander/history?counterpart=${encodeURIComponent(
                         counterpart
                     )}`,
                     {
                         cache: "no-store",
                     }
                 );
 
                if (!response.ok) {
                    throw new Error("History endpoint coughed up blood.");
                }

                const payload = (await response.json()) as MessageHistoryResponse;
                if (payload.error) {
                    throw new Error(payload.error);
                }
                setMessageCache((current) => ({
                     ...current,
                     [counterpart]: payload.messages,
                 }));
             } catch (error) {
                 if (!silent) {
                     setErrorMessage(
                         error instanceof Error
                             ? error.message
                             : "Failed to fetch history."
                     );
                 }
             } finally {
                 refreshMessagesInFlight.current = false;
                 if (!silent) {
                     setIsLoadingMessages(false);
                 }
             }
         },
         []
     );
 
     /**
      * Kick off polling loop that keeps the active thread + sidebar fresh.
      */
     useEffect(() => {
         if (pollIntervalRef.current) {
             clearInterval(pollIntervalRef.current);
         }
 
         pollIntervalRef.current = setInterval(() => {
             refreshThreads(true);
             if (activeCounterpart) {
                 void loadMessages(activeCounterpart, true);
             }
         }, 1000);
 
         return () => {
             if (pollIntervalRef.current) {
                 clearInterval(pollIntervalRef.current);
             }
         };
     }, [activeCounterpart, loadMessages, refreshThreads]);
 
     /**
      * Auto-fetch messages when selecting a different thread.
      */
     useEffect(() => {
         if (!activeCounterpart) {
             return;
         }
 
         if (!messageCache[activeCounterpart]) {
             void loadMessages(activeCounterpart);
         }
     }, [activeCounterpart, loadMessages, messageCache]);
 
     const handleThreadSelect = useCallback(
         (counterpart: string) => {
             setStatusMessage(null);
             setErrorMessage(null);
             setIsContactFormVisible(false);
             setActiveCounterpart(counterpart);
         },
         []
     );
 
     const handleStartNewChat = useCallback(() => {
         setActiveCounterpart(null);
         setStatusMessage(null);
         setErrorMessage(null);
         setIsContactFormVisible(false);
         setDraftNumber("");
     }, []);
 
    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
             event.preventDefault();
             setIsSending(true);
             setStatusMessage(null);
             setErrorMessage(null);
 
             const targetNumber = activeCounterpart ?? draftNumber.trim();
             if (!targetNumber) {
                 setErrorMessage("Give me a number to harass, agent.");
                 setIsSending(false);
                 return;
             }
 
             try {
                 const response = await fetch("/api/tools/sms-commander/send", {
                     method: "POST",
                     headers: {
                         "Content-Type": "application/json",
                     },
                     body: JSON.stringify({
                         phoneNumber: targetNumber,
                         message: messageBody,
                     }),
                 });
 
                 const payload = (await response.json()) as SendSMSResponse;
 
                 if (!response.ok || !payload.success || !payload.message) {
                     throw new Error(payload.error ?? "Send API imploded.");
                 }
 
                 const storedMessage = payload.message;
 
                 setMessageCache((current) => {
                     const existing = current[storedMessage.phoneNumber] ?? [];
                     return {
                         ...current,
                         [storedMessage.phoneNumber]: [...existing, storedMessage],
                     };
                 });
 
                 setStatusMessage(
                     "Transmission launched. If this fails, blame the solar flares."
                 );
                 setMessageBody("");
                 setDraftNumber("");
                 setActiveCounterpart(storedMessage.phoneNumber);
                 void refreshThreads(true);
             } catch (error) {
                 setErrorMessage(
                     error instanceof Error
                         ? error.message
                         : "Failed to send SMS."
                 );
             } finally {
                 setIsSending(false);
             }
         },
         [activeCounterpart, draftNumber, messageBody, refreshThreads]
     );
 
     const toggleContactForm = useCallback(() => {
         if (!activeCounterpart) {
             setErrorMessage("Pick a thread before naming it, glowie.");
             return;
         }
 
         setContactNameInput(currentContact?.displayName ?? "");
         setIsContactFormVisible((current) => !current);
     }, [activeCounterpart, currentContact]);
 
    const handleContactSave = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
             event.preventDefault();
 
             if (!activeCounterpart) {
                 setErrorMessage("Pick a thread before naming it, glowie.");
                 return;
             }
 
             setIsSavingContact(true);
             setErrorMessage(null);
 
             try {
                 const endpoint = currentContact
                     ? `/api/tools/sms-commander/contacts/${currentContact.id}`
                     : "/api/tools/sms-commander/contacts";
                 const method = currentContact ? "PATCH" : "POST";
                 const payload = currentContact
                     ? { displayName: contactNameInput }
                     : {
                           phoneNumber: activeCounterpart,
                           displayName: contactNameInput,
                       };
 
                 const response = await fetch(endpoint, {
                     method,
                     headers: {
                         "Content-Type": "application/json",
                     },
                     body: JSON.stringify(payload),
                 });
 
                const result = (await response.json()) as ContactMutationResult;
                if (!result.success || !result.contact) {
                     throw new Error(result.error ?? "Contact mutation failed.");
                 }
 
                const savedContact = result.contact;

                 setContacts((current) => {
                     const contactExists = current.some(
                        (contact) => contact.id === savedContact.id
                     );
                     if (contactExists) {
                         return current.map((contact) =>
                            contact.id === savedContact.id ? savedContact : contact
                         );
                     }
                    return [...current, savedContact];
                 });
 
                 setThreads((current) =>
                     current.map((thread) =>
                        thread.counterpart === savedContact.phoneNumber
                             ? {
                                   ...thread,
                                  contactId: savedContact.id,
                                  contactName: savedContact.displayName,
                               }
                             : thread
                     )
                 );
 
                 setStatusMessage("Alias updated. Don't make me rename it again.");
                 setIsContactFormVisible(false);
             } catch (error) {
                 setErrorMessage(
                     error instanceof Error
                         ? error.message
                         : "Failed to save contact."
                 );
             } finally {
                 setIsSavingContact(false);
             }
         },
         [activeCounterpart, contactNameInput, currentContact]
     );
 
     return (
         <div className={styles.chatLayout}>
             <aside className={styles.sidebar}>
                 <header className={styles.sidebarHeader}>
                     <h2>thread dossiers</h2>
                     <button
                         type="button"
                         className={styles.newChatButton}
                         onClick={handleStartNewChat}
                     >
                         start new psyop
                     </button>
                 </header>
                 <div className={styles.threadList}>
                     {threads.length === 0 ? (
                         <p className={styles.emptySidebar}>
                             no chats yet. text someone or go touch snow.
                         </p>
                     ) : (
                         threads.map((thread) => (
                             <button
                                 key={thread.counterpart}
                                 type="button"
                                 onClick={() => handleThreadSelect(thread.counterpart)}
                                 className={`${styles.threadButton} ${
                                     thread.counterpart === activeCounterpart
                                         ? styles.threadButtonActive
                                         : ""
                                 }`}
                             >
                                 <span className={styles.threadName}>
                                     {thread.contactName ?? thread.counterpart}
                                 </span>
                                 <span className={styles.threadSnippet}>
                                     {thread.lastMessagePreview}
                                 </span>
                                 <span className={styles.threadTimestamp}>
                                     {new Date(
                                         thread.lastMessageTimestamp
                                     ).toLocaleTimeString()}
                                 </span>
                             </button>
                         ))
                     )}
                 </div>
                 <div className={styles.sidebarFooter}>
                     <button
                         type="button"
                         onClick={() => refreshThreads(false)}
                         className={styles.refreshThreadsButton}
                         disabled={isRefreshingThreads}
                     >
                         {isRefreshingThreads ? "scanning..." : "refresh threads"}
                     </button>
                 </div>
             </aside>
 
             <section className={styles.conversationPanel}>
                 <header className={styles.conversationHeader}>
                     {activeCounterpart ? (
                         <>
                             <div>
                                 <p className={styles.conversationTitle}>
                                     {currentContact?.displayName ??
                                         activeCounterpart ??
                                         "unnamed psyop"}
                                 </p>
                                 <p className={styles.conversationMeta}>
                                     {currentContact
                                         ? activeCounterpart
                                         : "raw number. assign an alias or keep living feral."}
                                 </p>
                             </div>
                             <button
                                 type="button"
                                 className={styles.aliasButton}
                                 onClick={toggleContactForm}
                             >
                                 {currentContact ? "rename alias" : "assign alias"}
                             </button>
                         </>
                     ) : (
                         <p className={styles.conversationPlaceholder}>
                             pick a thread or start a new one. the feds get lonely.
                         </p>
                     )}
                 </header>
 
                 {isContactFormVisible && activeCounterpart && (
                     <form className={styles.contactForm} onSubmit={handleContactSave}>
                         <label htmlFor="contact-name-input">
                             alias for {activeCounterpart}
                         </label>
                         <input
                             id="contact-name-input"
                             name="contactName"
                             value={contactNameInput}
                             onChange={(event) => setContactNameInput(event.target.value)}
                             placeholder="ex: doomscroll goblin"
                             required
                         />
                         <div className={styles.contactFormActions}>
                             <button
                                 type="submit"
                                 className={styles.primaryButton}
                                 disabled={isSavingContact}
                             >
                                 {isSavingContact ? "saving..." : "save alias"}
                             </button>
                             <button
                                 type="button"
                                 className={styles.refreshButton}
                                 onClick={() => setIsContactFormVisible(false)}
                             >
                                 cancel
                             </button>
                         </div>
                     </form>
                 )}
 
                 <MessageList
                     messages={activeMessages}
                     isLoading={isLoadingMessages}
                     contactName={currentContact?.displayName ?? null}
                     counterpart={activeCounterpart}
                 />
 
                 <form className={styles.composer} onSubmit={handleSubmit}>
                     {isComposingNewChat && (
                         <div className={styles.fieldGroup}>
                             <label htmlFor="new-chat-number">
                                 target number (e.164 or riot)
                             </label>
                             <input
                                 id="new-chat-number"
                                 name="newChatNumber"
                                 value={draftNumber}
                                 onChange={(event) => setDraftNumber(event.target.value)}
                                 placeholder="+1234567890"
                                 className={styles.input}
                                 required
                             />
                         </div>
                     )}
 
                     <div className={styles.fieldGroup}>
                         <label htmlFor="message-input">
                             payload (keep it under 1600 chars)
                         </label>
                         <textarea
                             id="message-input"
                             name="message"
                             value={messageBody}
                             onChange={(event) => setMessageBody(event.target.value)}
                             placeholder="tell the watchers how your day is going."
                             className={styles.textarea}
                             required
                             maxLength={1600}
                         />
                     </div>
 
                     <div className={styles.actions}>
                         <button
                             type="submit"
                             className={styles.primaryButton}
                             disabled={isSending}
                         >
                             {isSending ? "launching..." : "fire the text missile"}
                         </button>
                         <button
                             type="button"
                             className={styles.refreshButton}
                             onClick={() =>
                                 activeCounterpart
                                     ? loadMessages(activeCounterpart)
                                     : setErrorMessage(
                                           "pick a thread before refreshing, agent."
                                       )
                             }
                             disabled={isLoadingMessages}
                         >
                             {isLoadingMessages ? "syncing..." : "pull latest intel"}
                         </button>
                     </div>
 
                     {statusMessage && (
                         <p className={styles.feedback}>{statusMessage}</p>
                     )}
                     {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                 </form>
             </section>
        </div>
    );
}

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchThreads, fetchContacts } from "../../../lib/api";
import SMSInterface from "./components/SMSInterface/SMSInterface";
import type { ThreadSummary, Contact } from "../../../types/sms-messenger";

const queryKeys = {
  threads: ["sms-messenger", "threads"] as const,
  contacts: ["sms-messenger", "contacts"] as const,
};

export default function SMSMessenger(): JSX.Element {
  const { data: threadsData } = useQuery({
    queryKey: queryKeys.threads,
    queryFn: () => fetchThreads(),
  });

  const { data: contactsData } = useQuery({
    queryKey: queryKeys.contacts,
    queryFn: () => fetchContacts(),
  });

  const initialThreads: ThreadSummary[] = threadsData?.threads ?? [];
  const initialContacts: Contact[] = contactsData?.contacts ?? [];
  const initialCounterpart: string | null =
    initialThreads.length > 0 ? initialThreads[0].counterpart : null;

  return (
    <SMSInterface
      initialThreads={initialThreads}
      initialMessages={[]}
      initialContacts={initialContacts}
      initialCounterpart={initialCounterpart}
    />
  );
}


import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWhatsAppContact } from "../../../../../lib/api";
import styles from "./whatsapp-interface.module.css";

interface ContactFormProps {
  readonly initialPhoneNumber?: string;
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
}

export function ContactForm({
  initialPhoneNumber = "",
  onCancel,
  onSuccess,
}: ContactFormProps): React.JSX.Element {
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const createContactMutation = useMutation({
    mutationFn: async ({ phoneNumber, displayName }: { phoneNumber: string; displayName: string }) =>
      await createWhatsAppContact(phoneNumber, displayName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["whatsapp-messenger", "contacts"] });
      onSuccess();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (!phoneNumber.trim() || !displayName.trim()) {
      setError("Please fill in all fields");
      return;
    }
    createContactMutation.mutate({
      phoneNumber: phoneNumber.trim(),
      displayName: displayName.trim(),
    });
  };

  const handleCancel = (): void => {
    setPhoneNumber(initialPhoneNumber);
    setDisplayName("");
    setError(undefined);
    onCancel();
  };

  return (
    <div className={styles["contactForm"]}>
      <h3 className={styles["contactFormTitle"]}>Add Contact</h3>
      <form onSubmit={handleSubmit}>
        {error ? <div className={styles["error"]}>{error}</div> : undefined}
        <input
          type="tel"
          className={styles["contactInput"]}
          value={phoneNumber}
          onChange={(event) => {
            setPhoneNumber(event.target.value);
          }}
          placeholder="Phone number (E.164)"
          required
        />
        <input
          type="text"
          className={styles["contactInput"]}
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value);
          }}
          placeholder="Display name"
          required
        />
        <div className={styles["contactFormActions"]}>
          <button
            type="submit"
            className={styles["contactSubmitButton"]}
            disabled={createContactMutation.isPending}
          >
            {createContactMutation.isPending ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            className={styles["contactCancelButton"]}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


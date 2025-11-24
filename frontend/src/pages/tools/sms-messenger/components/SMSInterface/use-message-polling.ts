import { useState, useEffect, useRef, useCallback } from "react";
import { pollMessagesSince } from "../../../../../lib/api";
import type { MessagesSinceResponse } from "../../../../../types/sms-messenger";

const POLL_INTERVAL = 2000; // 2 seconds
const POLL_MAX_ATTEMPTS = 1000;

interface UseMessagePollingResult {
  readonly pollCounter: number;
  readonly lastPollTimestamp: number;
  readonly pollForUpdates: () => Promise<void>;
}

export function useMessagePolling(
  onPollResponse: (response: MessagesSinceResponse) => void
): UseMessagePollingResult {
  const [pollCounter, setPollCounter] = useState(0);
  const [lastPollTimestamp, setLastPollTimestamp] = useState(Date.now());
  const pollIntervalRef = useRef<number | undefined>(undefined);

  const pollForUpdates = useCallback(async () => {
    if (pollCounter >= POLL_MAX_ATTEMPTS) {
      return;
    }

    try {
      const response = await pollMessagesSince(lastPollTimestamp);
      onPollResponse(response);
      if (response.success && response.messages.length > 0) {
        setLastPollTimestamp(response.timestamp);
      }
      setPollCounter((previous) => previous + 1);
    } catch {
      setPollCounter((previous) => previous + 1);
    }
  }, [pollCounter, lastPollTimestamp, onPollResponse]);

  useEffect(() => {
    pollIntervalRef.current = globalThis.setInterval(() => {
      void pollForUpdates();
    }, POLL_INTERVAL);

    return (): void => {
      if (pollIntervalRef.current !== undefined) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollForUpdates]);

  return {
    pollCounter,
    lastPollTimestamp,
    pollForUpdates,
  };
}


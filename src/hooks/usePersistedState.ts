import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface UsePersistedStateOptions<T> {
  storageKey: string;
  serverUrl: string;
  defaultValue: T;
  serverKey?: string;
}

interface PersistedState<T> {
  value: T;
  setValue: (newValue: T) => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing state that persists to both localStorage and server
 * Handles synchronization between local and server state
 */
export function usePersistedState<T>({
  storageKey,
  serverUrl,
  defaultValue,
  serverKey = storageKey,
}: UsePersistedStateOptions<T>): PersistedState<T> {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const [serverState, setServerState] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial state from server
  useEffect(() => {
    let cancelled = false;

    axios
      .get<Record<string, unknown>>(serverUrl)
      .then((result) => {
        if (cancelled) return;

        const serverData = result.data;
        setServerState(serverData);

        // Sync server preference to local if they differ
        if (serverData[serverKey] && serverData[serverKey] !== value) {
          const serverValue = serverData[serverKey] as T;
          localStorage.setItem(storageKey, JSON.stringify(serverValue));
          setValue(serverValue);
        }

        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load preferences");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serverUrl, serverKey, storageKey]); // Intentionally exclude value to prevent loops

  // Save to server when value changes (after initial load)
  useEffect(() => {
    if (isLoading || !serverState) return;

    const updatedState = { ...serverState, [serverKey]: value };

    axios
      .put(serverUrl, updatedState)
      .then(() => {
        setServerState(updatedState);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to save preferences");
        // Don't revert local state - allow offline usage
      });
  }, [value, isLoading, serverUrl, serverKey]); // Intentionally exclude serverState to prevent loops

  const updateValue = useCallback((newValue: T) => {
    localStorage.setItem(storageKey, JSON.stringify(newValue));
    setValue(newValue);
  }, [storageKey]);

  return {
    value,
    setValue: updateValue,
    isLoading,
    error,
  };
}
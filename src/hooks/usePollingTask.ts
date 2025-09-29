import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

interface TaskStatus {
  id: string;
  status: "RUNNING" | "SUCCESS" | "ERROR" | "CANCELED";
  description?: string;
  progress?: {
    estimatedBytes?: number;
    processedBytes?: number;
    estimatedFiles?: number;
    processedFiles?: number;
  };
  error?: string;
}

interface UsePollingTaskOptions {
  /** Polling interval in milliseconds */
  interval?: number;
  /** Whether polling should start immediately */
  immediate?: boolean;
  /** Maximum number of poll attempts */
  maxAttempts?: number;
  /** Whether to stop polling when task completes */
  stopOnComplete?: boolean;
}

interface UsePollingTaskResult {
  /** Current task status */
  status: TaskStatus | null;
  /** Whether we're currently polling */
  isPolling: boolean;
  /** Any error that occurred */
  error: string | null;
  /** Start polling for a task */
  startPolling: (taskId: string) => void;
  /** Stop polling */
  stopPolling: () => void;
  /** Manually refresh status */
  refresh: () => Promise<void>;
}

/**
 * Custom hook for polling task status from the API
 * Handles cleanup, error states, and automatic stopping
 */
export function usePollingTask({
  interval = 1000,
  immediate = true,
  maxAttempts = 300, // 5 minutes at 1s intervals
  stopOnComplete = true,
}: UsePollingTaskOptions = {}): UsePollingTaskResult {
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCountRef = useRef(0);

  const fetchStatus = useCallback(async (): Promise<void> => {
    if (!taskIdRef.current) return;

    try {
      const response = await axios.get<TaskStatus>(`/api/v1/tasks/${taskIdRef.current}`);
      const taskStatus = response.data;

      setStatus(taskStatus);
      setError(null);
      attemptCountRef.current += 1;

      // Stop polling if task is complete and stopOnComplete is true
      if (stopOnComplete && taskStatus.status !== "RUNNING") {
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      // Stop polling if max attempts reached
      if (attemptCountRef.current >= maxAttempts) {
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setError("Maximum polling attempts reached");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch task status";
      setError(errorMessage);

      // Stop polling on error
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [maxAttempts, stopOnComplete]);

  const startPolling = useCallback((taskId: string): void => {
    // Clear any existing polling
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    taskIdRef.current = taskId;
    attemptCountRef.current = 0;
    setError(null);
    setIsPolling(true);

    // Start immediately if requested
    if (immediate) {
      fetchStatus();
    }

    // Set up interval polling
    intervalRef.current = setInterval(fetchStatus, interval);
  }, [fetchStatus, immediate, interval]);

  const stopPolling = useCallback((): void => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    status,
    isPolling,
    error,
    startPolling,
    stopPolling,
    refresh: fetchStatus,
  };
}
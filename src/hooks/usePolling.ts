import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  interval: number;
  enabled?: boolean;
  immediate?: boolean;
}

/**
 * Custom hook for polling functionality with automatic cleanup
 * @param callback - Function to execute on each poll
 * @param options - Polling configuration
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions,
): {
  start: () => void;
  stop: () => void;
  isPolling: boolean;
} {
  const { interval, enabled = true, immediate = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const isPollingRef = useRef(false);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  const start = useCallback(() => {
    if (!isMountedRef.current || isPollingRef.current) return;

    isPollingRef.current = true;

    const poll = async () => {
      if (!isMountedRef.current || !isPollingRef.current) return;

      try {
        await callback();
      } catch (error) {
        console.error("Polling callback error:", error);
      }

      if (isMountedRef.current && isPollingRef.current) {
        timeoutRef.current = setTimeout(poll, interval);
      }
    };

    if (immediate) {
      poll();
    } else {
      timeoutRef.current = setTimeout(poll, interval);
    }
  }, [callback, interval, immediate]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      start();
    }

    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [enabled, start, stop]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [stop]);

  return {
    start,
    stop,
    isPolling: isPollingRef.current,
  };
}

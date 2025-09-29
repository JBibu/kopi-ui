import { useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../contexts/AppContext';
import { usePolling } from './usePolling';
import { RepositoryStatus } from '../types/api';

/**
 * Custom hook for managing repository status with automatic polling
 */
export function useRepositoryStatus() {
  const appContext = useContext(AppContext);
  const [status, setStatus] = useState<RepositoryStatus>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async (): Promise<void> => {
    try {
      const result = await axios.get<RepositoryStatus>("/api/v1/repo/status");

      if (result?.data) {
        setStatus(result.data);
        setError(null);

        // Update the app context to reflect the successfully-loaded description
        if (appContext.repositoryDescriptionUpdated) {
          appContext.repositoryDescriptionUpdated(result.data.description);
        }
      }
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [appContext]);

  const fetchStatusWithSpinner = useCallback((): void => {
    setIsLoading(true);
    fetchStatus();
  }, [fetchStatus]);

  // Only poll if there's an active init task
  const shouldPoll = Boolean(status.initTaskID);

  usePolling(fetchStatus, {
    interval: 1000,
    enabled: shouldPoll,
    immediate: false,
  });

  const disconnect = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await axios.post("/api/v1/repo/disconnect", {});

      if (appContext.repositoryUpdated) {
        appContext.repositoryUpdated(false);
      }
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [appContext]);

  const updateDescription = useCallback(async (description: string): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await axios.post<{ description: string }>("/api/v1/repo/description", {
        description,
      });

      if (result && appContext.repositoryDescriptionUpdated) {
        appContext.repositoryDescriptionUpdated(result.data.description);
      }
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [appContext]);

  return {
    status,
    isLoading,
    error,
    fetchStatus: fetchStatusWithSpinner,
    disconnect,
    updateDescription,
    setStatus,
  };
}
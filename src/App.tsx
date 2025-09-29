import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios, { AxiosResponse } from "axios";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";

import { AppNavbar } from "./components/AppNavbar";
import { AppRoutes } from "./components/AppRoutes";
import { NotificationDisplay } from "./components/NotificationDisplay";

import { AppContext } from "./contexts/AppContext";
import { UIPreferenceProvider } from "./contexts/UIPreferencesContext";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorProvider } from "./contexts/ErrorContext";
import { LoadingProvider } from "./contexts/LoadingContext";

import { RepositoryStatus } from "./types/api";

import "./css/globals.css";
import "./css/App.css";

import { TasksSummaryResponse } from "./types/api";

// App Context Value Interface
interface AppContextValue {
  runningTaskCount: number;
  isFetching: boolean;
  repoDescription: string;
  isRepositoryConnected: boolean;
  fetchTaskSummary: () => Promise<void>;
  repositoryUpdated: (isConnected: boolean) => void;
  repositoryDescriptionUpdated: (description: string) => void;
  fetchInitialRepositoryDescription: () => Promise<void>;
}

// Main App Content Component that uses useNavigate
function AppContent(): React.JSX.Element {
  const navigate = useNavigate();
  const [runningTaskCount, setRunningTaskCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [repoDescription, setRepoDescription] = useState<string>("");
  const [isRepositoryConnected, setIsRepositoryConnected] = useState<boolean>(false);

  // Set up CSRF token on mount
  useEffect((): void => {
    const tok: HTMLMetaElement | null = document.head.querySelector<HTMLMetaElement>('meta[name="kopia-csrf-token"]');
    if (tok && tok.content) {
      axios.defaults.headers.common["X-Kopia-Csrf-Token"] = tok.content;
    } else {
      axios.defaults.headers.common["X-Kopia-Csrf-Token"] = "-";
    }
  }, []);

  // Memoized fetch functions to prevent unnecessary re-creations
  const fetchInitialRepositoryDescription = useCallback(async (): Promise<void> => {
    try {
      const result: AxiosResponse<RepositoryStatus> = await axios.get<RepositoryStatus>("/api/v1/repo/status");
      if (result?.data?.description) {
        setRepoDescription(result.data.description);
        setIsRepositoryConnected(result.data.connected);
      }
    } catch (error) {
      // Handle error silently as per original implementation
      console.error("Failed to fetch repository description:", error);
    }
  }, []);

  const fetchTaskSummary = useCallback(async (): Promise<void> => {
    if (isFetching) return;

    setIsFetching(true);
    try {
      const result: AxiosResponse<TasksSummaryResponse> =
        await axios.get<TasksSummaryResponse>("/api/v1/tasks-summary");

      if (result?.data) {
        setRunningTaskCount(result.data.RUNNING || 0);
      } else {
        setRunningTaskCount(-1);
      }
    } catch (error) {
      setRunningTaskCount(-1);
      console.error("Failed to fetch task summary:", error);
    }

    setIsFetching(false);
  }, [isFetching]);

  // Setup effects on mount
  useEffect((): (() => void) => {
    const av: HTMLElement | null = document.getElementById("appVersion");
    if (av) {
      // Show app version after mounting the component to avoid flashing of unstyled content
      av.style.display = "block";
    }

    fetchInitialRepositoryDescription();
    const taskSummaryInterval: NodeJS.Timeout = setInterval(fetchTaskSummary, 5000);

    return (): void => {
      clearInterval(taskSummaryInterval);
    };
  }, [fetchInitialRepositoryDescription, fetchTaskSummary]);

  // Context methods - these are called via AppContext
  const repositoryUpdated = useCallback(
    (isConnected: boolean): void => {
      setIsRepositoryConnected(isConnected);

      // Use a small delay to prevent rapid navigation calls
      setTimeout(() => {
        if (isConnected) {
          navigate("/snapshots");
        } else {
          navigate("/repo");
        }
      }, 100);
    },
    [navigate],
  );

  const repositoryDescriptionUpdated = useCallback((desc: string): void => {
    setRepoDescription(desc);
  }, []);

  // Create context value with memoized object to prevent unnecessary re-renders
  const contextValue: AppContextValue = useMemo(
    () => ({
      runningTaskCount,
      isFetching,
      repoDescription,
      isRepositoryConnected,
      fetchTaskSummary,
      repositoryUpdated,
      repositoryDescriptionUpdated,
      fetchInitialRepositoryDescription,
    }),
    [
      runningTaskCount,
      isFetching,
      repoDescription,
      isRepositoryConnected,
      fetchTaskSummary,
      repositoryUpdated,
      repositoryDescriptionUpdated,
      fetchInitialRepositoryDescription,
    ],
  );

  return (
    <ThemeProvider>
      <ErrorProvider>
        <LoadingProvider>
          <AppContext.Provider value={contextValue}>
            <UIPreferenceProvider>
              <AppNavbar />
              <AppRoutes />
              <NotificationDisplay position="top-right" />
            </UIPreferenceProvider>
          </AppContext.Provider>
        </LoadingProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
}

// Main App component with Router wrapper
export default function App(): React.JSX.Element {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

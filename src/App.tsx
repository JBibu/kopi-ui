import React, { useCallback, useMemo } from "react";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";

import { AppNavbar } from "./components/AppNavbar";
import { AppRoutes } from "./components/AppRoutes";
import { NotificationDisplay } from "./components/NotificationDisplay";

import { AppContext } from "./contexts/AppContext";
import { UIPreferenceProvider } from "./contexts/UIPreferencesContext";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorProvider } from "./contexts/ErrorContext";
import { LoadingProvider } from "./contexts/LoadingContext";

import { useTaskSummary } from "./hooks/useTaskSummary";
import { useRepositoryInfo } from "./hooks/useRepositoryInfo";
import { useCsrfSetup } from "./hooks/useCsrfSetup";
import { useAppInit } from "./hooks/useAppInit";
import { usePolling } from "./hooks/usePolling";

import "./css/globals.css";
import "./css/App.css";

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

  // Initialize app setup
  useCsrfSetup();
  useAppInit();

  // Use custom hooks for state management
  const { runningTaskCount, isFetching, fetchTaskSummary } = useTaskSummary();
  const {
    repoDescription,
    isRepositoryConnected,
    fetchRepositoryInfo,
    updateRepositoryDescription,
    updateRepositoryConnection
  } = useRepositoryInfo();

  // Set up polling for task summary
  usePolling(fetchTaskSummary, {
    interval: 5000,
    enabled: true,
    immediate: false,
  });

  // Initialize repository info on mount
  usePolling(fetchRepositoryInfo, {
    interval: 0, // Only run once
    enabled: true,
    immediate: true,
  });

  // Context methods - these are called via AppContext
  const repositoryUpdated = useCallback(
    (isConnected: boolean): void => {
      updateRepositoryConnection(isConnected);

      // Use a small delay to prevent rapid navigation calls
      setTimeout(() => {
        if (isConnected) {
          navigate("/snapshots");
        } else {
          navigate("/repo");
        }
      }, 100);
    },
    [navigate, updateRepositoryConnection],
  );

  const repositoryDescriptionUpdated = useCallback((desc: string): void => {
    updateRepositoryDescription(desc);
  }, [updateRepositoryDescription]);

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
      fetchInitialRepositoryDescription: fetchRepositoryInfo,
    }),
    [
      runningTaskCount,
      isFetching,
      repoDescription,
      isRepositoryConnected,
      fetchTaskSummary,
      repositoryUpdated,
      repositoryDescriptionUpdated,
      fetchRepositoryInfo,
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

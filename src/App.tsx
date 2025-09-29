import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosResponse } from "axios";
import { BrowserRouter as Router, NavLink, Navigate, Route, Routes } from "react-router-dom";

import { Navbar, NavbarBrand, NavbarLink } from "./components/ui/navbar";
import { ThemeSelector } from "./components/ThemeSelector";
import { NotificationDisplay } from "./components/NotificationDisplay";

import { Policy } from "./pages/Policy";
import { Preferences } from "./pages/Preferences";
import { Policies } from "./pages/Policies";
import { Repository } from "./pages/Repository";
import { Task } from "./pages/Task";
import { Tasks } from "./pages/Tasks";
import { Snapshots } from "./pages/Snapshots";
import { SnapshotCreate } from "./pages/SnapshotCreate";
import { SnapshotDirectory } from "./pages/SnapshotDirectory";
import { SnapshotHistory } from "./pages/SnapshotHistory";
import { SnapshotRestore } from "./pages/SnapshotRestore";
import { ComponentsDemo } from "./pages/ComponentsDemo";

import { AppContext } from "./contexts/AppContext";
import { UIPreferenceProvider } from "./contexts/UIPreferencesContext";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorProvider } from "./contexts/ErrorContext";
import { LoadingProvider } from "./contexts/LoadingContext";

import { RepositoryStatus } from "./types";

import "./css/globals.css";
import "./css/App.css";

// API Response Types specific to App component
interface TasksSummaryResponse {
  RUNNING?: number;
  SUCCESS?: number;
  FAILED?: number;
  CANCELED?: number;
}

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

export default function App(): React.JSX.Element {
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
      const result: AxiosResponse<TasksSummaryResponse> = await axios.get<TasksSummaryResponse>("/api/v1/tasks-summary");

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
  const repositoryUpdated = useCallback((isConnected: boolean): void => {
    setIsRepositoryConnected(isConnected);
    if (isConnected) {
      window.location.replace("/snapshots");
    } else {
      window.location.replace("/repo");
    }
  }, []);

  const repositoryDescriptionUpdated = useCallback((desc: string): void => {
    setRepoDescription(desc);
  }, []);

  // Create context value with memoized object
  const contextValue: AppContextValue = {
    runningTaskCount,
    isFetching,
    repoDescription,
    isRepositoryConnected,
    fetchTaskSummary,
    repositoryUpdated,
    repositoryDescriptionUpdated,
    fetchInitialRepositoryDescription,
  };

  return (
    <Router>
      <ThemeProvider>
        <ErrorProvider>
          <LoadingProvider>
            <AppContext.Provider value={contextValue}>
              <UIPreferenceProvider>
            <Navbar>
              <NavbarBrand to="/">
                <img src="/kopia-flat.svg" className="h-8 w-8" alt="Kopia logo" />
                <span className="text-lg font-semibold">Kopia</span>
              </NavbarBrand>

              {/* Left-aligned Navigation Links */}
              <div className="flex items-center space-x-1 ml-8">
                <NavbarLink
                  testId="tab-snapshots"
                  to="/snapshots"
                  disabled={!isRepositoryConnected}
                  title={!isRepositoryConnected ? "Repository is not connected" : ""}
                  className="font-bold"
                  aria-label="Snapshots page"
                >
                  Snapshots
                </NavbarLink>
                <NavbarLink
                  testId="tab-policies"
                  to="/policies"
                  disabled={!isRepositoryConnected}
                  title={!isRepositoryConnected ? "Repository is not connected" : ""}
                  className="font-bold"
                  aria-label="Policies page"
                >
                  Policies
                </NavbarLink>
                <NavbarLink
                  testId="tab-tasks"
                  to="/tasks"
                  disabled={!isRepositoryConnected}
                  title={!isRepositoryConnected ? "Repository is not connected" : ""}
                  className="font-bold"
                  aria-label={`Tasks page${runningTaskCount > 0 ? ` (${runningTaskCount} running)` : ''}`}
                >
                  Tasks
                  {runningTaskCount > 0 && (
                    <span className="ml-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full" aria-hidden="true">
                      {runningTaskCount}
                    </span>
                  )}
                </NavbarLink>
                <NavbarLink testId="tab-repo" to="/repo" className="font-bold" aria-label="Repository page">
                  Repository
                </NavbarLink>
                <NavbarLink testId="tab-preferences" to="/preferences" className="font-bold" aria-label="Preferences page">
                  Preferences
                </NavbarLink>
              </div>

              {/* Spacer to push right section to the right */}
              <div className="flex-1"></div>

              {/* Right Section: Repository Status + Theme Selector */}
              <div className="flex items-center gap-3">
                {repoDescription && (
                  <NavLink
                    to="/repo"
                    className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-background/50 border border-border/50 text-inherit no-underline hover:border-primary/50 hover:bg-accent/50"
                    aria-label={`Repository status: ${repoDescription}`}
                  >
                    <div
                      className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"
                      aria-hidden="true"
                    ></div>
                    <span className="text-xs font-bold text-foreground">
                      {repoDescription}
                    </span>
                  </NavLink>
                )}
                <ThemeSelector />
              </div>
            </Navbar>

            <main className="container mx-auto px-4 py-6 min-h-screen bg-background">
              <Routes>
                <Route path="snapshots" element={<Snapshots />} />
                <Route path="snapshots/new" element={<SnapshotCreate />} />
                <Route path="snapshots/single-source/" element={<SnapshotHistory />} />
                <Route path="snapshots/dir/:oid/restore" element={<SnapshotRestore />} />
                <Route path="snapshots/dir/:oid" element={<SnapshotDirectory />} />
                <Route path="policies/edit/" element={<Policy />} />
                <Route path="policies" element={<Policies />} />
                <Route path="tasks/:tid" element={<Task />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="repo" element={<Repository />} />
                <Route path="preferences" element={<Preferences />} />
                <Route path="components-demo" element={<ComponentsDemo />} />
                <Route path="/" element={<Navigate to="/snapshots" />} />
              </Routes>
            </main>
            <NotificationDisplay position="top-right" />
            </UIPreferenceProvider>
          </AppContext.Provider>
          </LoadingProvider>
        </ErrorProvider>
      </ThemeProvider>
    </Router>
  );
}
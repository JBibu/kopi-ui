import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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

import { AppContext } from "./contexts/AppContext";
import { UIPreferenceProvider } from "./contexts/UIPreferencesContext";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorProvider } from "./contexts/ErrorContext";

import "./css/globals.css";
import "./css/App.css";

export default function App() {
  const [runningTaskCount, setRunningTaskCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [repoDescription, setRepoDescription] = useState("");
  const [isRepositoryConnected, setIsRepositoryConnected] = useState(false);

  // Set up CSRF token on mount
  useEffect(() => {
    const tok = document.head.querySelector('meta[name="kopia-csrf-token"]');
    if (tok && tok.content) {
      axios.defaults.headers.common["X-Kopia-Csrf-Token"] = tok.content;
    } else {
      axios.defaults.headers.common["X-Kopia-Csrf-Token"] = "-";
    }
  }, []);

  // Memoized fetch functions to prevent unnecessary re-creations
  const fetchInitialRepositoryDescription = useCallback(async () => {
    const result = await axios.get("/api/v1/repo/status").catch(() => null);
    if (result?.data?.description) {
      setRepoDescription(result.data.description);
      setIsRepositoryConnected(result.data.connected);
    }
  }, []);

  const fetchTaskSummary = useCallback(async () => {
    if (isFetching) return;

    setIsFetching(true);
    const result = await axios.get("/api/v1/tasks-summary").catch(() => null);

    if (result?.data) {
      setRunningTaskCount(result.data["RUNNING"] || 0);
    } else {
      setRunningTaskCount(-1);
    }

    setIsFetching(false);
  }, [isFetching]);

  // Setup effects on mount
  useEffect(() => {
    const av = document.getElementById("appVersion");
    if (av) {
      // Show app version after mounting the component to avoid flashing of unstyled content
      av.style.display = "block";
    }

    fetchInitialRepositoryDescription();
    const taskSummaryInterval = setInterval(fetchTaskSummary, 5000);

    return () => {
      clearInterval(taskSummaryInterval);
    };
  }, [fetchInitialRepositoryDescription, fetchTaskSummary]);

  // Context methods - these are called via AppContext
  const repositoryUpdated = useCallback((isConnected) => {
    setIsRepositoryConnected(isConnected);
    if (isConnected) {
      window.location.replace("/snapshots");
    } else {
      window.location.replace("/repo");
    }
  }, []);

  const repositoryDescriptionUpdated = useCallback((desc) => {
    setRepoDescription(desc);
  }, []);

  // Create context value with memoized object
  const contextValue = {
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

            <main className="container mx-auto px-4 py-6">
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
                <Route path="/" element={<Navigate to="/snapshots" />} />
              </Routes>
            </main>
            <NotificationDisplay position="top-right" />
            </UIPreferenceProvider>
          </AppContext.Provider>
        </ErrorProvider>
      </ThemeProvider>
    </Router>
  );
}

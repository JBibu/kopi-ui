import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";

import { Policy } from "../pages/Policy";
import { Preferences } from "../pages/Preferences";
import { Policies } from "../pages/Policies";
import { Repository } from "../pages/Repository";
import { Task } from "../pages/Task";
import { Tasks } from "../pages/Tasks";
import { Snapshots } from "../pages/Snapshots";
import { SnapshotCreate } from "../pages/SnapshotCreate";
import { SnapshotDirectory } from "../pages/SnapshotDirectory";
import { SnapshotHistory } from "../pages/SnapshotHistory";
import { SnapshotRestore } from "../pages/SnapshotRestore";
import { ComponentsDemo } from "../pages/ComponentsDemo";

export function AppRoutes(): React.JSX.Element {
  return (
    <main className="container mx-auto px-4 py-6 min-h-screen bg-background">
      <ErrorBoundary>
        <Routes>
          <Route
            path="snapshots"
            element={
              <ErrorBoundary>
                <Snapshots />
              </ErrorBoundary>
            }
          />
          <Route
            path="snapshots/new"
            element={
              <ErrorBoundary>
                <SnapshotCreate />
              </ErrorBoundary>
            }
          />
          <Route
            path="snapshots/single-source/"
            element={
              <ErrorBoundary>
                <SnapshotHistory />
              </ErrorBoundary>
            }
          />
          <Route
            path="snapshots/dir/:oid/restore"
            element={
              <ErrorBoundary>
                <SnapshotRestore />
              </ErrorBoundary>
            }
          />
          <Route
            path="snapshots/dir/:oid"
            element={
              <ErrorBoundary>
                <SnapshotDirectory />
              </ErrorBoundary>
            }
          />
          <Route
            path="policies/edit/"
            element={
              <ErrorBoundary>
                <Policy />
              </ErrorBoundary>
            }
          />
          <Route
            path="policies"
            element={
              <ErrorBoundary>
                <Policies />
              </ErrorBoundary>
            }
          />
          <Route
            path="tasks/:tid"
            element={
              <ErrorBoundary>
                <Task />
              </ErrorBoundary>
            }
          />
          <Route
            path="tasks"
            element={
              <ErrorBoundary>
                <Tasks />
              </ErrorBoundary>
            }
          />
          <Route
            path="repo"
            element={
              <ErrorBoundary>
                <Repository />
              </ErrorBoundary>
            }
          />
          <Route
            path="preferences"
            element={
              <ErrorBoundary>
                <Preferences />
              </ErrorBoundary>
            }
          />
          <Route
            path="components-demo"
            element={
              <ErrorBoundary>
                <ComponentsDemo />
              </ErrorBoundary>
            }
          />
          <Route path="/" element={<Navigate to="/snapshots" />} />
        </Routes>
      </ErrorBoundary>
    </main>
  );
}

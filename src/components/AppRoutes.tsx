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

interface RouteWrapperProps {
  children: React.ReactNode;
}

function RouteWrapper({ children }: RouteWrapperProps): React.JSX.Element {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export function AppRoutes(): React.JSX.Element {
  return (
    <main className="container mx-auto px-4 py-6 min-h-screen bg-background">
      <ErrorBoundary>
        <Routes>
          <Route path="snapshots" element={<RouteWrapper><Snapshots /></RouteWrapper>} />
          <Route path="snapshots/new" element={<RouteWrapper><SnapshotCreate /></RouteWrapper>} />
          <Route path="snapshots/single-source/" element={<RouteWrapper><SnapshotHistory /></RouteWrapper>} />
          <Route path="snapshots/dir/:oid/restore" element={<RouteWrapper><SnapshotRestore /></RouteWrapper>} />
          <Route path="snapshots/dir/:oid" element={<RouteWrapper><SnapshotDirectory /></RouteWrapper>} />
          <Route path="policies/edit/" element={<RouteWrapper><Policy /></RouteWrapper>} />
          <Route path="policies" element={<RouteWrapper><Policies /></RouteWrapper>} />
          <Route path="tasks/:tid" element={<RouteWrapper><Task /></RouteWrapper>} />
          <Route path="tasks" element={<RouteWrapper><Tasks /></RouteWrapper>} />
          <Route path="repo" element={<RouteWrapper><Repository /></RouteWrapper>} />
          <Route path="preferences" element={<RouteWrapper><Preferences /></RouteWrapper>} />
          <Route path="components-demo" element={<RouteWrapper><ComponentsDemo /></RouteWrapper>} />
          <Route path="/" element={<Navigate to="/snapshots" />} />
        </Routes>
      </ErrorBoundary>
    </main>
  );
}

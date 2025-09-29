import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarLink } from './ui/navbar';
import { ThemeSelector } from './ThemeSelector';
import { AppContext } from '../contexts/AppContext';

export function AppNavbar(): React.JSX.Element {
  const { runningTaskCount, repoDescription, isRepositoryConnected } = useContext(AppContext);

  return (
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
            <span className="ml-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-full" aria-hidden="true">
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
  );
}
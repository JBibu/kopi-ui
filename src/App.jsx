import "./css/Theme.css";
import "./css/App.css";
import "./css/globals.css";
import axios from "axios";
import { React, Component } from "react";
import { BrowserRouter as Router, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Navbar, NavbarBrand, NavbarNav, NavbarLink } from "./components/ui/navbar";
import { ThemeSelector } from "./components/ThemeSelector";
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
import { ThemeProvider } from "./contexts/ThemeContext";

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      runningTaskCount: 0,
      isFetching: false,
      repoDescription: "",
      isRepositoryConnected: false,
    };

    this.fetchTaskSummary = this.fetchTaskSummary.bind(this);
    this.repositoryUpdated = this.repositoryUpdated.bind(this);
    this.repositoryDescriptionUpdated = this.repositoryDescriptionUpdated.bind(this);
    this.fetchInitialRepositoryDescription = this.fetchInitialRepositoryDescription.bind(this);

    const tok = document.head.querySelector('meta[name="kopia-csrf-token"]');
    if (tok && tok.content) {
      axios.defaults.headers.common["X-Kopia-Csrf-Token"] = tok.content;
    } else {
      axios.defaults.headers.common["X-Kopia-Csrf-Token"] = "-";
    }
  }

  componentDidMount() {
    const av = document.getElementById("appVersion");
    if (av) {
      // show app version after mounting the component to avoid flashing of unstyled content.
      av.style.display = "block";
    }

    this.fetchInitialRepositoryDescription();
    this.taskSummaryInterval = window.setInterval(this.fetchTaskSummary, 5000);
  }

  fetchInitialRepositoryDescription() {
    axios
      .get("/api/v1/repo/status")
      .then((result) => {
        if (result.data.description) {
          this.setState({
            repoDescription: result.data.description,
            isRepositoryConnected: result.data.connected,
          });
        }
      })
      .catch((_) => {
        /* ignore */
      });
  }

  fetchTaskSummary() {
    if (!this.state.isFetching) {
      this.setState({ isFetching: true });
      axios
        .get("/api/v1/tasks-summary")
        .then((result) => {
          this.setState({
            isFetching: false,
            runningTaskCount: result.data["RUNNING"] || 0,
          });
        })
        .catch((_) => {
          this.setState({ isFetching: false, runningTaskCount: -1 });
        });
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.taskSummaryInterval);
  }

  // this is invoked via AppContext whenever repository is connected, disconnected, etc.
  repositoryUpdated(isConnected) {
    this.setState({ isRepositoryConnected: isConnected });
    if (isConnected) {
      window.location.replace("/snapshots");
    } else {
      window.location.replace("/repo");
    }
  }

  repositoryDescriptionUpdated(desc) {
    this.setState({
      repoDescription: desc,
    });
  }

  render() {
    const { uiPrefs, runningTaskCount, isRepositoryConnected } = this.state;

    return (
      <Router>
        <ThemeProvider>
          <AppContext.Provider value={this}>
            <UIPreferenceProvider initalValue={uiPrefs}>
              <Navbar>
                <NavbarBrand to="/">
                  <img src="/kopia-flat.svg" className="h-8 w-8" alt="Kopia logo" />
                  <span className="text-lg font-semibold">Kopia</span>
                </NavbarBrand>
                <NavbarNav>
                  <NavbarLink
                    testId="tab-snapshots"
                    to="/snapshots"
                    disabled={!isRepositoryConnected}
                    title={!isRepositoryConnected ? "Repository is not connected" : ""}
                  >
                    Snapshots
                  </NavbarLink>
                  <NavbarLink
                    testId="tab-policies"
                    to="/policies"
                    disabled={!isRepositoryConnected}
                    title={!isRepositoryConnected ? "Repository is not connected" : ""}
                  >
                    Policies
                  </NavbarLink>
                  <NavbarLink
                    testId="tab-tasks"
                    to="/tasks"
                    disabled={!isRepositoryConnected}
                    title={!isRepositoryConnected ? "Repository is not connected" : ""}
                  >
                    Tasks
                    {runningTaskCount > 0 && (
                      <span className="ml-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                        {runningTaskCount}
                      </span>
                    )}
                  </NavbarLink>
                  <NavbarLink testId="tab-repo" to="/repo">
                    Repository
                  </NavbarLink>
                  <NavbarLink testId="tab-preferences" to="/preferences">
                    Preferences
                  </NavbarLink>
                  <div className="ml-auto">
                    <ThemeSelector />
                  </div>
                </NavbarNav>
              </Navbar>

            <main className="container mx-auto px-4 py-6">
              {this.state.repoDescription && (
                <NavLink to="/repo" className="block mb-6 text-inherit no-underline hover:text-primary">
                  <h2 className="text-xl font-semibold text-muted-foreground">
                    {this.state.repoDescription}
                  </h2>
                </NavLink>
              )}

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
          </UIPreferenceProvider>
        </AppContext.Provider>
        </ThemeProvider>
      </Router>
    );
  }
}

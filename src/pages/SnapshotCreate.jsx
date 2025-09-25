import axios from "axios";
import React, { Component } from "react";
import { Button } from "../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { handleChange } from "../forms";
import { PolicyEditor } from "../components/policy-editor/PolicyEditor";
import { SnapshotEstimation } from "../components/SnapshotEstimation";
import { RequiredDirectory } from "../forms/RequiredDirectory";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { errorAlert, redirect } from "../utils/uiutil";
import { GoBackButton } from "../components/GoBackButton";
import PropTypes from "prop-types";

class SnapshotCreateInternal extends Component {
  constructor() {
    super();
    this.state = {
      path: "",
      estimateTaskID: null,
      estimateTaskVisible: false,
      lastEstimatedPath: "",
      policyEditorVisibleFor: "n/a",
      localUsername: null,
    };

    this.policyEditorRef = React.createRef();
    this.handleChange = handleChange.bind(this);
    this.estimate = this.estimate.bind(this);
    this.snapshotNow = this.snapshotNow.bind(this);
    this.maybeResolveCurrentPath = this.maybeResolveCurrentPath.bind(this);
  }

  componentDidMount() {
    axios
      .get("/api/v1/sources")
      .then((result) => {
        this.setState({
          localUsername: result.data.localUsername,
          localHost: result.data.localHost,
        });
      })
      .catch((error) => {
        redirect(error);
      });
  }

  maybeResolveCurrentPath(lastResolvedPath) {
    const currentPath = this.state.path;

    if (lastResolvedPath !== currentPath) {
      if (this.state.path) {
        axios
          .post("/api/v1/paths/resolve", { path: currentPath })
          .then((result) => {
            this.setState({
              lastResolvedPath: currentPath,
              resolvedSource: result.data.source,
            });

            // check again, it's possible that this.state.path has changed
            // while we were resolving
            this.maybeResolveCurrentPath(currentPath);
          })
          .catch((error) => {
            redirect(error);
          });
      } else {
        this.setState({
          lastResolvedPath: currentPath,
          resolvedSource: "",
        });

        this.maybeResolveCurrentPath(currentPath);
      }
    }
  }

  componentDidUpdate() {
    this.maybeResolveCurrentPath(this.state.lastResolvedPath);

    if (this.state.estimateTaskVisible && this.state.lastEstimatedPath !== this.state.resolvedSource.path) {
      this.setState({
        estimateTaskVisible: false,
      });
    }
  }

  estimate(e) {
    e.preventDefault();

    if (!this.state.resolvedSource.path) {
      return;
    }

    const pe = this.policyEditorRef.current;
    if (!pe) {
      return;
    }

    try {
      let req = {
        root: this.state.resolvedSource.path,
        maxExamplesPerBucket: 10,
        policyOverride: pe.getAndValidatePolicy(),
      };

      axios
        .post("/api/v1/estimate", req)
        .then((result) => {
          this.setState({
            lastEstimatedPath: this.state.resolvedSource.path,
            estimateTaskID: result.data.id,
            estimatingPath: result.data.description,
            estimateTaskVisible: true,
            didEstimate: false,
          });
        })
        .catch((error) => {
          errorAlert(error);
        });
    } catch (e) {
      errorAlert(e);
    }
  }

  snapshotNow(e) {
    e.preventDefault();

    if (!this.state.resolvedSource.path) {
      alert("Must specify directory to snapshot.");
      return;
    }

    const pe = this.policyEditorRef.current;
    if (!pe) {
      return;
    }

    try {
      axios
        .post("/api/v1/sources", {
          path: this.state.resolvedSource.path,
          createSnapshot: true,
          policy: pe.getAndValidatePolicy(),
        })
        .then((_result) => {
          this.props.navigate(-1);
        })
        .catch((error) => {
          errorAlert(error);

          this.setState({
            error,
            isLoading: false,
          });
        });
    } catch (e) {
      errorAlert(e);
    }
  }

  render() {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6 flex items-center gap-2">
          <GoBackButton />
          <div>
            <h1 className="text-3xl font-bold">New Snapshot</h1>
            <p className="text-muted-foreground">Create a snapshot of your files</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              {RequiredDirectory(this, null, "path", {
                autoFocus: true,
                placeholder: "enter path to snapshot",
              })}
            </div>
            <div className="flex gap-2">
              <Button
                data-testid="estimate-now"
                size="sm"
                disabled={!this.state.resolvedSource?.path}
                title="Estimate"
                variant="secondary"
                onClick={this.estimate}
              >
                Estimate
              </Button>
              <Button
                data-testid="snapshot-now"
                size="sm"
                disabled={!this.state.resolvedSource?.path}
                title="Snapshot Now"
                variant="default"
                onClick={this.snapshotNow}
              >
                Snapshot Now
              </Button>
            </div>
          </div>
          {this.state.estimateTaskID && this.state.estimateTaskVisible && (
            <div className="bg-card border rounded-lg p-4">
              <SnapshotEstimation taskID={this.state.estimateTaskID} hideDescription={true} showZeroCounters={true} />
            </div>
          )}
          {this.state.resolvedSource && (
            <div className="bg-card border rounded-lg p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Snapshot Policy Settings</h2>
                <p className="text-sm text-muted-foreground mb-4">{this.state.resolvedSource ? this.state.resolvedSource.path : this.state.path}</p>
              </div>
              <PolicyEditor
                ref={this.policyEditorRef}
                embedded
                host={this.state.resolvedSource.host}
                userName={this.state.resolvedSource.userName}
                path={this.state.resolvedSource.path}
              />
            </div>
          )}
          <div className="pt-4">
            <CLIEquivalent
              command={`snapshot create ${this.state.resolvedSource ? this.state.resolvedSource.path : this.state.path}`}
            />
          </div>
        </div>
      </div>
    );
  }
}

SnapshotCreateInternal.propTypes = {
  navigate: PropTypes.func,
  location: PropTypes.object,
};

export function SnapshotCreate(props) {
  const navigate = useNavigate();
  const location = useLocation();

  return <SnapshotCreateInternal navigate={navigate} location={location} {...props} />;
}

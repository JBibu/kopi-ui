import axios, { AxiosError } from "axios";
import React, { useState, useEffect, useRef, useCallback, MutableRefObject } from "react";
import { Button } from "../components/ui/button";
import { useNavigate, useLocation, NavigateFunction, Location } from "react-router-dom";
import { PolicyEditor } from "../components/policy-editor/PolicyEditor";
import { SnapshotEstimation } from "../components/SnapshotEstimation";
import { RequiredDirectory } from "../forms/RequiredDirectory";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { errorAlert, redirect } from "../utils/uiutil";
import { GoBackButton } from "../components/GoBackButton";
import { SourcesResponse, Policy } from "../types";

interface SnapshotCreateState {
  path: string;
  estimateTaskID: string | null;
  estimateTaskVisible: boolean;
  lastEstimatedPath: string;
  policyEditorVisibleFor: string;
  localUsername: string | null;
  localHost?: string;
  lastResolvedPath: string;
  resolvedSource: {
    path: string;
    host: string;
    userName: string;
  } | null;
  estimatingPath?: string;
  didEstimate?: boolean;
  error?: Error;
  isLoading?: boolean;
}

interface SnapshotCreateInternalProps {
  navigate: NavigateFunction;
  location: Location;
}

interface ComponentRefType {
  state: SnapshotCreateState;
  setState: React.Dispatch<React.SetStateAction<SnapshotCreateState>>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>, valueGetter?: (target: HTMLInputElement) => string) => void;
}

interface PolicyEditorRef {
  getAndValidatePolicy: () => Policy;
}

function SnapshotCreateInternal({ navigate, location: _location }: SnapshotCreateInternalProps): JSX.Element {
  const [state, setState] = useState<SnapshotCreateState>({
    path: "",
    estimateTaskID: null,
    estimateTaskVisible: false,
    lastEstimatedPath: "",
    policyEditorVisibleFor: "n/a",
    localUsername: null,
    lastResolvedPath: "",
    resolvedSource: null,
  });

  const policyEditorRef: MutableRefObject<PolicyEditorRef | null> = useRef(null);

  // Create handleChange function that works with the form system
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, valueGetter = (x: HTMLInputElement) => x.value): void => {
    const fieldName = event.target.name;
    const fieldValue = valueGetter(event.target);
    setState(prevState => ({ ...prevState, [fieldName]: fieldValue }));
  }, []);

  // Create a component-like object for forms compatibility
  const componentRef: MutableRefObject<ComponentRefType> = useRef({
    state: state,
    setState: setState,
    handleChange: handleChange,
  });

  // Keep componentRef in sync with current state
  componentRef.current.state = state;
  componentRef.current.setState = setState;
  componentRef.current.handleChange = handleChange;

  // Setup effect on mount
  useEffect(() => {
    axios
      .get<SourcesResponse>("/api/v1/sources")
      .then((result) => {
        setState(prevState => ({
          ...prevState,
          localUsername: result.data.localUsername,
          localHost: result.data.localHost,
        }));
      })
      .catch((error: AxiosError) => {
        redirect(error);
      });
  }, []);

  const maybeResolveCurrentPath = useCallback((lastResolvedPath: string): void => {
    const currentPath = state.path;

    if (lastResolvedPath !== currentPath) {
      if (state.path) {
        axios
          .post<{ source: { path: string; host: string; userName: string } }>("/api/v1/paths/resolve", { path: currentPath })
          .then((result) => {
            setState(prevState => ({
              ...prevState,
              lastResolvedPath: currentPath,
              resolvedSource: result.data.source,
            }));

            // check again, it's possible that state.path has changed
            // while we were resolving
            maybeResolveCurrentPath(currentPath);
          })
          .catch((error: AxiosError) => {
            redirect(error);
          });
      } else {
        setState(prevState => ({
          ...prevState,
          lastResolvedPath: currentPath,
          resolvedSource: null,
        }));

        maybeResolveCurrentPath(currentPath);
      }
    }
  }, [state.path]);

  // Effect for path resolution and estimate visibility
  useEffect(() => {
    maybeResolveCurrentPath(state.lastResolvedPath);

    if (state.estimateTaskVisible && state.lastEstimatedPath !== state.resolvedSource?.path) {
      setState(prevState => ({
        ...prevState,
        estimateTaskVisible: false,
      }));
    }
  }, [maybeResolveCurrentPath, state.lastResolvedPath, state.estimateTaskVisible, state.lastEstimatedPath, state.resolvedSource?.path]);

  const estimate = useCallback((e: React.FormEvent): void => {
    e.preventDefault();

    if (!state.resolvedSource?.path) {
      return;
    }

    const pe = policyEditorRef.current;
    if (!pe) {
      return;
    }

    try {
      const req = {
        root: state.resolvedSource.path,
        maxExamplesPerBucket: 10,
        policyOverride: pe.getAndValidatePolicy(),
      };

      axios
        .post<{ id: string; description: string }>("/api/v1/estimate", req)
        .then((result) => {
          setState(prevState => ({
            ...prevState,
            lastEstimatedPath: state.resolvedSource?.path || "",
            estimateTaskID: result.data.id,
            estimatingPath: result.data.description,
            estimateTaskVisible: true,
            didEstimate: false,
          }));
        })
        .catch((error: AxiosError) => {
          errorAlert(error);
        });
    } catch (e) {
      errorAlert(e as Error);
    }
  }, [state.resolvedSource?.path]);

  const snapshotNow = useCallback((e: React.FormEvent): void => {
    e.preventDefault();

    if (!state.resolvedSource?.path) {
      alert("Must specify directory to snapshot.");
      return;
    }

    const pe = policyEditorRef.current;
    if (!pe) {
      return;
    }

    try {
      axios
        .post("/api/v1/sources", {
          path: state.resolvedSource.path,
          createSnapshot: true,
          policy: pe.getAndValidatePolicy(),
        })
        .then((_result) => {
          navigate(-1);
        })
        .catch((error: AxiosError) => {
          errorAlert(error);

          setState(prevState => ({
            ...prevState,
            error: error as Error,
            isLoading: false,
          }));
        });
    } catch (e) {
      errorAlert(e as Error);
    }
  }, [state.resolvedSource?.path, navigate]);

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
            {RequiredDirectory(componentRef.current, null, "path", {
              autoFocus: true,
              placeholder: "enter path to snapshot",
            })}
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="estimate-now"
              size="sm"
              disabled={!state.resolvedSource?.path}
              title="Estimate"
              variant="secondary"
              onClick={estimate}
            >
              Estimate
            </Button>
            <Button
              data-testid="snapshot-now"
              size="sm"
              disabled={!state.resolvedSource?.path}
              title="Snapshot Now"
              variant="default"
              onClick={snapshotNow}
            >
              Snapshot Now
            </Button>
          </div>
        </div>
        {state.estimateTaskID && state.estimateTaskVisible && (
          <div className="bg-card border rounded-lg p-4">
            <SnapshotEstimation taskID={state.estimateTaskID} hideDescription={true} showZeroCounters={true} />
          </div>
        )}
        {state.resolvedSource && (
          <div className="bg-card border rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Snapshot Policy Settings</h2>
              <p className="text-sm text-muted-foreground mb-4">{state.resolvedSource ? state.resolvedSource.path : state.path}</p>
            </div>
            <PolicyEditor
              ref={policyEditorRef}
              embedded
              host={state.resolvedSource.host}
              userName={state.resolvedSource.userName}
              path={state.resolvedSource.path}
            />
          </div>
        )}
        <div className="pt-4">
          <CLIEquivalent
            command={`snapshot create ${state.resolvedSource ? state.resolvedSource.path : state.path}`}
          />
        </div>
      </div>
    </div>
  );
}

export function SnapshotCreate(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  return <SnapshotCreateInternal navigate={navigate} location={location} />;
}
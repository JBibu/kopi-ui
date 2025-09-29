import { Copy } from "lucide-react";
import axios, { AxiosError } from "axios";
import React, { useState, useEffect } from "react";
import { useLocation, useParams, Location } from "react-router-dom";
import { Spinner } from "../components/ui/spinner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { DirectoryItems } from "../components/DirectoryItems";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { DirectoryBreadcrumbs } from "../components/DirectoryBreadcrumbs";
import { DirectoryEntry } from "../types";

interface SnapshotDirectoryState {
  items: DirectoryEntry[];
  isLoading: boolean;
  error: Error | null;
  mountInfo: {
    path?: string;
  };
  oid: string;
}

interface SnapshotDirectoryInternalProps {
  params: {
    oid: string;
  };
  location: Location;
}

// Extend the global Window interface for kopiaUI
declare global {
  interface Window {
    kopiaUI?: {
      browseDirectory: (path: string) => void;
    };
  }
}

function SnapshotDirectoryInternal({ params, location }: SnapshotDirectoryInternalProps): React.JSX.Element {
  const [state, setState] = useState<SnapshotDirectoryState>({
    items: [],
    isLoading: false,
    error: null,
    mountInfo: {},
    oid: "",
  });

  const fetchDirectory = (): void => {
    const oid = params.oid;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      oid: oid,
    }));

    axios
      .get<{ entries?: DirectoryEntry[] }>("/api/v1/objects/" + oid)
      .then((result) => {
        setState((prev) => ({
          ...prev,
          items: result.data.entries || [],
          isLoading: false,
        }));
      })
      .catch((error: AxiosError) =>
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        })),
      );

    axios
      .get<{ path?: string }>("/api/v1/mounts/" + oid)
      .then((result) => {
        setState((prev) => ({
          ...prev,
          mountInfo: result.data,
        }));
      })
      .catch((_error: AxiosError) =>
        setState((prev) => ({
          ...prev,
          mountInfo: {},
        })),
      );
  };

  useEffect(() => {
    fetchDirectory();
  }, [params.oid]);

  const mount = (): void => {
    axios
      .post<{ path?: string }>("/api/v1/mounts", { root: state.oid })
      .then((result) => {
        setState((prev) => ({
          ...prev,
          mountInfo: result.data,
        }));
      })
      .catch((_error: AxiosError) =>
        setState((prev) => ({
          ...prev,
          mountInfo: {},
        })),
      );
  };

  const unmount = (): void => {
    axios
      .delete("/api/v1/mounts/" + state.oid)
      .then((_result) => {
        setState((prev) => ({
          ...prev,
          mountInfo: {},
        }));
      })
      .catch((error: AxiosError) =>
        setState((prev) => ({
          ...prev,
          error: error as Error,
          mountInfo: {},
        })),
      );
  };

  const browseMounted = (): void => {
    if (!window.kopiaUI) {
      alert("Directory browsing is not supported in a web browser. Use Kopia UI.");
      return;
    }

    if (state.mountInfo.path) {
      window.kopiaUI.browseDirectory(state.mountInfo.path);
    }
  };

  const copyPath = (): void => {
    const el = document.querySelector(".mounted-path") as HTMLInputElement;
    if (!el) {
      return;
    }

    el.select();
    el.setSelectionRange(0, 99999);

    document.execCommand("copy");
  };

  const { items, isLoading, error } = state;
  if (error) {
    return <p>ERROR: {error.message}</p>;
  }
  if (isLoading) {
    return <Spinner animation="border" variant="primary" />;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <DirectoryBreadcrumbs />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Snapshot Contents</CardTitle>
          <CardDescription>Browse and restore files from this snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {state.mountInfo.path ? (
                <>
                  <Button size="sm" variant="secondary" onClick={unmount}>
                    Unmount
                  </Button>
                  {window.kopiaUI && (
                    <>
                      <Button size="sm" variant="secondary" onClick={browseMounted}>
                        Browse
                      </Button>
                    </>
                  )}
                  <input
                    readOnly={true}
                    className="border border-input bg-background px-3 py-1 text-sm rounded-md flex-1 min-w-0 mounted-path"
                    value={state.mountInfo.path}
                  />
                  <Button size="sm" variant="outline" onClick={copyPath} data-testid="copy-path-button">
                    <Copy className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="secondary" onClick={mount}>
                    Mount as Local Filesystem
                  </Button>
                </>
              )}
              <Button size="sm" variant="default" asChild>
                <a href={"/snapshots/dir/" + params.oid + "/restore"}>Restore Files & Directories</a>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              You can mount/restore all the files & directories that you see below or restore files individually.
            </div>
          </div>
          <div className="mb-4">
            <DirectoryItems items={items} historyState={location.state} />
          </div>
          <CLIEquivalent command={`snapshot list ${state.oid}`} />
        </CardContent>
      </Card>
    </div>
  );
}

export function SnapshotDirectory(): React.JSX.Element {
  const location = useLocation();
  const params = useParams<{ oid: string }>();

  if (!params.oid) {
    return <p>Error: No snapshot ID provided</p>;
  }

  return <SnapshotDirectoryInternal params={{ oid: params.oid }} location={location} {...props} />;
}

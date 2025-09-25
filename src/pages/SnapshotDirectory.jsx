import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Spinner } from "../components/ui/spinner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { DirectoryItems } from "../components/DirectoryItems";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { DirectoryBreadcrumbs } from "../components/DirectoryBreadcrumbs";
import PropTypes from "prop-types";

function SnapshotDirectoryInternal({ params, location }) {
  const [state, setState] = useState({
    items: [],
    isLoading: false,
    error: null,
    mountInfo: {},
    oid: "",
  });

  const fetchDirectory = () => {
    let oid = params.oid;

    setState(prev => ({
      ...prev,
      isLoading: true,
      oid: oid,
    }));

    axios
      .get("/api/v1/objects/" + oid)
      .then((result) => {
        setState(prev => ({
          ...prev,
          items: result.data.entries || [],
          isLoading: false,
        }));
      })
      .catch((error) =>
        setState(prev => ({
          ...prev,
          error,
          isLoading: false,
        })),
      );

    axios
      .get("/api/v1/mounts/" + oid)
      .then((result) => {
        setState(prev => ({
          ...prev,
          mountInfo: result.data,
        }));
      })
      .catch((_error) =>
        setState(prev => ({
          ...prev,
          mountInfo: {},
        })),
      );
  };

  useEffect(() => {
    fetchDirectory();
  }, [params.oid]);

  const mount = () => {
    axios
      .post("/api/v1/mounts", { root: state.oid })
      .then((result) => {
        setState(prev => ({
          ...prev,
          mountInfo: result.data,
        }));
      })
      .catch((_error) =>
        setState(prev => ({
          ...prev,
          mountInfo: {},
        })),
      );
  };

  const unmount = () => {
    axios
      .delete("/api/v1/mounts/" + state.oid)
      .then((_result) => {
        setState(prev => ({
          ...prev,
          mountInfo: {},
        }));
      })
      .catch((error) =>
        setState(prev => ({
          ...prev,
          error: error,
          mountInfo: {},
        })),
      );
  };

  const browseMounted = () => {
    if (!window.kopiaUI) {
      alert("Directory browsing is not supported in a web browser. Use Kopia UI.");
      return;
    }

    window.kopiaUI.browseDirectory(state.mountInfo.path);
  };

  const copyPath = () => {
    const el = document.querySelector(".mounted-path");
    if (!el) {
      return;
    }

    el.select();
    el.setSelectionRange(0, 99999);

    document.execCommand("copy");
  };

  let { items, isLoading, error } = state;
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
          <CardDescription>
            Browse and restore files from this snapshot
          </CardDescription>
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
                className="border border-input bg-background px-3 py-1 text-sm rounded-md flex-1 min-w-0"
                value={state.mountInfo.path}
              />
              <Button size="sm" variant="outline" onClick={copyPath} data-testid="copy-path-button">
                <FontAwesomeIcon icon={faCopy} />
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
            <a href={"/snapshots/dir/" + params.oid + "/restore"}>
              Restore Files & Directories
            </a>
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

SnapshotDirectoryInternal.propTypes = {
  params: PropTypes.shape({
    oid: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.any,
  }).isRequired,
};

export function SnapshotDirectory(props) {
  const location = useLocation();
  const params = useParams();

  return <SnapshotDirectoryInternal params={params} location={location} {...props} />;
}

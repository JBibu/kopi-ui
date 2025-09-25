import { faSync, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import moment from "moment";
import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from "react";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import KopiaTable from "../components/KopiaTable";
import { compare, formatOwnerName, sizeDisplayName } from "../utils/formatutils";
import { errorAlert, redirect, sizeWithFailures } from "../utils/uiutil";
import { policyEditorURL, sourceQueryStringParams } from "../utils/policyutil";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";

const localSnapshots = "Local Snapshots";
const allSnapshots = "All Snapshots";

export function Snapshots() {
  const { defaultSnapshotViewAll, setDefaultSnapshotViewAll, bytesStringBase2 } = useContext(UIPreferencesContext);

  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [localSourceName, setLocalSourceName] = useState("");
  const [multiUser, setMultiUser] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  const isFetchingRef = useRef(false);

  // Memoized fetch function
  const fetchSourcesWithoutSpinner = useCallback(async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    const result = await axios.get("/api/v1/sources").catch((error) => {
      redirect(error);
      setError(error);
      setIsRefreshing(false);
      isFetchingRef.current = false;
      setIsLoading(false);
      return null;
    });

    if (result?.data) {
      setLocalSourceName(result.data.localUsername + "@" + result.data.localHost);
      setMultiUser(result.data.multiUser);
      setSources(result.data.sources);
      setIsLoading(false);
      isFetchingRef.current = false;
      setIsRefreshing(false);
    }
  }, []);

  // Setup effect on mount
  useEffect(() => {
    setIsLoading(true);
    setSelectedOwner(defaultSnapshotViewAll ? allSnapshots : localSnapshots);
    fetchSourcesWithoutSpinner();

    const interval = setInterval(fetchSourcesWithoutSpinner, 3000);
    return () => clearInterval(interval);
  }, [defaultSnapshotViewAll, fetchSourcesWithoutSpinner]);

  // Memoized owner selection handler
  const selectOwner = useCallback((owner) => {
    setSelectedOwner(owner);
    if (owner === localSnapshots) {
      setDefaultSnapshotViewAll(false);
    } else if (owner === allSnapshots) {
      setDefaultSnapshotViewAll(true);
    }
  }, [setDefaultSnapshotViewAll]);

  // Memoized sync handler
  const sync = useCallback(async () => {
    setIsRefreshing(true);
    const result = await axios.post("/api/v1/repo/sync", {}).catch((error) => {
      errorAlert(error);
      setError(error);
      setIsRefreshing(false);
      return null;
    });

    if (result) {
      fetchSourcesWithoutSpinner();
    }
  }, [fetchSourcesWithoutSpinner]);

  // Memoized snapshot actions
  const startSnapshot = useCallback(async (source) => {
    const result = await axios
      .post("/api/v1/sources/upload?" + sourceQueryStringParams(source), {})
      .catch((error) => {
        errorAlert(error);
        return null;
      });

    if (result) {
      fetchSourcesWithoutSpinner();
    }
  }, [fetchSourcesWithoutSpinner]);

  // Memoized helper functions
  const setHeader = useCallback((x) => {
    switch (x.cell.getValue()) {
      case "IDLE":
      case "PAUSED":
        return (x.cell.column.Header = "Actions");
      case "PENDING":
      case "UPLOADING":
        return (x.cell.column.Header = "Status");
      default:
        return (x.cell.column.Header = "");
    }
  }, []);

  const statusCell = useCallback((x) => {
    setHeader(x);
    switch (x.cell.getValue()) {
      case "IDLE":
      case "PAUSED":
        return (
          <div className="flex gap-2">
            <Button
              data-testid="edit-policy"
              asChild
              variant="outline"
              size="sm"
              aria-label={`Edit policy for ${x.row.original.source.path}`}
            >
              <Link to={policyEditorURL(x.row.original.source)}>
                Policy
              </Link>
            </Button>
            <Button
              data-testid="snapshot-now"
              variant="default"
              size="sm"
              onClick={() => startSnapshot(x.row.original.source)}
              aria-label={`Create snapshot now for ${x.row.original.source.path}`}
            >
              Snapshot Now
            </Button>
          </div>
        );

      case "PENDING":
        return (
          <div className="flex items-center" role="status" aria-live="polite">
            <Spinner
              data-testid="snapshot-pending"
              size="sm"
              title="Snapshot will start after the previous snapshot completes"
              className="mr-2"
            />
            Pending
          </div>
        );

      case "UPLOADING": {
        let u = x.row.original.upload;
        let title = "";
        let totals = "";
        if (u) {
          title =
            ` hashed ${u.hashedFiles} files (${sizeDisplayName(u.hashedBytes, bytesStringBase2)})\n` +
            ` cached ${u.cachedFiles} files (${sizeDisplayName(u.cachedBytes, bytesStringBase2)})\n` +
            ` dir ${u.directory}`;

          const totalBytes = u.hashedBytes + u.cachedBytes;
          totals = sizeDisplayName(totalBytes, bytesStringBase2);

          if (u.estimatedBytes) {
            totals += "/" + sizeDisplayName(u.estimatedBytes, bytesStringBase2);
            const percent = Math.round((totalBytes * 1000.0) / u.estimatedBytes) / 10.0;
            if (percent <= 100) {
              totals += ` ${percent}%`;
            }
          }
        }

        return (
          <div className="flex items-center gap-2" role="status" aria-live="polite">
            <Spinner
              data-testid="snapshot-uploading"
              size="sm"
              title={title}
            />
            <span>{totals}</span>
            {x.row.original.currentTask && (
              <Link
                to={"/tasks/" + x.row.original.currentTask}
                className="text-primary hover:underline"
                aria-label="View task details"
              >
                Details
              </Link>
            )}
          </div>
        );
      }

      default:
        return "";
    }
  }, [bytesStringBase2, setHeader, startSnapshot]);

  const nextSnapshotTimeCell = useCallback((x) => {
    if (!x.cell.getValue()) {
      if (x.row.original.status === "PAUSED") {
        return <span className="text-muted-foreground">paused</span>;
      }
      return "";
    }

    if (x.row.original.status === "UPLOADING") {
      return "";
    }

    const time = moment(x.cell.getValue());
    const isOverdue = time.isBefore(moment());

    return (
      <div title={time.toLocaleString()}>
        <span>{time.fromNow()}</span>
        {isOverdue && (
          <>
            {" "}
            <Badge variant="secondary">overdue</Badge>
          </>
        )}
      </div>
    );
  }, []);

  // Memoized calculations
  const uniqueOwners = useMemo(() => {
    const owners = sources.reduce((a, d) => {
      const owner = formatOwnerName(d.source);
      if (!a.includes(owner)) {
        a.push(owner);
      }
      return a;
    }, []);
    return owners.sort();
  }, [sources]);

  const filteredSources = useMemo(() => {
    switch (selectedOwner) {
      case allSnapshots:
        return sources;
      case localSnapshots:
        return sources.filter((x) => formatOwnerName(x.source) === localSourceName);
      default:
        return sources.filter((x) => formatOwnerName(x.source) === selectedOwner);
    }
  }, [sources, selectedOwner, localSourceName]);

  const columns = useMemo(() => [
    {
      id: "path",
      header: "Path",
      accessorFn: (x) => x.source,
      sortType: (a, b) => {
        const v = compare(a.original.source.path, b.original.source.path);
        if (v !== 0) {
          return v;
        }
        return compare(formatOwnerName(a.original.source), formatOwnerName(b.original.source));
      },
      width: "",
      cell: (x) => (
        <Link
          to={"/snapshots/single-source?" + sourceQueryStringParams(x.cell.getValue())}
          className="text-primary hover:underline"
          aria-label={`View snapshots for ${x.cell.getValue().path}`}
        >
          {x.cell.getValue().path}
        </Link>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      accessorFn: (x) => x.source.userName + "@" + x.source.host,
      width: 250,
    },
    {
      id: "lastSnapshotSize",
      header: "Size",
      width: 120,
      accessorFn: (x) => (x.lastSnapshot ? x.lastSnapshot.stats.totalSize : 0),
      cell: (x) =>
        sizeWithFailures(
          x.cell.getValue(),
          x.row.original.lastSnapshot && x.row.original.lastSnapshot.rootEntry
            ? x.row.original.lastSnapshot.rootEntry.summ
            : null,
          bytesStringBase2,
        ),
    },
    {
      id: "lastSnapshotTime",
      header: "Last Snapshot",
      width: 160,
      accessorFn: (x) => (x.lastSnapshot ? x.lastSnapshot.startTime : null),
      cell: (x) =>
        x.cell.getValue() ? (
          <div title={moment(x.cell.getValue()).toLocaleString()}>
            {moment(x.cell.getValue()).fromNow()}
          </div>
        ) : (
          <span className="text-muted-foreground">None</span>
        ),
    },
    {
      id: "nextSnapshotTime",
      header: "Next Snapshot",
      width: 160,
      accessorFn: (x) => x.nextSnapshotTime,
      cell: nextSnapshotTimeCell,
    },
    {
      id: "status",
      header: "",
      width: 300,
      accessorFn: (x) => x.status,
      cell: statusCell,
    },
  ], [bytesStringBase2, nextSnapshotTimeCell, statusCell]);

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-red-600 text-sm" role="alert">
          Error: {error.message}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner size="sm" />
          Loading snapshots...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Snapshots</h1>
        <p className="text-muted-foreground">View and manage your snapshots</p>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {multiUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label="Select snapshot owner"
                  >
                    <FontAwesomeIcon icon={faUserFriends} className="mr-2" />
                    {selectedOwner}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => selectOwner(localSnapshots)}>
                    {localSnapshots}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => selectOwner(allSnapshots)}>
                    {allSnapshots}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {uniqueOwners.map((v) => (
                    <DropdownMenuItem key={v} onClick={() => selectOwner(v)}>
                      {v}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button data-testid="new-snapshot" size="sm" asChild>
              <Link to="/snapshots/new" aria-label="Create new snapshot">
                New Snapshot
              </Link>
            </Button>
          </div>
          <Button
            size="sm"
            title="Synchronize repository"
            variant="outline"
            onClick={sync}
            disabled={isRefreshing}
            aria-label="Synchronize repository"
          >
            {isRefreshing ? (
              <Spinner size="sm" />
            ) : (
              <FontAwesomeIcon icon={faSync} />
            )}
          </Button>
        </div>

        <KopiaTable data={filteredSources} columns={columns} />
      </div>

      <CLIEquivalent command="snapshot list" />
    </div>
  );
}

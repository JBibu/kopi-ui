import { faSync, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError } from "axios";
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
import { Source, SourcesResponse, KopiaTableColumn } from "../types";

const localSnapshots = "Local Snapshots";
const allSnapshots = "All Snapshots";

interface UploadProgress {
  hashedFiles: number;
  hashedBytes: number;
  cachedFiles: number;
  cachedBytes: number;
  directory: string;
  estimatedBytes?: number;
}

interface SourceWithUpload extends Source {
  upload?: UploadProgress;
  currentTask?: string;
}

export function Snapshots(): React.JSX.Element {
  const { defaultSnapshotViewAll, setDefaultSnapshotViewAll, bytesStringBase2 } = useContext(UIPreferencesContext);

  const [sources, setSources] = useState<SourceWithUpload[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [localSourceName, setLocalSourceName] = useState<string>("");
  const [multiUser, setMultiUser] = useState<boolean>(false);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);

  const isFetchingRef = useRef<boolean>(false);

  // Memoized fetch function
  const fetchSourcesWithoutSpinner = useCallback(async (): Promise<void> => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    const result = await axios.get<SourcesResponse>("/api/v1/sources").catch((error: AxiosError) => {
      redirect(error);
      setError(error as Error);
      setIsRefreshing(false);
      isFetchingRef.current = false;
      setIsLoading(false);
      return null;
    });

    if (result?.data) {
      setLocalSourceName(result.data.localUsername + "@" + result.data.localHost);
      setMultiUser(result.data.sources.length > 1);
      setSources(result.data.sources as SourceWithUpload[]);
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
  const selectOwner = useCallback((owner: string): void => {
    setSelectedOwner(owner);
    if (owner === localSnapshots) {
      setDefaultSnapshotViewAll(false);
    } else if (owner === allSnapshots) {
      setDefaultSnapshotViewAll(true);
    }
  }, [setDefaultSnapshotViewAll]);

  // Memoized sync handler
  const sync = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    const result = await axios.post("/api/v1/repo/sync", {}).catch((error: AxiosError) => {
      errorAlert(error);
      setError(error as Error);
      setIsRefreshing(false);
      return null;
    });

    if (result) {
      fetchSourcesWithoutSpinner();
    }
  }, [fetchSourcesWithoutSpinner]);

  // Memoized snapshot actions
  const startSnapshot = useCallback(async (source: Source['source']): Promise<void> => {
    const result = await axios
      .post("/api/v1/sources/upload?" + sourceQueryStringParams(source), {})
      .catch((error: AxiosError) => {
        errorAlert(error);
        return null;
      });

    if (result) {
      fetchSourcesWithoutSpinner();
    }
  }, [fetchSourcesWithoutSpinner]);

  // Memoized helper functions
  const setHeader = useCallback((x: any): string => {
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

  const statusCell = useCallback(({ row, cell }: { row: { original: SourceWithUpload }; cell: { getValue: () => string } }): React.ReactElement => {
    setHeader({ cell });
    switch (cell.getValue()) {
      case "IDLE":
      case "PAUSED":
        return (
          <div className="flex gap-2">
            <Button
              data-testid="edit-policy"
              asChild
              variant="outline"
              size="sm"
              aria-label={`Edit policy for ${row.original.source.path}`}
            >
              <Link to={policyEditorURL(row.original.source)}>
                Policy
              </Link>
            </Button>
            <Button
              data-testid="snapshot-now"
              variant="default"
              size="sm"
              onClick={() => startSnapshot(row.original.source)}
              aria-label={`Create snapshot now for ${row.original.source.path}`}
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
              className="mr-2"
            />
            Pending
          </div>
        );

      case "UPLOADING": {
        let u = row.original.upload;
        let totals = "";
        if (u) {
          // title calculation removed as it's no longer used

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
            />
            <span>{totals}</span>
            {row.original.currentTask && (
              <Link
                to={"/tasks/" + row.original.currentTask}
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
        return <></>;
    }
  }, [bytesStringBase2, setHeader, startSnapshot]);

  const nextSnapshotTimeCell = useCallback(({ row, cell }: { row: { original: SourceWithUpload }; cell: { getValue: () => string | null } }): React.ReactElement => {
    if (!cell.getValue()) {
      if (row.original.status === "PAUSED") {
        return <span className="text-muted-foreground">paused</span>;
      }
      return <></>;
    }

    if (row.original.status === "UPLOADING") {
      return <></>;
    }

    const time = moment(cell.getValue());
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
  const uniqueOwners = useMemo((): string[] => {
    const owners = sources.reduce<string[]>((a, d) => {
      const owner = formatOwnerName(d.source);
      if (!a.includes(owner)) {
        a.push(owner);
      }
      return a;
    }, []);
    return owners.sort();
  }, [sources]);

  const filteredSources = useMemo((): SourceWithUpload[] => {
    switch (selectedOwner) {
      case allSnapshots:
        return sources;
      case localSnapshots:
        return sources.filter((x) => formatOwnerName(x.source) === localSourceName);
      default:
        return sources.filter((x) => formatOwnerName(x.source) === selectedOwner);
    }
  }, [sources, selectedOwner, localSourceName]);

  const columns: KopiaTableColumn<SourceWithUpload>[] = useMemo(() => [
    {
      id: "path",
      header: "Path",
      accessorFn: (x: SourceWithUpload) => x.source,
      sortType: (a: any, b: any) => {
        const v = compare(a.original.source.path, b.original.source.path);
        if (v !== 0) {
          return v;
        }
        return compare(formatOwnerName(a.original.source), formatOwnerName(b.original.source));
      },
      width: "",
      cell: ({ cell }) => (
        <Link
          to={"/snapshots/single-source?" + sourceQueryStringParams(cell.getValue())}
          className="text-primary hover:underline"
          aria-label={`View snapshots for ${cell.getValue().path}`}
        >
          {cell.getValue().path}
        </Link>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      accessorFn: (x: SourceWithUpload) => x.source.userName + "@" + x.source.host,
      width: 250,
    },
    {
      id: "lastSnapshotSize",
      header: "Size",
      width: 120,
      accessorFn: (x: SourceWithUpload) => (x.lastSnapshot?.summary?.size ?? 0),
      cell: ({ row, cell }) =>
        sizeWithFailures(
          cell.getValue() as number,
          row.original.lastSnapshot?.summary as any,
          bytesStringBase2,
        ),
    },
    {
      id: "lastSnapshotTime",
      header: "Last Snapshot",
      width: 160,
      accessorFn: (x: SourceWithUpload) => x.lastSnapshot?.startTime ?? null,
      cell: ({ cell }) =>
        cell.getValue() ? (
          <div title={moment(cell.getValue()).toLocaleString()}>
            {moment(cell.getValue()).fromNow()}
          </div>
        ) : (
          <span className="text-muted-foreground">None</span>
        ),
    },
    {
      id: "nextSnapshotTime",
      header: "Next Snapshot",
      width: 160,
      accessorFn: (x: SourceWithUpload) => x.nextSnapshotTime,
      cell: nextSnapshotTimeCell,
    },
    {
      id: "status",
      header: "",
      width: 300,
      accessorFn: (x: SourceWithUpload) => x.status,
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
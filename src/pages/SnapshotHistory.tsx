import axios, { AxiosError } from "axios";
import React, { useState, useEffect, useContext, useCallback, ChangeEvent } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Spinner } from "../components/ui/spinner";
import { Badge } from "../components/ui/badge";
import { Link, useNavigate, useLocation, Location, NavigateFunction } from "react-router-dom";
import KopiaTable from "../components/KopiaTable";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { compare, objectLink, parseQuery, rfc3339TimestampForDisplay } from "../utils/formatutils";
import { errorAlert, redirect, sizeWithFailures } from "../utils/uiutil";
import { sourceQueryStringParams } from "../utils/policyutil";
import { GoBackButton } from "../components/GoBackButton";
import { RefreshCw, Pin, File } from "lucide-react";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { Snapshot, SnapshotsResponse } from "../types";
import { KopiaTableColumn } from "../types/props";

// Types for the pill variant function
type PillVariant = "success" | "info" | "danger" | "secondary" | "warning" | "primary";

function pillVariant(tag: string): PillVariant {
  if (tag.startsWith("latest-")) {
    return "success";
  }
  if (tag.startsWith("daily-")) {
    return "info";
  }
  if (tag.startsWith("weekly-")) {
    return "danger";
  }
  if (tag.startsWith("monthly-")) {
    return "secondary";
  }
  if (tag.startsWith("annual-")) {
    return "warning";
  }
  return "primary";
}

// Types for component props
interface SnapshotHistoryInternalProps {
  location: Location;
  navigate: NavigateFunction;
}

// Types for selected snapshots state
interface SelectedSnapshotManifestIDs {
  [key: string]: boolean;
}

// Types for API requests
interface DeleteSnapshotsRequest {
  source: {
    host: string;
    userName: string;
    path: string;
  };
  snapshotManifestIds?: string[];
  deleteSourceAndPolicy: boolean;
}

interface EditSnapshotsRequest {
  snapshots: string[];
  description?: string;
  addPins?: string[];
  removePins?: string[];
}

// Types for URL query parameters
interface QueryParams {
  host: string;
  userName: string;
  path: string;
}

function SnapshotHistoryInternal({ location, navigate }: SnapshotHistoryInternalProps): React.JSX.Element {
  // State hooks
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [showHidden, setShowHidden] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [selectedSnapshotManifestIDs, setSelectedSnapshotManifestIDs] = useState<SelectedSnapshotManifestIDs>({});

  // Additional state for various dialogs and data
  const [host, setHost] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [path, setPath] = useState<string>('');
  const [_hiddenCount, setHiddenCount] = useState<number>(0);
  const [_selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [unfilteredCount, setUnfilteredCount] = useState<number>(0);
  const [uniqueCount, setUniqueCount] = useState<number>(0);

  // Delete confirmation dialog state
  const [alsoDeleteSource, setAlsoDeleteSource] = useState<boolean>(false);
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] = useState<boolean>(false);

  // Description editing state
  const [editingDescriptionFor, setEditingDescriptionFor] = useState<string[] | undefined>(undefined);
  const [updatedSnapshotDescription, setUpdatedSnapshotDescription] = useState<string>('');
  const [originalSnapshotDescription, setOriginalSnapshotDescription] = useState<string>('');

  // Pin editing state
  const [editPinFor, setEditPinFor] = useState<string[] | undefined>(undefined);
  const [originalPinName, setOriginalPinName] = useState<string>('');
  const [newPinName, setNewPinName] = useState<string>('');
  const [savingSnapshot, setSavingSnapshot] = useState<boolean>(false);

  const { bytesStringBase2 } = useContext(UIPreferencesContext);

  const selectAll = useCallback((): void => {
    const snapIds: SelectedSnapshotManifestIDs = {};
    for (const sn of snapshots) {
      snapIds[sn.id] = true;
    }
    setSelectedSnapshotManifestIDs(snapIds);
  }, [snapshots]);

  const deselectAll = useCallback((): void => {
    setSelectedSnapshotManifestIDs({});
  }, []);

  const isSelected = useCallback((snap: Snapshot): boolean => {
    return !!selectedSnapshotManifestIDs[snap.id];
  }, [selectedSnapshotManifestIDs]);

  const toggleSelected = useCallback((snap: Snapshot): void => {
    setSelectedSnapshotManifestIDs(prev => {
      const sel = { ...prev };
      if (sel[snap.id]) {
        delete sel[snap.id];
      } else {
        sel[snap.id] = true;
      }
      return sel;
    });
  }, []);

  const showDeleteConfirm = useCallback((): void => {
    setAlsoDeleteSource(false);
    setShowDeleteConfirmationDialog(true);
  }, []);

  const fetchSnapshots = useCallback((): void => {
    const q = parseQuery(location.search) as QueryParams;

    setIsRefreshing(true);
    setHost(q.host);
    setUserName(q.userName);
    setPath(q.path);
    setHiddenCount(0);
    setSelectedSnapshot(null);

    let u = "/api/v1/snapshots?" + sourceQueryStringParams(q);

    if (showHidden) {
      u += "&all=1";
    }

    axios
      .get<SnapshotsResponse>(u)
      .then((result) => {
        setSnapshots(result.data.snapshots);
        setSelectedSnapshotManifestIDs({});
        setUnfilteredCount(result.data.unfilteredCount);
        setUniqueCount(result.data.uniqueCount);
        setIsLoading(false);
        setIsRefreshing(false);
      })
      .catch((error: AxiosError) => {
        setError(error);
        setIsLoading(false);
        setIsRefreshing(false);
      });
  }, [location.search, showHidden]);

  const deleteSelectedSnapshots = useCallback((): void => {
    const req: DeleteSnapshotsRequest = {
      source: {
        host,
        userName,
        path,
      },
      snapshotManifestIds: [],
      deleteSourceAndPolicy: alsoDeleteSource,
    };

    for (const id in selectedSnapshotManifestIDs) {
      req.snapshotManifestIds!.push(id);
    }

    axios
      .post("/api/v1/snapshots/delete", req)
      .then((_result) => {
        if (req.deleteSourceAndPolicy) {
          navigate(-1);
        } else {
          fetchSnapshots();
        }
      })
      .catch((error: AxiosError) => {
        redirect(error);
        errorAlert(error);
      });

    setShowDeleteConfirmationDialog(false);
  }, [host, userName, path, alsoDeleteSource, selectedSnapshotManifestIDs, navigate, fetchSnapshots]);

  const deleteSnapshotSource = useCallback((): void => {
    const req: DeleteSnapshotsRequest = {
      source: {
        host,
        userName,
        path,
      },
      deleteSourceAndPolicy: true,
    };

    axios
      .post("/api/v1/snapshots/delete", req)
      .then((_result) => {
        navigate(-1);
      })
      .catch((error: AxiosError) => {
        redirect(error);
        errorAlert(error);
      });
  }, [host, userName, path, navigate]);

  const cancelDelete = useCallback((): void => {
    setShowDeleteConfirmationDialog(false);
  }, []);

  const _selectSnapshot = useCallback((x: Snapshot): void => {
    setSelectedSnapshot(x);
  }, []);

  const _toggleShowHidden = useCallback((x: ChangeEvent<HTMLInputElement>): void => {
    setShowHidden(x.target.checked);
  }, []);

  const cancelSnapshotDescription = useCallback((): void => {
    setEditingDescriptionFor(undefined);
  }, []);

  const editSnapshots = useCallback((req: EditSnapshotsRequest): void => {
    setSavingSnapshot(true);
    axios
      .post("/api/v1/snapshots/edit", req)
      .then((_resp) => {
        setEditPinFor(undefined);
        setEditingDescriptionFor(undefined);
        setSavingSnapshot(false);
        fetchSnapshots();
      })
      .catch((e: AxiosError) => {
        setEditPinFor(undefined);
        setEditingDescriptionFor(undefined);
        setSavingSnapshot(false);
        redirect(e);
        errorAlert(e);
      });
  }, [fetchSnapshots]);

  const removeSnapshotDescription = useCallback((): void => {
    if (editingDescriptionFor) {
      editSnapshots({
        snapshots: editingDescriptionFor,
        description: "",
      });
    }
  }, [editSnapshots, editingDescriptionFor]);

  const saveSnapshotDescription = useCallback((): void => {
    if (editingDescriptionFor) {
      editSnapshots({
        snapshots: editingDescriptionFor,
        description: updatedSnapshotDescription,
      });
    }
  }, [editSnapshots, editingDescriptionFor, updatedSnapshotDescription]);

  const descriptionFor = useCallback((x: Snapshot): React.JSX.Element => {
    return (
      <a
        href="#top"
        onClick={(event) => {
          event.preventDefault();
          setEditingDescriptionFor([x.id]);
          setUpdatedSnapshotDescription(x.description || '');
          setOriginalSnapshotDescription(x.description || '');
        }}
        title={(x.description || '') + " - Click to update snapshot description."}
        className={x.description ? "snapshot-description-set" : "snapshot-description"}
      >
        <b>
          <File className="h-4 w-4" />
        </b>
      </a>
    );
  }, []);

  const newPinFor = useCallback((x: Snapshot): React.JSX.Element => {
    return (
      <a
        href="#top"
        onClick={(event) => {
          event.preventDefault();
          setEditPinFor([x.id]);
          setOriginalPinName("");
          setNewPinName("do-not-delete");
        }}
        title="Add a pin to protect snapshot from deletion"
      >
        <Pin className="h-4 w-4 text-gray-400" />
      </a>
    );
  }, []);

  const editPin = useCallback((snap: Snapshot, pin: string): void => {
    setEditPinFor([snap.id]);
    setOriginalPinName(pin);
    setNewPinName(pin);
  }, []);

  const cancelPin = useCallback((): void => {
    setEditPinFor(undefined);
  }, []);

  const removePin = useCallback((p: string): void => {
    if (editPinFor) {
      editSnapshots({
        snapshots: editPinFor,
        removePins: [p],
      });
    }
  }, [editSnapshots, editPinFor]);

  const savePin = useCallback((): void => {
    if (editPinFor) {
      editSnapshots({
        snapshots: editPinFor,
        addPins: [newPinName],
        removePins: [originalPinName],
      });
    }
  }, [editSnapshots, editPinFor, newPinName, originalPinName]);

  // Effect for component did mount and when showHidden changes
  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  if (error) {
    return <p>{error.message}</p>;
  }

  if (isLoading && !snapshots) {
    return <Spinner animation="border" variant="primary" />;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const searchPath = searchParams.get("path");

  snapshots.sort((a, b) => -compare(a.startTime, b.startTime));

  const columns: KopiaTableColumn<Snapshot>[] = [
    {
      id: "selected",
      header: "Selected",
      width: 20,
      align: "center",
      cell: (x) => (
        <div className="form-check multiselect">
          <input
            type="checkbox"
            className="form-check-input"
            checked={isSelected(x.row.original)}
            onChange={() => toggleSelected(x.row.original)}
          />
        </div>
      ),
    },
      {
        id: "startTime",
        header: "Start time",
        width: 200,
        cell: (x) => {
          const timestamp = rfc3339TimestampForDisplay(x.row.original.startTime);
          return (
            <Link to={objectLink(x.row.original.rootID)} state={{ label: searchPath }}>
              {timestamp}
            </Link>
          );
        },
      },
      {
        id: "description",
        header: "",
        width: 20,
        cell: (x) => descriptionFor(x.row.original),
      },
      {
        id: "rootID",
        header: "Root",
        width: "",
        accessorFn: (x) => x.rootID,
        cell: (x) => (
          <>
            <span className="snapshot-hash">{x.cell.getValue()}</span>
            {x.row.original.description && (
              <div className="snapshot-description">
                <small>{x.row.original.description}</small>
              </div>
            )}
          </>
        ),
      },
      {
        header: "Retention",
        accessorFn: (x) => x.retention,
        width: "",
        cell: (x) => (
          <span>
            {x.cell.getValue().map((l: string) => (
              <React.Fragment key={l}>
                <Badge bg={"retention-badge-" + pillVariant(l)}>{l}</Badge>{" "}
              </React.Fragment>
            ))}
            {x.row.original.pins.map((l: string) => (
              <React.Fragment key={l}>
                <Badge bg="snapshot-pin" onClick={() => editPin(x.row.original, l)}>
                  <Pin className="h-3 w-3 inline mr-1" /> {l}
                </Badge>{" "}
              </React.Fragment>
            ))}
            {newPinFor(x.row.original)}
          </span>
        ),
      },
      {
        header: "Size",
        accessorFn: (x) => x.summary.size,
        width: 100,
        cell: (x) => sizeWithFailures(x.cell.getValue(), x.row.original.summary, bytesStringBase2),
      },
      {
        header: "Files",
        accessorFn: (x) => x.summary.files,
        width: 100,
      },
      {
        header: "Dirs",
        accessorFn: (x) => x.summary.dirs,
        width: 100,
      },
  ];

  const selectedElements = Object.keys(selectedSnapshotManifestIDs);

  return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Snapshot History</h1>
          <p className="text-muted-foreground">
            {userName}@{host}:{path}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Snapshots</CardTitle>
                <CardDescription>
                  Displaying{" "}
                  {snapshots.length !== unfilteredCount
                    ? snapshots.length + " out of " + unfilteredCount
                    : snapshots.length}{" "}
                  snapshots{uniqueCount !== unfilteredCount && ` (${uniqueCount} unique)`}
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={fetchSnapshots} disabled={isRefreshing}>
                {isRefreshing ? (
                  <Spinner size="sm" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GoBackButton />
            {snapshots.length > 0 &&
              (selectedElements.length < snapshots.length ? (
                <Button size="sm" variant="outline" onClick={selectAll}>
                  Select All
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={deselectAll}>
                  Deselect All
                </Button>
              ))}
            {selectedElements.length > 0 && (
              <Button size="sm" variant="destructive" onClick={showDeleteConfirm}>
                Delete Selected ({selectedElements.length})
              </Button>
            )}
            {snapshots.length === 0 && (
              <Button size="sm" variant="destructive" onClick={deleteSnapshotSource}>
                Delete Snapshot Source
              </Button>
            )}
          </div>
        </div>
        {unfilteredCount !== uniqueCount && (
          <div className="mb-4">
            <div className="py-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showHidden"
                  checked={showHidden}
                  onCheckedChange={(checked: boolean) => setShowHidden(checked)}
                />
                <Label htmlFor="showHidden">
                  Show {unfilteredCount} individual snapshots
                </Label>
              </div>
            </div>
          </div>
        )}
        <div className="mb-4">
          <KopiaTable data={snapshots} columns={columns} />
        </div>

        <CLIEquivalent
          command={`snapshot list "${userName}@${host}:${path}"${showHidden ? " --show-identical" : ""}`}
        />
          </CardContent>
        </Card>

        <AlertDialog open={showDeleteConfirmationDialog} onOpenChange={cancelDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedElements.length > 1 ? (
                  <>
                    Do you want to delete the selected <strong>{selectedElements.length} snapshots</strong>?
                  </>
                ) : (
                  "Do you want to delete the selected snapshot?"
                )}
                {selectedElements.length === snapshots.length && (
                  <div className="mt-4 flex items-center space-x-2">
                    <Checkbox
                      id="deleteSource"
                      checked={alsoDeleteSource}
                      onCheckedChange={(checked: boolean) => setAlsoDeleteSource(checked)}
                    />
                    <Label htmlFor="deleteSource" className="text-sm">
                      Wipe all snapshots and the policy for this source.
                    </Label>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={deleteSelectedSnapshots}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!editingDescriptionFor} onOpenChange={cancelSnapshotDescription}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Snapshot Description</DialogTitle>
              <DialogDescription>
                Enter a new description for this snapshot.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Enter new description</Label>
                <Textarea
                  id="description"
                  value={updatedSnapshotDescription}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setUpdatedSnapshotDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              {savingSnapshot && (
                <div className="mr-auto">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              )}
              <Button variant="outline" onClick={cancelSnapshotDescription}>
                Cancel
              </Button>
              {originalSnapshotDescription && (
                <Button variant="destructive" onClick={removeSnapshotDescription}>
                  Remove Description
                </Button>
              )}
              <Button
                disabled={originalSnapshotDescription === updatedSnapshotDescription}
                onClick={saveSnapshotDescription}
              >
                Update Description
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editPinFor} onOpenChange={cancelPin}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Pin Snapshot</DialogTitle>
              <DialogDescription>
                {originalPinName ? "Update the pin name for this snapshot." : "Add a pin name for this snapshot."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pinName">Name of the pin</Label>
                <Input
                  id="pinName"
                  value={newPinName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPinName(e.target.value)}
                  placeholder="Enter pin name"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              {savingSnapshot && (
                <div className="mr-auto">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              )}
              <Button variant="outline" onClick={cancelPin}>
                Cancel
              </Button>
              {originalPinName && (
                <Button variant="destructive" onClick={() => removePin(originalPinName)}>
                  Remove Pin
                </Button>
              )}
              <Button
                onClick={savePin}
                disabled={newPinName === originalPinName || !newPinName}
              >
                {originalPinName ? "Update Pin" : "Add Pin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}

export function SnapshotHistory(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  useContext(UIPreferencesContext);

  return <SnapshotHistoryInternal navigate={navigate} location={location} />;
}
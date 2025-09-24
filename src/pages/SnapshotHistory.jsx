import axios from "axios";
import React, { Component, useContext } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
import { Link, useNavigate, useLocation } from "react-router-dom";
import KopiaTable from "../components/KopiaTable";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { compare, objectLink, parseQuery, rfc3339TimestampForDisplay } from "../utils/formatutils";
import { errorAlert, redirect, sizeWithFailures } from "../utils/uiutil";
import { sourceQueryStringParams } from "../utils/policyutil";
import { GoBackButton } from "../components/GoBackButton";
import { RefreshCw, Pin } from "lucide-react";
import { File } from "lucide-react";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import PropTypes from "prop-types";

function pillVariant(tag) {
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

class SnapshotHistoryInternal extends Component {
  constructor() {
    super();
    this.state = {
      snapshots: [],
      showHidden: false,
      isLoading: true,
      isRefreshing: false,
      error: null,
      selectedSnapshotManifestIDs: {},
    };

    this.fetchSnapshots = this.fetchSnapshots.bind(this);
    this.toggleShowHidden = this.toggleShowHidden.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.deselectAll = this.deselectAll.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
    this.deleteSelectedSnapshots = this.deleteSelectedSnapshots.bind(this);
    this.cancelDelete = this.cancelDelete.bind(this);
    this.deleteSnapshotSource = this.deleteSnapshotSource.bind(this);

    this.cancelSnapshotDescription = this.cancelSnapshotDescription.bind(this);
    this.removeSnapshotDescription = this.removeSnapshotDescription.bind(this);
    this.saveSnapshotDescription = this.saveSnapshotDescription.bind(this);

    this.editPin = this.editPin.bind(this);
    this.cancelPin = this.cancelPin.bind(this);
    this.savePin = this.savePin.bind(this);
    this.removePin = this.removePin.bind(this);

    this.editSnapshots = this.editSnapshots.bind(this);
  }

  selectAll() {
    let snapIds = {};
    for (const sn of this.state.snapshots) {
      snapIds[sn.id] = true;
    }

    this.setState({
      selectedSnapshotManifestIDs: snapIds,
    });
  }

  deselectAll() {
    this.setState({
      selectedSnapshotManifestIDs: {},
    });
  }

  isSelected(snap) {
    return !!this.state.selectedSnapshotManifestIDs[snap.id];
  }

  toggleSelected(snap) {
    let sel = { ...this.state.selectedSnapshotManifestIDs };

    if (sel[snap.id]) {
      delete sel[snap.id];
    } else {
      sel[snap.id] = true;
    }

    this.setState({
      selectedSnapshotManifestIDs: sel,
    });
  }

  componentDidUpdate(oldProps, oldState) {
    if (this.state.showHidden !== oldState.showHidden) {
      this.fetchSnapshots();
    }
  }

  componentDidMount() {
    this.fetchSnapshots();
  }

  showDeleteConfirm() {
    this.setState({
      alsoDeleteSource: false,
      showDeleteConfirmationDialog: true,
    });
  }

  deleteSelectedSnapshots() {
    let req = {
      source: {
        host: this.state.host,
        userName: this.state.userName,
        path: this.state.path,
      },
      snapshotManifestIds: [],
      deleteSourceAndPolicy: this.state.alsoDeleteSource,
    };

    for (let id in this.state.selectedSnapshotManifestIDs) {
      req.snapshotManifestIds.push(id);
    }

    axios
      .post("/api/v1/snapshots/delete", req)
      .then((_result) => {
        if (req.deleteSourceAndPolicy) {
          this.props.navigate(-1);
        } else {
          this.fetchSnapshots();
        }
      })
      .catch((error) => {
        redirect(error);
        errorAlert(error);
      });

    this.setState({
      showDeleteConfirmationDialog: false,
    });
  }

  deleteSnapshotSource() {
    let req = {
      source: {
        host: this.state.host,
        userName: this.state.userName,
        path: this.state.path,
      },
      deleteSourceAndPolicy: true,
    };

    axios
      .post("/api/v1/snapshots/delete", req)
      .then((_result) => {
        this.props.navigate(-1);
      })
      .catch((error) => {
        redirect(error);
        errorAlert(error);
      });
  }

  cancelDelete() {
    this.setState({
      showDeleteConfirmationDialog: false,
    });
  }

  fetchSnapshots() {
    let q = parseQuery(this.props.location.search);

    this.setState({
      isRefreshing: true,
      host: q.host,
      userName: q.userName,
      path: q.path,
      hiddenCount: 0,
      selectedSnapshot: null,
    });

    let u = "/api/v1/snapshots?" + sourceQueryStringParams(q);

    if (this.state.showHidden) {
      u += "&all=1";
    }

    axios
      .get(u)
      .then((result) => {
        this.setState({
          snapshots: result.data.snapshots,
          selectedSnapshotManifestIDs: {},
          unfilteredCount: result.data.unfilteredCount,
          uniqueCount: result.data.uniqueCount,
          isLoading: false,
          isRefreshing: false,
        });
      })
      .catch((error) =>
        this.setState({
          error,
          isLoading: false,
          isRefreshing: false,
        }),
      );
  }

  selectSnapshot(x) {
    this.setState({
      selectedSnapshot: x,
    });
  }

  toggleShowHidden(x) {
    this.setState({
      showHidden: x.target.checked,
    });
  }

  cancelSnapshotDescription() {
    this.setState({ editingDescriptionFor: false });
  }

  removeSnapshotDescription() {
    this.editSnapshots({
      snapshots: this.state.editingDescriptionFor,
      description: "",
    });
  }

  saveSnapshotDescription() {
    this.editSnapshots({
      snapshots: this.state.editingDescriptionFor,
      description: this.state.updatedSnapshotDescription,
    });
  }

  descriptionFor(x) {
    return (
      <a
        href="#top"
        onClick={(event) => {
          event.preventDefault();
          this.setState({
            editingDescriptionFor: [x.id],
            updatedSnapshotDescription: x.description,
            originalSnapshotDescription: x.description,
          });
        }}
        title={x.description + " - Click to update snapshot description."}
        className={x.description ? "snapshot-description-set" : "snapshot-description"}
      >
        <b>
          <File className="h-4 w-4" />
        </b>
      </a>
    );
  }

  newPinFor(x) {
    return (
      <a
        href="#top"
        onClick={(event) => {
          event.preventDefault();

          this.setState({
            editPinFor: [x.id],
            originalPinName: "",
            newPinName: "do-not-delete",
          });
        }}
        title="Add a pin to protect snapshot from deletion"
      >
        <Pin className="h-4 w-4 text-gray-400" />
      </a>
    );
  }

  editPin(snap, pin) {
    this.setState({
      editPinFor: [snap.id],
      originalPinName: pin,
      newPinName: pin,
    });
  }

  cancelPin() {
    this.setState({ editPinFor: undefined });
  }

  removePin(p) {
    this.editSnapshots({
      snapshots: this.state.editPinFor,
      removePins: [p],
    });
  }

  savePin() {
    this.editSnapshots({
      snapshots: this.state.editPinFor,
      addPins: [this.state.newPinName],
      removePins: [this.state.originalPinName],
    });
  }

  editSnapshots(req) {
    this.setState({ savingSnapshot: true });
    axios
      .post("/api/v1/snapshots/edit", req)
      .then((_resp) => {
        this.setState({
          editPinFor: undefined,
          editingDescriptionFor: undefined,
          savingSnapshot: false,
        });
        this.fetchSnapshots();
      })
      .catch((e) => {
        this.setState({
          editPinFor: undefined,
          editingDescriptionFor: undefined,
          savingSnapshot: false,
        });
        redirect(e);
        errorAlert(e);
      });
  }

  render() {
    let { snapshots, unfilteredCount, uniqueCount, isLoading, error } = this.state;
    const { bytesStringBase2 } = this.context;
    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading && !snapshots) {
      return <Spinner animation="border" variant="primary" />;
    }
    const searchParams = new URLSearchParams(window.location.search);
    const path = searchParams.get("path");

    snapshots.sort((a, b) => -compare(a.startTime, b.startTime));

    const columns = [
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
              checked={this.isSelected(x.row.original)}
              onChange={() => this.toggleSelected(x.row.original)}
            />
          </div>
        ),
      },
      {
        id: "startTime",
        header: "Start time",
        width: 200,
        cell: (x) => {
          let timestamp = rfc3339TimestampForDisplay(x.row.original.startTime);
          return (
            <Link to={objectLink(x.row.original.rootID)} state={{ label: path }}>
              {timestamp}
            </Link>
          );
        },
      },
      {
        id: "description",
        header: "",
        width: 20,
        cell: (x) => this.descriptionFor(x.row.original),
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
            {x.cell.getValue().map((l) => (
              <React.Fragment key={l}>
                <Badge bg={"retention-badge-" + pillVariant(l)}>{l}</Badge>{" "}
              </React.Fragment>
            ))}
            {x.row.original.pins.map((l) => (
              <React.Fragment key={l}>
                <Badge bg="snapshot-pin" onClick={() => this.editPin(x.row.original, l)}>
                  <Pin className="h-3 w-3 inline mr-1" /> {l}
                </Badge>{" "}
              </React.Fragment>
            ))}
            {this.newPinFor(x.row.original)}
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

    const selectedElements = Object.keys(this.state.selectedSnapshotManifestIDs);

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <GoBackButton />
            {snapshots.length > 0 &&
              (selectedElements.length < snapshots.length ? (
                <Button size="sm" variant="default" onClick={this.selectAll}>
                  Select All
                </Button>
              ) : (
                <Button size="sm" variant="default" onClick={this.deselectAll}>
                  Deselect All
                </Button>
              ))}
            {selectedElements.length > 0 && (
              <Button size="sm" variant="destructive" onClick={this.showDeleteConfirm}>
                Delete Selected ({selectedElements.length})
              </Button>
            )}
            {snapshots.length === 0 && (
              <Button size="sm" variant="destructive" onClick={this.deleteSnapshotSource}>
                Delete Snapshot Source
              </Button>
            )}
          </div>
          <Button size="sm" variant="default">
            {this.state.isRefreshing ? (
              <Spinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" title="Fetch snapshots" onClick={this.fetchSnapshots} />
            )}
          </Button>
        </div>
        <div className="mb-4">
          <div className="py-2">
            Displaying{" "}
            {snapshots.length !== unfilteredCount
              ? snapshots.length + " out of " + unfilteredCount
              : snapshots.length}{" "}
            snapshots of&nbsp;
            <b>
              {this.state.userName}@{this.state.host}:{this.state.path}
            </b>
          </div>
        </div>
        {unfilteredCount !== uniqueCount && (
          <div className="mb-4">
            <div className="py-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-hidden-snapshots"
                  checked={this.state.showHidden}
                  onCheckedChange={this.toggleShowHidden}
                />
                <Label htmlFor="show-hidden-snapshots">
                  Show {unfilteredCount} individual snapshots
                </Label>
              </div>
            </div>
          </div>
        )}
        <div className="w-full">
          <KopiaTable data={snapshots} columns={columns} />
        </div>

        <CLIEquivalent
          command={`snapshot list "${this.state.userName}@${this.state.host}:${this.state.path}"${this.state.showHidden ? " --show-identical" : ""}`}
        />

        <AlertDialog open={this.state.showDeleteConfirmationDialog} onOpenChange={this.cancelDelete}>
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
                      checked={this.state.alsoDeleteSource}
                      onCheckedChange={(checked) =>
                        this.setState({
                          alsoDeleteSource: checked,
                        })
                      }
                    />
                    <Label htmlFor="deleteSource" className="text-sm">
                      Wipe all snapshots and the policy for this source.
                    </Label>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={this.cancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={this.deleteSelectedSnapshots}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!this.state.editingDescriptionFor} onOpenChange={this.cancelSnapshotDescription}>
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
                  value={this.state.updatedSnapshotDescription}
                  onChange={(e) => this.setState({ updatedSnapshotDescription: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              {this.state.savingSnapshot && (
                <div className="mr-auto">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              )}
              <Button variant="outline" onClick={this.cancelSnapshotDescription}>
                Cancel
              </Button>
              {this.state.originalSnapshotDescription && (
                <Button variant="secondary" onClick={this.removeSnapshotDescription}>
                  Remove Description
                </Button>
              )}
              <Button
                disabled={this.state.originalSnapshotDescription === this.state.updatedSnapshotDescription}
                onClick={this.saveSnapshotDescription}
              >
                Update Description
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!this.state.editPinFor} onOpenChange={this.cancelPin}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Pin Snapshot</DialogTitle>
              <DialogDescription>
                {this.state.originalPinName ? "Update the pin name for this snapshot." : "Add a pin name for this snapshot."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pinName">Name of the pin</Label>
                <Input
                  id="pinName"
                  value={this.state.newPinName}
                  onChange={(e) => this.setState({ newPinName: e.target.value })}
                  placeholder="Enter pin name"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              {this.state.savingSnapshot && (
                <div className="mr-auto">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              )}
              <Button variant="outline" onClick={this.cancelPin}>
                Cancel
              </Button>
              {this.state.originalPinName && (
                <Button variant="secondary" onClick={() => this.removePin(this.state.originalPinName)}>
                  Remove Pin
                </Button>
              )}
              <Button
                onClick={this.savePin}
                disabled={this.state.newPinName === this.state.originalPinName || !this.state.newPinName}
              >
                {this.state.originalPinName ? "Update Pin" : "Add Pin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}

SnapshotHistoryInternal.propTypes = {
  host: PropTypes.string,
  userName: PropTypes.string,
  history: PropTypes.object,
  location: PropTypes.object,
  navigate: PropTypes.func,
};

export function SnapshotHistory(props) {
  const navigate = useNavigate();
  const location = useLocation();
  useContext(UIPreferencesContext);

  return <SnapshotHistoryInternal navigate={navigate} location={location} {...props} />;
}

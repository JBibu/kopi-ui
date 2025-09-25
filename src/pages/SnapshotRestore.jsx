import axios from "axios";
import React, { Component } from "react";
import { Button } from "../components/ui/button";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { handleChange, validateRequiredFields } from "../forms";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";
import { RequiredNumberField } from "../forms/RequiredNumberField";
import { errorAlert } from "../utils/uiutil";
import { GoBackButton } from "../components/GoBackButton";
import PropTypes from "prop-types";

export class SnapshotRestoreInternal extends Component {
  constructor() {
    super();

    this.state = {
      incremental: true,
      continueOnErrors: false,
      restoreOwnership: true,
      restorePermissions: true,
      restoreModTimes: true,
      uncompressedZip: true,
      overwriteFiles: false,
      overwriteDirectories: false,
      overwriteSymlinks: false,
      ignorePermissionErrors: true,
      writeFilesAtomically: false,
      writeSparseFiles: false,
      restoreDirEntryAtDepth: 1000,
      minSizeForPlaceholder: 0,
      restoreTask: "",
    };

    this.handleChange = handleChange.bind(this);
    this.start = this.start.bind(this);
  }

  start(e) {
    e.preventDefault();

    if (!validateRequiredFields(this, ["destination"])) {
      return;
    }

    const dst = this.state.destination + "";

    let req = {
      root: this.props.params.oid,
      options: {
        incremental: this.state.incremental,
        ignoreErrors: this.state.continueOnErrors,
        restoreDirEntryAtDepth: this.state.restoreDirEntryAtDepth,
        minSizeForPlaceholder: this.state.minSizeForPlaceholder,
      },
    };

    if (dst.endsWith(".zip")) {
      req.zipFile = dst;
      req.uncompressedZip = this.state.uncompressedZip;
    } else if (dst.endsWith(".tar")) {
      req.tarFile = dst;
    } else {
      req.fsOutput = {
        targetPath: dst,
        skipOwners: !this.state.restoreOwnership,
        skipPermissions: !this.state.restorePermissions,
        skipTimes: !this.state.restoreModTimes,

        ignorePermissionErrors: this.state.ignorePermissionErrors,
        overwriteFiles: this.state.overwriteFiles,
        overwriteDirectories: this.state.overwriteDirectories,
        overwriteSymlinks: this.state.overwriteSymlinks,
        writeFilesAtomically: this.state.writeFilesAtomically,
        writeSparseFiles: this.state.writeSparseFiles,
      };
    }

    axios
      .post("/api/v1/restore", req)
      .then((result) => {
        this.setState({
          restoreTask: result.data.id,
        });
      })
      .catch((error) => {
        errorAlert(error);
      });
  }

  render() {
    if (this.state.restoreTask) {
      return (
        <p>
          <GoBackButton />
          <Link replace={true} to={"/tasks/" + this.state.restoreTask}>
            Go To Restore Task
          </Link>
          .
        </p>
      );
    }

    return (
      <div className="padded-top">
        <GoBackButton />
        &nbsp;<span className="page-title">Restore</span>
        <hr />
        <form onSubmit={this.start} className="space-y-4">
          <div>
            {RequiredField(
              this,
              "Destination",
              "destination",
              {
                autoFocus: true,
                placeholder: "enter destination path",
              },
              "You can also restore to a .zip or .tar file by providing the appropriate extension.",
            )}
          </div>
          <div>{RequiredBoolean(this, "Skip previously restored files and symlinks", "incremental")}</div>
          <div>
            {RequiredBoolean(
              this,
              "Continue on Errors",
              "continueOnErrors",
              "When a restore error occurs, attempt to continue instead of failing fast.",
            )}
          </div>
          <div>{RequiredBoolean(this, "Restore File Ownership", "restoreOwnership")}</div>
          <div>{RequiredBoolean(this, "Restore File Permissions", "restorePermissions")}</div>
          <div>{RequiredBoolean(this, "Restore File Modification Time", "restoreModTimes")}</div>
          <div>{RequiredBoolean(this, "Overwrite Files", "overwriteFiles")}</div>
          <div>{RequiredBoolean(this, "Overwrite Directories", "overwriteDirectories")}</div>
          <div>{RequiredBoolean(this, "Overwrite Symbolic Links", "overwriteSymlinks")}</div>
          <div>{RequiredBoolean(this, "Write files atomically", "writeFilesAtomically")}</div>
          <div>{RequiredBoolean(this, "Write Sparse Files", "writeSparseFiles")}</div>
          <hr className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RequiredNumberField(this, "Shallow Restore At Depth", "restoreDirEntryAtDepth")}
            {RequiredNumberField(this, "Minimal File Size For Shallow Restore", "minSizeForPlaceholder")}
          </div>
          <hr className="my-4" />
          <div>
            {RequiredBoolean(
              this,
              "Disable ZIP compression",
              "uncompressedZip",
              "Do not compress when restoring to a ZIP file (faster).",
            )}
          </div>
          <hr className="my-4" />
          <div>
            <Button variant="default" type="submit" data-testid="submit-button">
              Begin Restore
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

SnapshotRestoreInternal.propTypes = {
  params: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export function SnapshotRestore(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return <SnapshotRestoreInternal navigate={navigate} location={location} params={params} {...props} />;
}

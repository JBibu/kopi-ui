import axios from "axios";
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { validateRequiredFields } from "../forms";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";
import { RequiredNumberField } from "../forms/RequiredNumberField";
import { errorAlert } from "../utils/uiutil";
import { GoBackButton } from "../components/GoBackButton";
import PropTypes from "prop-types";

export function SnapshotRestoreInternal({ params }) {
  const [state, setState] = useState({
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
  });

  const handleChange = (field, value) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const start = (e) => {
    e.preventDefault();

    const contextObj = { state, handleChange };
    if (!validateRequiredFields(contextObj, ["destination"])) {
      return;
    }

    const dst = state.destination + "";

    let req = {
      root: params.oid,
      options: {
        incremental: state.incremental,
        ignoreErrors: state.continueOnErrors,
        restoreDirEntryAtDepth: state.restoreDirEntryAtDepth,
        minSizeForPlaceholder: state.minSizeForPlaceholder,
      },
    };

    if (dst.endsWith(".zip")) {
      req.zipFile = dst;
      req.uncompressedZip = state.uncompressedZip;
    } else if (dst.endsWith(".tar")) {
      req.tarFile = dst;
    } else {
      req.fsOutput = {
        targetPath: dst,
        skipOwners: !state.restoreOwnership,
        skipPermissions: !state.restorePermissions,
        skipTimes: !state.restoreModTimes,

        ignorePermissionErrors: state.ignorePermissionErrors,
        overwriteFiles: state.overwriteFiles,
        overwriteDirectories: state.overwriteDirectories,
        overwriteSymlinks: state.overwriteSymlinks,
        writeFilesAtomically: state.writeFilesAtomically,
        writeSparseFiles: state.writeSparseFiles,
      };
    }

    axios
      .post("/api/v1/restore", req)
      .then((result) => {
        setState(prev => ({
          ...prev,
          restoreTask: result.data.id,
        }));
      })
      .catch((error) => {
        errorAlert(error);
      });
  };

  if (state.restoreTask) {
    return (
      <p>
        <GoBackButton />
        <Link replace={true} to={"/tasks/" + state.restoreTask}>
          Go To Restore Task
        </Link>
        .
      </p>
    );
  }

  const contextObj = { state, handleChange };

  return (
    <div className="padded-top">
      <GoBackButton />
      &nbsp;<span className="page-title">Restore</span>
      <hr />
      <form onSubmit={start} className="space-y-4">
        <div>
          {RequiredField(
            contextObj,
            "Destination",
            "destination",
            {
              autoFocus: true,
              placeholder: "enter destination path",
            },
            "You can also restore to a .zip or .tar file by providing the appropriate extension.",
          )}
        </div>
        <div>{RequiredBoolean(contextObj, "Skip previously restored files and symlinks", "incremental")}</div>
        <div>
          {RequiredBoolean(
            contextObj,
            "Continue on Errors",
            "continueOnErrors",
            "When a restore error occurs, attempt to continue instead of failing fast.",
          )}
        </div>
        <div>{RequiredBoolean(contextObj, "Restore File Ownership", "restoreOwnership")}</div>
        <div>{RequiredBoolean(contextObj, "Restore File Permissions", "restorePermissions")}</div>
        <div>{RequiredBoolean(contextObj, "Restore File Modification Time", "restoreModTimes")}</div>
        <div>{RequiredBoolean(contextObj, "Overwrite Files", "overwriteFiles")}</div>
        <div>{RequiredBoolean(contextObj, "Overwrite Directories", "overwriteDirectories")}</div>
        <div>{RequiredBoolean(contextObj, "Overwrite Symbolic Links", "overwriteSymlinks")}</div>
        <div>{RequiredBoolean(contextObj, "Write files atomically", "writeFilesAtomically")}</div>
        <div>{RequiredBoolean(contextObj, "Write Sparse Files", "writeSparseFiles")}</div>
        <hr className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RequiredNumberField(contextObj, "Shallow Restore At Depth", "restoreDirEntryAtDepth")}
          {RequiredNumberField(contextObj, "Minimal File Size For Shallow Restore", "minSizeForPlaceholder")}
        </div>
        <hr className="my-4" />
        <div>
          {RequiredBoolean(
            contextObj,
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

SnapshotRestoreInternal.propTypes = {
  params: PropTypes.shape({
    oid: PropTypes.string.isRequired,
  }).isRequired,
};

export function SnapshotRestore(props) {
  const params = useParams();

  return <SnapshotRestoreInternal params={params} {...props} />;
}

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { FolderOpen } from "lucide-react";
import PropTypes from "prop-types";

export const SetupRepositoryFilesystem = forwardRef(function SetupRepositoryFilesystem(props, ref) {
  const [state, setState] = useState({
    path: "",
    ...props.initial,
  });

  const handlePathChange = (e) => {
    setState(prev => ({ ...prev, path: e.target.value }));
  };

  const onDirectorySelected = (path) => {
    setState(prev => ({ ...prev, path }));
  };

  const validate = () => {
    if (!state.path) {
      setState(prev => ({ ...prev, path: "" })); // Trigger validation UI
      return false;
    }
    return true;
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate,
    state
  }));

  const isInvalid = state.path === "";

  return (
    <div className="space-y-2">
      <Label htmlFor="path" className="text-sm font-medium required">
        Directory Path
        <span className="text-red-500 ml-1">*</span>
      </Label>
      <div className="flex gap-2">
        <Input
          id="path"
          name="path"
          value={state.path || ""}
          data-testid="control-path"
          onChange={handlePathChange}
          className={isInvalid ? "border-red-500 focus:border-red-500 flex-1" : "flex-1"}
          autoFocus={true}
          placeholder="enter directory path where you want to store repository files"
        />
        {window.kopiaUI && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.kopiaUI.selectDirectory(onDirectorySelected)}
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isInvalid && <p className="text-sm text-red-500">Required field</p>}
    </div>
  );
});

SetupRepositoryFilesystem.propTypes = {
  initial: PropTypes.object,
};

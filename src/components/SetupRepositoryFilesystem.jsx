import React, { forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import { FolderOpen } from "lucide-react";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { useFormValidation } from "../hooks/useFormValidation";

export const SetupRepositoryFilesystem = forwardRef(function SetupRepositoryFilesystem(props, ref) {
  const formState = useFormValidation(
    {
      path: "",
      ...props.initial,
    },
    ["path"]
  );

  const handlePathChange = (e) => {
    formState.handleChange("path", e.target.value);
  };

  const onDirectorySelected = (path) => {
    formState.handleChange("path", path);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate: formState.validate,
    state: formState.state
  }));

  const isInvalid = formState.errors.path && formState.touched.path;

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
          value={formState.state.path || ""}
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
      {isInvalid && <p className="text-sm text-red-500">{formState.errors.path}</p>}
    </div>
  );
});

SetupRepositoryFilesystem.propTypes = {
  initial: PropTypes.object,
};

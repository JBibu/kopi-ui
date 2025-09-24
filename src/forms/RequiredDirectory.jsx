import React from "react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { FolderOpen } from "lucide-react";
import { stateProperty } from ".";
import { setDeepStateProperty } from "../utils/deepstate";

/**
 * This functions returns a directory selector that allows the user to select a directory.
 * The selections is invoked using a button that calls a functions within the electron app.
 * If the electron app is not present, the button is not visible. The path is required.
 *
 * @param {*} component
 * The component that this function is called from
 * @param {string} label
 * Label, that is added before the input field
 * @param {string} name
 * Name of the variable in which the directory path is stored
 * @param {*} props
 * Additional properties of the component
 * @returns The form group with the components
 */
export function RequiredDirectory(component, label, name, props = {}) {
  /**
   * Saves the selected path as a deepstate variable within the component
   * @param {The path that has been selected} path
   */
  function onDirectorySelected(path) {
    setDeepStateProperty(component, name, path);
  }

  const isInvalid = stateProperty(component, name, null) === "";

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium required">
          {label}
          <span className="text-red-500 ml-1">*</span>
        </Label>
      )}
      <div className="flex gap-2">
        <Input
          id={name}
          name={name}
          value={stateProperty(component, name)}
          data-testid={"control-" + name}
          onChange={component.handleChange}
          className={isInvalid ? "border-red-500 focus:border-red-500 flex-1" : "flex-1"}
          {...props}
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
}

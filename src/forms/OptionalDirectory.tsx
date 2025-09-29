import React from "react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { FolderOpen } from "lucide-react";
import { stateProperty } from ".";
import { setDeepStateProperty } from "../utils/deepstate";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, unknown>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface OptionalDirectoryProps {
  [key: string]: unknown;
}

// Extended Window interface for Electron API
declare global {
  interface Window {
    kopiaUI?: {
      selectDirectory: (callback: (path: string) => void) => void;
    };
  }
}

/**
 * This functions returns a directory selector that allows the user to select a directory.
 * The selections is invoked using a button that calls a functions within the electron app.
 * If the electron app is not present, the button is not visible.
 *
 * @param component The component that this function is called from
 * @param label Label, that is added before the input field
 * @param name Name of the variable in which the directory path is stored
 * @param props Additional properties of the component
 * @returns The form group with the components
 */
export function OptionalDirectory(
  component: ComponentWithState,
  label: string,
  name: string,
  props: OptionalDirectoryProps = {},
): React.JSX.Element {
  /**
   * Saves the selected path as a deepstate variable within the component
   * @param path The path that has been selected
   */
  function onDirectorySelected(path: string): void {
    setDeepStateProperty(component, name, path);
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="flex gap-2">
        <Input
          id={name}
          name={name}
          value={stateProperty(component, name)}
          data-testid={"control-" + name}
          onChange={component.handleChange}
          className="flex-1"
          {...props}
        />
        {window.kopiaUI && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.kopiaUI!.selectDirectory(onDirectorySelected)}
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

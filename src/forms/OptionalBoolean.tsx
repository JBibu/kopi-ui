import React from "react";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { stateProperty } from ".";
import { ComponentWithState } from "../types/forms";

interface ValueTarget {
  value: string;
}

function optionalBooleanValue(target: ValueTarget): boolean | undefined {
  if (target.value === "true") {
    return true;
  }
  if (target.value === "false") {
    return false;
  }

  return undefined;
}

export function OptionalBoolean(
  component: ComponentWithState,
  label: string,
  name: string,
  defaultLabel: string,
): React.JSX.Element {
  const value = stateProperty(component, name);
  const displayValue = value === true ? "true" : value === false ? "false" : "default";

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Select
        value={displayValue}
        onValueChange={(value) => {
          const event = {
            target: {
              name: name,
              value: value === "default" ? "" : value,
            },
          };
          component.handleChange(event, optionalBooleanValue);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={defaultLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">{defaultLabel}</SelectItem>
          <SelectItem value="true">yes</SelectItem>
          <SelectItem value="false">no</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

import React from "react";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { stateProperty } from ".";

function optionalBooleanValue(target) {
  if (target.value === "true") {
    return true;
  }
  if (target.value === "false") {
    return false;
  }

  return undefined;
}

export function OptionalBoolean(component, label, name, defaultLabel) {
  const value = stateProperty(component, name);
  const displayValue = value === true ? "true" : value === false ? "false" : "";

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
              value: value
            }
          };
          component.handleChange(event, optionalBooleanValue);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={defaultLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{defaultLabel}</SelectItem>
          <SelectItem value="true">yes</SelectItem>
          <SelectItem value="false">no</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

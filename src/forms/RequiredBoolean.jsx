import React from "react";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { stateProperty } from ".";

function checkedToBool(t) {
  if (t.checked) {
    return true;
  }

  return false;
}

export function RequiredBoolean(component, label, name, helpText) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          name={name}
          checked={stateProperty(component, name)}
          onCheckedChange={(checked) => {
            const event = {
              target: {
                name: name,
                checked: checked
              }
            };
            component.handleChange(event, checkedToBool);
          }}
          data-testid={"control-" + name}
        />
        <Label htmlFor={name} className="text-sm font-medium required">
          {label}
          <span className="text-red-500 ml-1">*</span>
        </Label>
      </div>
      {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
    </div>
  );
}

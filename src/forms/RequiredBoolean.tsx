import React from "react";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { stateProperty } from ".";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, any>;
  handleChange: (event: any, valueGetter?: (target: any) => any) => void;
}

interface CheckedTarget {
  checked: boolean;
}

function checkedToBool(t: CheckedTarget): boolean {
  if (t.checked) {
    return true;
  }

  return false;
}

export function RequiredBoolean(
  component: ComponentWithState,
  label: string,
  name: string,
  helpText?: string
): React.JSX.Element {
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

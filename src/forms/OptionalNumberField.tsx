import React from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { isInvalidNumber, stateProperty, valueToNumber } from ".";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, unknown>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>, valueGetter?: (target: unknown) => number | string | undefined) => void;
}

interface OptionalNumberFieldProps {
  [key: string]: unknown;
}

export function OptionalNumberField(
  component: ComponentWithState,
  label: string | null,
  name: string,
  props: OptionalNumberFieldProps = {}
): React.JSX.Element {
  const isInvalid = isInvalidNumber(stateProperty(component, name));

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Input
        id={name}
        name={name}
        type="number"
        value={stateProperty(component, name)}
        onChange={(e) => component.handleChange(e, valueToNumber)}
        data-testid={"control-" + name}
        className={isInvalid ? "border-red-500 focus:border-red-500" : ""}
        {...props}
      />
      {isInvalid && <p className="text-sm text-red-500">Must be a valid number or empty</p>}
    </div>
  );
}

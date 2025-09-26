import React from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { stateProperty, isInvalidNumber, valueToNumber } from ".";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, any>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>, valueGetter?: (target: any) => any) => void;
}

interface RequiredNumberFieldProps {
  [key: string]: any;
}

export function RequiredNumberField(
  component: ComponentWithState,
  label: string,
  name: string,
  props: RequiredNumberFieldProps = {}
): JSX.Element {
  const isInvalid = stateProperty(component, name, null) === "" || isInvalidNumber(stateProperty(component, name));

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </Label>
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

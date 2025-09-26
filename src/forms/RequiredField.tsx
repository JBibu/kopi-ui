import React from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { stateProperty } from ".";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, any>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface RequiredFieldProps {
  [key: string]: any;
}

export function RequiredField(
  component: ComponentWithState,
  label: string,
  name: string,
  props: RequiredFieldProps = {},
  helpText: string | null = null
): JSX.Element {
  const isInvalid = stateProperty(component, name, null) === "";

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium required">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </Label>
      <Input
        id={name}
        name={name}
        value={stateProperty(component, name)}
        data-testid={"control-" + name}
        onChange={component.handleChange}
        className={isInvalid ? "border-red-500 focus:border-red-500" : ""}
        {...props}
      />
      {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
      {isInvalid && <p className="text-sm text-red-500">Required field</p>}
    </div>
  );
}

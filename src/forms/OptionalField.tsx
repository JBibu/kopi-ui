import React from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { stateProperty } from ".";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, any>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface OptionalFieldProps {
  [key: string]: any;
}

export function OptionalField(
  component: ComponentWithState,
  label: string,
  name: string,
  props: OptionalFieldProps = {},
  helpText: string | null = null
): JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        value={stateProperty(component, name)}
        data-testid={"control-" + name}
        onChange={component.handleChange}
        {...props}
      />
      {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
    </div>
  );
}

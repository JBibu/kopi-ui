import React from "react";
import { Input } from "../components/ui/input";
import { stateProperty } from ".";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, unknown>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface OptionalFieldNoLabelProps {
  [key: string]: unknown;
}

export function OptionalFieldNoLabel(
  component: ComponentWithState,
  label: string,
  name: string,
  props: OptionalFieldNoLabelProps = {},
  helpText: string | null = null,
  invalidFeedback: string | null = null
): React.JSX.Element {
  const hasError = !!invalidFeedback;

  return (
    <div className="space-y-2">
      <Input
        name={name}
        value={stateProperty(component, name)}
        data-testid={"control-" + name}
        onChange={component.handleChange}
        className={hasError ? "border-red-500 focus:border-red-500" : ""}
        {...props}
      />
      {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
      {invalidFeedback && <p className="text-sm text-red-500">{invalidFeedback}</p>}
    </div>
  );
}

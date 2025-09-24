import React from "react";
import { Input } from "../components/ui/input";
import { stateProperty } from ".";

export function OptionalFieldNoLabel(component, label, name, props = {}, helpText = null, invalidFeedback = null) {
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

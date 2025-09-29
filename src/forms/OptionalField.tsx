import React from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { stateProperty } from ".";
import { FormComponentRef, OptionalFieldProps } from "../types/forms";

export function OptionalField(
  component: FormComponentRef,
  label: string,
  name: string,
  props: OptionalFieldProps & { isInvalid?: boolean; as?: string; rows?: number } = {},
  helpText: string | null = null,
): React.JSX.Element {
  const { isInvalid, as, rows, ...inputProps } = props;
  const isTextarea = as === "textarea";

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      {isTextarea ? (
        <Textarea
          id={name}
          name={name}
          value={stateProperty(component, name) as string}
          data-testid={"control-" + name}
          onChange={component.handleChange}
          rows={rows}
          className={isInvalid ? "border-red-500 focus:border-red-500" : ""}
          {...inputProps}
        />
      ) : (
        <Input
          id={name}
          name={name}
          value={stateProperty(component, name)}
          data-testid={"control-" + name}
          onChange={component.handleChange}
          className={isInvalid ? "border-red-500 focus:border-red-500" : ""}
          {...inputProps}
        />
      )}
      {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
    </div>
  );
}

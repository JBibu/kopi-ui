import React from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { stateProperty } from ".";

export function RequiredField(component, label, name, props = {}, helpText = null) {
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

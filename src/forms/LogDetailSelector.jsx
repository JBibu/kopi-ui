import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { valueToNumber, stateProperty } from ".";

export function LogDetailSelector(component, name) {
  const options = [
    { value: "inherit", label: "(inherit from parent)" },
    { value: "0", label: "0 - no output" },
    { value: "1", label: "1 - minimal details" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5 - normal details" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "10", label: "10 - maximum details" }
  ];

  const currentValue = stateProperty(component, name);
  const displayValue = currentValue?.toString() || "inherit";

  return (
    <Select
      name={name}
      value={displayValue}
      onValueChange={(value) => {
        const actualValue = value === "inherit" ? "" : value;
        const event = { target: { name, value: actualValue } };
        component.handleChange(event, valueToNumber);
      }}
    >
      <SelectTrigger className="h-9">
        <SelectValue placeholder="(inherit from parent)" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import React from "react";
import { Textarea } from "../components/ui/textarea";
import { stateProperty } from ".";

export function listToMultilineString(v) {
  if (v) {
    return v.join("\n");
  }

  return "";
}

export function multilineStringToList(target) {
  const v = target.value;
  if (v === "") {
    return undefined;
  }

  return v.split(/\n/);
}

export function StringList(component, name, props = {}) {
  return (
    <Textarea
      name={name}
      value={listToMultilineString(stateProperty(component, name))}
      onChange={(e) => component.handleChange(e, multilineStringToList)}
      rows={5}
      className="min-h-[120px]"
      {...props}
    />
  );
}

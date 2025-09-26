import React from "react";
import { Textarea } from "../components/ui/textarea";
import { stateProperty } from ".";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, any>;
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>, valueGetter?: (target: any) => any) => void;
}

interface StringListProps {
  [key: string]: any;
}

interface ValueTarget {
  value: string;
}

export function listToMultilineString(v: string[] | undefined): string {
  if (v) {
    return v.join("\n");
  }

  return "";
}

export function multilineStringToList(target: ValueTarget): string[] | undefined {
  const v = target.value;
  if (v === "") {
    return undefined;
  }

  return v.split(/\n/);
}

export function StringList(
  component: ComponentWithState,
  name: string,
  props: StringListProps = {}
): JSX.Element {
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

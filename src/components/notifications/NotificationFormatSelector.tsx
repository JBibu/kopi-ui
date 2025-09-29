import React from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { stateProperty } from "../../forms";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, unknown>;
  handleChange: (event: { target: { name: string; value: string } }) => void;
}

export function NotificationFormatSelector(
  component: ComponentWithState,
  name: string
): React.JSX.Element {
  return (
    <div className="space-y-2">
      <Label className="required">Notification Format</Label>
      <Select
        value={stateProperty(component, name)}
        onValueChange={(value) => component.handleChange({
          target: { name: name, value: value }
        })}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="txt">Plain Text Format</SelectItem>
          <SelectItem value="html">HTML Format</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

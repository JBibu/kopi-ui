import React from "react";
import { OptionalNumberField } from "../../forms/OptionalNumberField";
import { LabelColumn } from "./LabelColumn";
import { WideValueColumn } from "./WideValueColumn";
import { EffectiveValue } from "./EffectiveValue";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, any>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>, valueGetter?: (target: any) => any) => void;
}

export function ActionRowTimeout(
  component: ComponentWithState,
  action: string
): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <LabelColumn name="Timeout" help="Timeout in seconds before Kopia kills the process" />
      <WideValueColumn>{OptionalNumberField(component, "", "policy." + action, {})}</WideValueColumn>
      {EffectiveValue(component, action)}
    </div>
  );
}

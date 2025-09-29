import React from "react";
import { OptionalFieldNoLabel } from "../../forms/OptionalFieldNoLabel";
import { LabelColumn } from "./LabelColumn";
import { WideValueColumn } from "./WideValueColumn";
import { EffectiveValue } from "./EffectiveValue";

import { PolicyComponentWithState } from "../../types/policy";

// Component with state interface for form handling
type ComponentWithState = PolicyComponentWithState;

export function ActionRowScript(
  component: ComponentWithState,
  action: string,
  name: string,
  help: string,
): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <LabelColumn name={name} help={help} />
      <WideValueColumn>{OptionalFieldNoLabel(component, "", "policy." + action, {})}</WideValueColumn>
      {EffectiveValue(component, action)}
    </div>
  );
}

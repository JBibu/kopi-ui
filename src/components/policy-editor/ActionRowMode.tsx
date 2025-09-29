import React from "react";
import { stateProperty } from "../../forms";
import { LabelColumn } from "./LabelColumn";
import { WideValueColumn } from "./WideValueColumn";
import { EffectiveValue } from "./EffectiveValue";

import { PolicyComponentWithState } from "../../types/policy";

// Component with state interface for form handling
type ComponentWithState = PolicyComponentWithState;

export function ActionRowMode(component: ComponentWithState, action: string): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <LabelColumn
        name="Command Mode"
        help="Essential (must succeed; default behavior), optional (failures are tolerated), or async (Kopia will start the action but not wait for it to finish)"
      />
      <WideValueColumn>
        <select
          name={"policy." + action}
          onChange={component.handleChange}
          value={stateProperty(component, "policy." + action)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="essential">must succeed</option>
          <option value="optional">ignore failures</option>
          <option value="async">run asynchronously, ignore failures</option>
        </select>
      </WideValueColumn>
      {EffectiveValue(component, action)}
    </div>
  );
}

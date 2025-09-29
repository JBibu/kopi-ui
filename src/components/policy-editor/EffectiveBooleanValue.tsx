import React from "react";
import { getDeepStateProperty } from "../../utils/deepstate";
import { EffectiveValueColumn } from "./EffectiveValueColumn";
import { Checkbox } from "../ui/checkbox";

// Types are available for future use if needed
// import { ResolvedPolicy, PolicyDefinitionPoint } from "../../types/policy";

// Component with state interface and policy definition point method
interface ComponentWithState {
  state: Record<string, unknown>;
  PolicyDefinitionPoint: (value: unknown) => string;
}

export function EffectiveBooleanValue(component: ComponentWithState, policyField: string): React.JSX.Element {
  const dsp = getDeepStateProperty(component, "resolved.definition." + policyField, undefined);

  return (
    <EffectiveValueColumn>
      <div className="space-y-2">
        <Checkbox
          data-testid={"effective-" + policyField}
          checked={getDeepStateProperty(component, "resolved.effective." + policyField, undefined)}
          disabled={true}
        />
        <p className="text-sm text-muted-foreground" data-testid={"definition-" + policyField}>
          {component.PolicyDefinitionPoint(dsp)}
        </p>
      </div>
    </EffectiveValueColumn>
  );
}

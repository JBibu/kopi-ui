import React from "react";
import { getDeepStateProperty } from "../../utils/deepstate";
import { EffectiveValueColumn } from "./EffectiveValueColumn";

// Types are available for future use if needed
// import { ResolvedPolicy, PolicyDefinitionPoint } from "../../types/policy";

// Component with state interface and policy definition point method
interface ComponentWithState {
  state: Record<string, unknown>;
  PolicyDefinitionPoint: (value: unknown) => string;
}

export function EffectiveListValue(component: ComponentWithState, policyField: string): React.JSX.Element {
  const dsp = getDeepStateProperty(component, "resolved.definition." + policyField, undefined);

  return (
    <EffectiveValueColumn>
      <div>
        <textarea
          data-testid={"effective-" + policyField}
          rows={5}
          value={getDeepStateProperty(component, "resolved.effective." + policyField, undefined)}
          readOnly={true}
        />
        <div data-testid={"definition-" + policyField}>{component.PolicyDefinitionPoint(dsp)}</div>
      </div>
    </EffectiveValueColumn>
  );
}

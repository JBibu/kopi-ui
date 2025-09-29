import React from "react";
import { getDeepStateProperty } from "../../utils/deepstate";
import { EffectiveValueColumn } from "./EffectiveValueColumn";
import { TimesOfDayList } from "../../forms/TimesOfDayList";

// Types are available for future use if needed
// import { ResolvedPolicy, PolicyDefinitionPoint } from "../../types/policy";
import { TimeOfDay } from "../../forms/TimesOfDayList";

// Component with state interface and policy definition point method
interface ComponentWithState {
  state: Record<string, unknown>;
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>, valueGetter?: (target: unknown) => (TimeOfDay | string)[] | undefined) => void;
  PolicyDefinitionPoint: (value: unknown) => string;
}

export function EffectiveTimesOfDayValue(
  component: ComponentWithState,
  policyField: string
): React.JSX.Element {
  return (
    <EffectiveValueColumn>
      <div>
        {TimesOfDayList(component, "resolved.effective." + policyField)}
        <div data-testid={"definition-" + policyField}>
          {component.PolicyDefinitionPoint(
            getDeepStateProperty(component, "resolved.definition." + policyField, undefined),
          )}
        </div>
      </div>
    </EffectiveValueColumn>
  );
}

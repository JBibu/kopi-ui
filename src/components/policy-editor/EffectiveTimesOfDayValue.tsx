import React from "react";
import { getDeepStateProperty } from "../../utils/deepstate";
import { EffectiveValueColumn } from "./EffectiveValueColumn";
import { TimesOfDayList } from "../../forms/TimesOfDayList";

// Component with state interface and policy definition point method
interface ComponentWithState {
  state: Record<string, any>;
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>, valueGetter?: (target: any) => any) => void;
  PolicyDefinitionPoint: (value: any) => string;
}

export function EffectiveTimesOfDayValue(
  component: ComponentWithState,
  policyField: string
): JSX.Element {
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

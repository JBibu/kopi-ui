import React from "react";
import { getDeepStateProperty } from "../../utils/deepstate";
import { EffectiveValueColumn } from "./EffectiveValueColumn";
import { TimesOfDayList } from "../../forms/TimesOfDayList";

export function EffectiveTimesOfDayValue(component, policyField) {
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

import React from "react";
import { getDeepStateProperty } from "../../utils/deepstate";
import { EffectiveValueColumn } from "./EffectiveValueColumn";

export function EffectiveTextAreaValue(component, policyField) {
  const dsp = getDeepStateProperty(component, "resolved.definition." + policyField, undefined);

  return (
    <EffectiveValueColumn>
      <div>
        <textarea
          data-testid={"effective-" + policyField}
          rows="5"
          value={getDeepStateProperty(component, "resolved.effective." + policyField, undefined)}
          readOnly={true}
        />
        <div data-testid={"definition-" + policyField}>{component.PolicyDefinitionPoint(dsp)}</div>
      </div>
    </EffectiveValueColumn>
  );
}

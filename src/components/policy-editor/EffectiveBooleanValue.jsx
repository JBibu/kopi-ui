import React from "react";
import { getDeepStateProperty } from "../../utils/deepstate";
import { EffectiveValueColumn } from "./EffectiveValueColumn";
import { Checkbox } from "../ui/checkbox";

export function EffectiveBooleanValue(component, policyField) {
  const dsp = getDeepStateProperty(component, "resolved.definition." + policyField, undefined);

  return (
    <EffectiveValueColumn>
      <div className="space-y-2">
        <Checkbox
          data-testid={"effective-" + policyField}
          checked={getDeepStateProperty(component, "resolved.effective." + policyField, undefined)}
          disabled={true}
        />
        <p className="text-sm text-muted-foreground" data-testid={"definition-" + policyField}>{component.PolicyDefinitionPoint(dsp)}</p>
      </div>
    </EffectiveValueColumn>
  );
}

import React from "react";
import { getDeepStateProperty } from "../../utils/deepstate";
import { EffectiveValueColumn } from "./EffectiveValueColumn";

export function EffectiveValue(component, policyField) {
  const dsp = getDeepStateProperty(component, "resolved.definition." + policyField, undefined);

  return (
    <EffectiveValueColumn>
      <div className="space-y-2">
        <select
          data-testid={"effective-" + policyField}
          value={getDeepStateProperty(component, "resolved.effective." + policyField, undefined)}
          readOnly={true}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <p className="text-sm text-muted-foreground" data-testid={"definition-" + policyField}>{component.PolicyDefinitionPoint(dsp)}</p>
      </div>
    </EffectiveValueColumn>
  );
}

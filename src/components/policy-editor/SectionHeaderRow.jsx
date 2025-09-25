import React from "react";
import { LabelColumn } from "./LabelColumn";
import { ValueColumn } from "./ValueColumn";
import { EffectiveValueColumn } from "./EffectiveValueColumn";

export function SectionHeaderRow() {
  return (
    <div className="space-y-4">
      <LabelColumn />
      <ValueColumn>
        <div className="policyEditorHeader">Defined</div>
      </ValueColumn>
      <EffectiveValueColumn>
        <div className="policyEditorHeader">Effective</div>
      </EffectiveValueColumn>
    </div>
  );
}

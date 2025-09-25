import React from "react";
import { OptionalFieldNoLabel } from "../../forms/OptionalFieldNoLabel";
import { LabelColumn } from "./LabelColumn";
import { WideValueColumn } from "./WideValueColumn";
import { EffectiveValue } from "./EffectiveValue";

export function ActionRowScript(component, action, name, help) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <LabelColumn name={name} help={help} />
      <WideValueColumn>{OptionalFieldNoLabel(component, "", "policy." + action, {})}</WideValueColumn>
      {EffectiveValue(component, action)}
    </div>
  );
}

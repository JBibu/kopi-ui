import React, { ReactNode } from "react";

interface EffectiveValueColumnProps {
  children?: ReactNode;
}

export function EffectiveValueColumn(props: EffectiveValueColumnProps): JSX.Element {
  return (
    <div className="flex-1 sm:w-1/3 policyEffectiveValue">
      {props.children}
    </div>
  );
}

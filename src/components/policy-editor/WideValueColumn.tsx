import React, { ReactNode } from "react";

interface WideValueColumnProps {
  children?: ReactNode;
}

export function WideValueColumn(props: WideValueColumnProps): React.JSX.Element {
  return <div className="flex-1 sm:w-3/5 policyValue">{props.children}</div>;
}

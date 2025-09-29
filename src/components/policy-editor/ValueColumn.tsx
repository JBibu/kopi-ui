import React, { ReactNode } from "react";

interface ValueColumnProps {
  children?: ReactNode;
}

export function ValueColumn(props: ValueColumnProps): React.JSX.Element {
  return <div className="flex-1 sm:w-1/4 policyValue">{props.children}</div>;
}

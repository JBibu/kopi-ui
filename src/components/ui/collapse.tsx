import * as React from "react";
import { Collapsible, CollapsibleContent } from "./collapsible";

interface CollapseProps {
  in: boolean;
  children: React.ReactNode;
  [key: string]: unknown;
}

// Bootstrap-compatible Collapse component that wraps shadcn Collapsible
export function Collapse({ in: isOpen, children, ...props }: CollapseProps) {
  return (
    <Collapsible open={isOpen} {...props}>
      <CollapsibleContent>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}


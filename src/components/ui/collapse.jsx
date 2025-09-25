import * as React from "react";
import PropTypes from "prop-types";
import { Collapsible, CollapsibleContent } from "./collapsible";

// Bootstrap-compatible Collapse component that wraps shadcn Collapsible
export function Collapse({ in: isOpen, children, ...props }) {
  return (
    <Collapsible open={isOpen} {...props}>
      <CollapsibleContent>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

Collapse.propTypes = {
  in: PropTypes.bool,
  children: PropTypes.node,
};
import React from "react";
import PropTypes from "prop-types";

export function WideValueColumn(props) {
  return (
    <div className="flex-1 sm:w-3/5 policyValue">
      {props.children}
    </div>
  );
}

WideValueColumn.propTypes = {
  children: PropTypes.node,
};

import React from "react";
import PropTypes from "prop-types";

export function WideValueColumn(props) {
  return (
    <div className="col-span-full sm:col-span-4 policyValue">
      {props.children}
    </div>
  );
}

WideValueColumn.propTypes = {
  children: PropTypes.node,
};

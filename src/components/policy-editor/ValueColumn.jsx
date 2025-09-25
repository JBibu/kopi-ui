import React from "react";
import PropTypes from "prop-types";

export function ValueColumn(props) {
  return (
    <div className="flex-1 sm:w-1/4 policyValue">
      {props.children}
    </div>
  );
}

ValueColumn.propTypes = {
  children: PropTypes.node,
};

import React from "react";
import PropTypes from "prop-types";

export function ValueColumn(props) {
  return (
    <div className="col-span-full sm:col-span-4 policyValue">
      {props.children}
    </div>
  );
}

ValueColumn.propTypes = {
  children: PropTypes.node,
};

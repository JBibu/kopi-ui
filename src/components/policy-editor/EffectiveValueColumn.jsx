import React from "react";
import PropTypes from "prop-types";

export function EffectiveValueColumn(props) {
  return (
    <div className="col-span-full sm:col-span-4 policyEffectiveValue">
      {props.children}
    </div>
  );
}

EffectiveValueColumn.propTypes = {
  children: PropTypes.node,
};

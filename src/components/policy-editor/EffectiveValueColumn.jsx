import React from "react";
import PropTypes from "prop-types";

export function EffectiveValueColumn(props) {
  return (
    <div className="flex-1 sm:w-1/3 policyEffectiveValue">
      {props.children}
    </div>
  );
}

EffectiveValueColumn.propTypes = {
  children: PropTypes.node,
};

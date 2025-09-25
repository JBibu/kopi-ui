import React from "react";
import PropTypes from "prop-types";

export function LabelColumn(props) {
  return (
    <div className="flex-1 sm:w-2/5 policyFieldColumn">
      <span className="policyField font-medium text-sm">{props.name}</span>
      {props.help && (
        <>
          <p className="label-help text-xs text-muted-foreground mt-1">{props.help}</p>
        </>
      )}
    </div>
  );
}

LabelColumn.propTypes = {
  name: PropTypes.string.isRequired,
  help: PropTypes.string,
};

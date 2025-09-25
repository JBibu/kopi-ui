import React from "react";
import PropTypes from "prop-types";

export function LabelColumn(props) {
  return (
    <div className="col-span-full sm:col-span-4 policyFieldColumn">
      <span className="policyField">{props.name}</span>
      {props.help && (
        <>
          <p className="label-help">{props.help}</p>
        </>
      )}
    </div>
  );
}

LabelColumn.propTypes = {
  name: PropTypes.string.isRequired,
  help: PropTypes.string,
};

import React, { Component } from "react";
import { handleChange, validateRequiredFields } from "../forms";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export class SetupRepositoryToken extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["token"]);
  }

  render() {
    return (
      <>
        <div className="space-y-4">
          {RequiredField(this, "Token", "token", {
            autoFocus: true,
            type: "password",
            placeholder: "paste connection token",
          })}
        </div>
      </>
    );
  }
}

SetupRepositoryToken.propTypes = {
  initial: PropTypes.object,
};

import React, { Component } from "react";
import { handleChange, validateRequiredFields } from "../forms";
import { RequiredField } from "../forms/RequiredField";
import { OptionalField } from "../forms/OptionalField";
import PropTypes from "prop-types";

export class SetupRepositoryB2 extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["bucket", "keyId", "key"]);
  }

  render() {
    return (
      <>
        <div className="space-y-4">
          {RequiredField(this, "B2 Bucket", "bucket", {
            autoFocus: true,
            placeholder: "enter bucket name",
          })}
        </div>
        <div className="space-y-4">
          {RequiredField(this, "Key ID", "keyId", {
            placeholder: "enter application or account key ID",
          })}
          {RequiredField(this, "Key", "key", {
            placeholder: "enter secret application or account key",
            type: "password",
          })}
        </div>
        <div className="space-y-4">
          {OptionalField(this, "Object Name Prefix", "prefix", {
            placeholder: "enter object name prefix or leave empty",
          })}
        </div>
      </>
    );
  }
}

SetupRepositoryB2.propTypes = {
  initial: PropTypes.object,
};

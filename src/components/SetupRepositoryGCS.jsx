import React, { Component } from "react";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export class SetupRepositoryGCS extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["bucket"]);
  }

  render() {
    return (
      <>
        <div className="space-y-4">
          {RequiredField(this, "GCS Bucket", "bucket", {
            autoFocus: true,
            placeholder: "enter bucket name",
          })}
          {OptionalField(this, "Object Name Prefix", "prefix", {
            placeholder: "enter object name prefix or leave empty",
            type: "password",
          })}
        </div>
        <div className="space-y-4">
          {OptionalField(this, "Credentials File", "credentialsFile", {
            placeholder: "enter name of credentials JSON file",
          })}
        </div>
        <div className="space-y-4">
          {OptionalField(this, "Credentials JSON", "credentials", {
            placeholder: "paste JSON credentials here",
            as: "textarea",
            rows: 5,
          })}
        </div>
      </>
    );
  }
}

SetupRepositoryGCS.propTypes = {
  initial: PropTypes.object,
};

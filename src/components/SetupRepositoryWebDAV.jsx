import React, { Component } from "react";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export class SetupRepositoryWebDAV extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["url"]);
  }

  render() {
    return (
      <>
        <div className="space-y-4">
          {RequiredField(this, "WebDAV Server URL", "url", {
            autoFocus: true,
            placeholder: "http[s]://server:port/path",
          })}
        </div>
        <div className="space-y-4">
          {OptionalField(this, "Username", "username", {
            placeholder: "enter username",
          })}
          {OptionalField(this, "Password", "password", {
            placeholder: "enter password",
            type: "password",
          })}
        </div>
      </>
    );
  }
}

SetupRepositoryWebDAV.propTypes = {
  initial: PropTypes.object,
};

import React, { Component } from "react";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export class SetupRepositoryRclone extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["remotePath"]);
  }

  render() {
    return (
      <>
        <div className="space-y-4">
          {RequiredField(this, "Rclone Remote Path", "remotePath", {
            autoFocus: true,
            placeholder: "enter <name-of-rclone-remote>:<path>",
          })}
        </div>
        <div className="space-y-4">
          {OptionalField(this, "Rclone Executable Path", "rcloneExe", {
            placeholder: "enter path to rclone executable",
          })}
        </div>
      </>
    );
  }
}

SetupRepositoryRclone.propTypes = {
  initial: PropTypes.object,
};

import React, { Component } from "react";
import { handleChange, validateRequiredFields } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";
import { NotificationFormatSelector } from "./NotificationFormatSelector";
import PropTypes from "prop-types";

export class PushoverNotificationMethod extends Component {
  constructor(props) {
    super();

    this.state = {
      format: "txt",
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    if (!validateRequiredFields(this, ["appToken", "userKey"])) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RequiredField(this, "Pushover App Token", "appToken", {
            autoFocus: true,
          })}
          {RequiredField(this, "Recipient User Key or Group Key", "userKey", {})}
          {NotificationFormatSelector(this, "format")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full">
            <hr />
            <p>
              Go to{" "}
              <a href="https://pushover.net/" target="_blank" rel="noopener noreferrer">
                Pushover.net
              </a>{" "}
              to setup your App Token and retrieve User or Group Keys.
            </p>
          </div>
        </div>
      </>
    );
  }
}

PushoverNotificationMethod.propTypes = {
  initial: PropTypes.object,
};

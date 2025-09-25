import React, { Component } from "react";
import { handleChange, validateRequiredFields } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";
import { RequiredNumberField } from "../../forms/RequiredNumberField";
import { OptionalField } from "../../forms/OptionalField";
import { NotificationFormatSelector } from "./NotificationFormatSelector";
import PropTypes from "prop-types";

export class EmailNotificationMethod extends Component {
  constructor(props) {
    super();

    this.state = {
      smtpPort: 587,
      format: "txt",
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    if (!validateRequiredFields(this, ["smtpServer", "smtpPort", "from", "to"])) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RequiredField(this, "SMTP Server", "smtpServer", {
            autoFocus: true,
            placeholder: "SMTP server DNS name, e.g. smtp.gmail.com",
          })}
          {RequiredNumberField(this, "SMTP Port", "smtpPort", {})}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OptionalField(this, "SMTP Username", "smtpUsername", {
            placeholder: "SMTP server username, typically the email address",
          })}
          {OptionalField(this, "SMTP Password", "smtpPassword", {
            placeholder: "SMTP server password",
            type: "password",
          })}
          {OptionalField(this, "SMTP Identity (Optional)", "smtpIdentity", {
            placeholder: "SMTP server identity (often empty)",
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RequiredField(this, "Mail From", "from", {
            placeholder: "sender email address",
          })}
          {RequiredField(this, "Mail To", "to", {
            placeholder: "reipient email addresses, comma-separated",
          })}
          {OptionalField(this, "CC", "cc", {
            placeholder: "CC addresses (comma-separated)",
          })}
          {NotificationFormatSelector(this, "format")}
        </div>
      </>
    );
  }
}

EmailNotificationMethod.propTypes = {
  initial: PropTypes.object,
};

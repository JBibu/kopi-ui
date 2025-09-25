import React, { Component } from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { handleChange, validateRequiredFields, stateProperty } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";
import { OptionalField } from "../../forms/OptionalField";
import { NotificationFormatSelector } from "./NotificationFormatSelector";
import PropTypes from "prop-types";
export class WebHookNotificationMethod extends Component {
  constructor(props) {
    super();

    this.state = {
      format: "txt",
      method: "POST",
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    if (!validateRequiredFields(this, ["endpoint"])) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RequiredField(this, "URL Endpoint", "endpoint", { autoFocus: true })}
          <div className="space-y-2">
            <Label className="required">HTTP Method</Label>
            <Select
              value={stateProperty(this, "method")}
              onValueChange={(value) => this.handleChange({
                target: { name: "method", value: value }
              })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {NotificationFormatSelector(this, "format")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OptionalField(
            this,
            "Additional Headers",
            "headers",
            { as: "textarea", rows: 5 },
            "Enter one header per line in the format 'Header: Value'.",
          )}
        </div>
      </>
    );
  }
}

WebHookNotificationMethod.propTypes = {
  initial: PropTypes.object,
};

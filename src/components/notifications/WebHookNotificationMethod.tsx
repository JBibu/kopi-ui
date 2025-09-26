import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { validateRequiredFields, stateProperty } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";
import { OptionalField } from "../../forms/OptionalField";
import { NotificationFormatSelector } from "./NotificationFormatSelector";

interface WebHookNotificationState {
  endpoint?: string;
  method?: string;
  format?: string;
  headers?: string;
  [key: string]: any;
}

interface WebHookNotificationMethodProps {
  initial?: WebHookNotificationState;
}

interface WebHookNotificationMethodRef {
  validate: () => boolean;
  state: WebHookNotificationState;
}

// Component interface for form compatibility
interface ComponentWithState {
  state: WebHookNotificationState;
  setState: React.Dispatch<React.SetStateAction<WebHookNotificationState>>;
}

export const WebHookNotificationMethod = forwardRef<WebHookNotificationMethodRef, WebHookNotificationMethodProps>(
  function WebHookNotificationMethod(props, ref) {
    const [state, setState] = useState<WebHookNotificationState>({
      format: "txt",
      method: "POST",
      ...props.initial,
    });

    // Create a component-like object for forms compatibility
    const componentRef = useRef<ComponentWithState>({
      state: state,
      setState: setState,
    });

    // Update componentRef when state changes
    useEffect(() => {
      componentRef.current.state = state;
      componentRef.current.setState = setState;
    }, [state]);

    const validate = (): boolean => {
      if (!validateRequiredFields(componentRef.current, ["endpoint"])) {
        return false;
      }
      return true;
    };

    const handleChange = (event: { target: { name: string; value: string } }): void => {
      const { name, value } = event.target;
      setState(prevState => ({
        ...prevState,
        [name]: value
      }));
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      validate,
      state
    }));

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RequiredField(componentRef.current, "URL Endpoint", "endpoint", { autoFocus: true })}
          <div className="space-y-2">
            <Label className="required">HTTP Method</Label>
            <Select
              value={stateProperty(componentRef.current, "method")}
              onValueChange={(value) => handleChange({
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
          {NotificationFormatSelector(componentRef.current, "format")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OptionalField(
            componentRef.current,
            "Additional Headers",
            "headers",
            { as: "textarea", rows: 5 },
            "Enter one header per line in the format 'Header: Value'.",
          )}
        </div>
      </>
    );
  }
);

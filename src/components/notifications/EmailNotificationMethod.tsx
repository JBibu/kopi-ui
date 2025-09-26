import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";
import { RequiredNumberField } from "../../forms/RequiredNumberField";
import { OptionalField } from "../../forms/OptionalField";
import { NotificationFormatSelector } from "./NotificationFormatSelector";

interface EmailNotificationState {
  smtpServer?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpIdentity?: string;
  from?: string;
  to?: string;
  cc?: string;
  format?: string;
  [key: string]: any;
}

interface EmailNotificationMethodProps {
  initial?: EmailNotificationState;
}

interface EmailNotificationMethodRef {
  validate: () => boolean;
  state: EmailNotificationState;
}

// Component interface for form compatibility
interface ComponentWithState {
  state: EmailNotificationState;
  setState: React.Dispatch<React.SetStateAction<EmailNotificationState>>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }, valueGetter?: (target: any) => any) => void;
}

export const EmailNotificationMethod = forwardRef<EmailNotificationMethodRef, EmailNotificationMethodProps>(
  function EmailNotificationMethod(props, ref) {
    const [state, setState] = useState<EmailNotificationState>({
      smtpPort: 587,
      format: "txt",
      ...props.initial,
    });

    // Create handleChange function that works with the form system
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }, valueGetter = (x: any) => x.value) => {
      const fieldName = event.target.name;
      const fieldValue = valueGetter(event.target);
      setState(prevState => ({ ...prevState, [fieldName]: fieldValue }));
    }, []);

    // Create a component-like object for forms compatibility
    const componentRef = useRef<ComponentWithState>({
      state: state,
      setState: setState,
      handleChange: handleChange,
    });

    // Keep componentRef in sync with current state
    componentRef.current.state = state;
    componentRef.current.setState = setState;
    componentRef.current.handleChange = handleChange;

    const validate = (): boolean => {
      if (!validateRequiredFields(componentRef.current, ["smtpServer", "smtpPort", "from", "to"])) {
        return false;
      }
      return true;
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      validate,
      state
    }));

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RequiredField(componentRef.current, "SMTP Server", "smtpServer", {
            autoFocus: true,
            placeholder: "SMTP server DNS name, e.g. smtp.gmail.com",
          })}
          {RequiredNumberField(componentRef.current, "SMTP Port", "smtpPort", {})}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OptionalField(componentRef.current, "SMTP Username", "smtpUsername", {
            placeholder: "SMTP server username, typically the email address",
          })}
          {OptionalField(componentRef.current, "SMTP Password", "smtpPassword", {
            placeholder: "SMTP server password",
            type: "password",
          })}
          {OptionalField(componentRef.current, "SMTP Identity (Optional)", "smtpIdentity", {
            placeholder: "SMTP server identity (often empty)",
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RequiredField(componentRef.current, "Mail From", "from", {
            placeholder: "sender email address",
          })}
          {RequiredField(componentRef.current, "Mail To", "to", {
            placeholder: "recipient email addresses, comma-separated",
          })}
          {OptionalField(componentRef.current, "CC", "cc", {
            placeholder: "CC addresses (comma-separated)",
          })}
          {NotificationFormatSelector(componentRef.current, "format")}
        </div>
      </>
    );
  }
);

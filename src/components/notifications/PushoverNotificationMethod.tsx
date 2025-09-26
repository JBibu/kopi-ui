import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";
import { NotificationFormatSelector } from "./NotificationFormatSelector";

interface PushoverNotificationState {
  appToken?: string;
  userKey?: string;
  format?: string;
  [key: string]: any;
}

interface PushoverNotificationMethodProps {
  initial?: PushoverNotificationState;
}

interface PushoverNotificationMethodRef {
  validate: () => boolean;
  state: PushoverNotificationState;
}

// Component interface for form compatibility
interface ComponentWithState {
  state: PushoverNotificationState;
  setState: React.Dispatch<React.SetStateAction<PushoverNotificationState>>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }, valueGetter?: (target: any) => any) => void;
}

export const PushoverNotificationMethod = forwardRef<PushoverNotificationMethodRef, PushoverNotificationMethodProps>(
  function PushoverNotificationMethod(props, ref) {
    const [state, setState] = useState<PushoverNotificationState>({
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
      if (!validateRequiredFields(componentRef.current, ["appToken", "userKey"])) {
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
          {RequiredField(componentRef.current, "Pushover App Token", "appToken", {
            autoFocus: true,
          })}
          {RequiredField(componentRef.current, "Recipient User Key or Group Key", "userKey", {})}
          {NotificationFormatSelector(componentRef.current, "format")}
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
);

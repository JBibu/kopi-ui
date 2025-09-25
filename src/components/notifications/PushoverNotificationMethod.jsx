import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";
import { NotificationFormatSelector } from "./NotificationFormatSelector";
import PropTypes from "prop-types";

export const PushoverNotificationMethod = forwardRef(function PushoverNotificationMethod(props, ref) {
  const [state, setState] = useState({
    format: "txt",
    ...props.initial,
  });

  // Create a component-like object for forms compatibility
  const componentRef = useRef({
    state: state,
    setState: setState,
  });

  // Update componentRef when state changes
  useEffect(() => {
    componentRef.current.state = state;
    componentRef.current.setState = setState;
  }, [state]);

  const validate = () => {
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
});

PushoverNotificationMethod.propTypes = {
  initial: PropTypes.object,
};

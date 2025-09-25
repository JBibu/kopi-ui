import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";
export const SetupRepositoryServer = forwardRef(function SetupRepositoryServer(props, ref) {
  const [state, setState] = useState({
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
    return validateRequiredFields(componentRef.current, ["url"]);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate,
    state
  }));

  return (
    <>
      <div className="space-y-4">
        {RequiredField(componentRef.current, "Server address", "url", {
          autoFocus: true,
          placeholder: "enter server URL (https://<host>:port)",
        })}
      </div>
      <div className="space-y-4">
        {OptionalField(componentRef.current, "Trusted server certificate fingerprint (SHA256)", "serverCertFingerprint", {
          placeholder: "enter trusted server certificate fingerprint printed at server startup",
        })}
      </div>
    </>
  );
});

SetupRepositoryServer.propTypes = {
  initial: PropTypes.object,
};

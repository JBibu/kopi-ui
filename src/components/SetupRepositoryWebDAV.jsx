import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export const SetupRepositoryWebDAV = forwardRef(function SetupRepositoryWebDAV(props, ref) {
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
        {RequiredField(componentRef.current, "WebDAV Server URL", "url", {
          autoFocus: true,
          placeholder: "http[s]://server:port/path",
        })}
      </div>
      <div className="space-y-4">
        {OptionalField(componentRef.current, "Username", "username", {
          placeholder: "enter username",
        })}
        {OptionalField(componentRef.current, "Password", "password", {
          placeholder: "enter password",
          type: "password",
        })}
      </div>
    </>
  );
});

SetupRepositoryWebDAV.propTypes = {
  initial: PropTypes.object,
};

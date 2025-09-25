import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { RequiredField } from "../forms/RequiredField";
import { OptionalField } from "../forms/OptionalField";
import PropTypes from "prop-types";

export const SetupRepositoryB2 = forwardRef(function SetupRepositoryB2(props, ref) {
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
    return validateRequiredFields(componentRef.current, ["bucket", "keyId", "key"]);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate,
    state
  }));

  return (
    <>
      <div className="space-y-4">
        {RequiredField(componentRef.current, "B2 Bucket", "bucket", {
          autoFocus: true,
          placeholder: "enter bucket name",
        })}
      </div>
      <div className="space-y-4">
        {RequiredField(componentRef.current, "Key ID", "keyId", {
          placeholder: "enter application or account key ID",
        })}
        {RequiredField(componentRef.current, "Key", "key", {
          placeholder: "enter secret application or account key",
          type: "password",
        })}
      </div>
      <div className="space-y-4">
        {OptionalField(componentRef.current, "Object Name Prefix", "prefix", {
          placeholder: "enter object name prefix or leave empty",
        })}
      </div>
    </>
  );
});

SetupRepositoryB2.propTypes = {
  initial: PropTypes.object,
};

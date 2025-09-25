import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { RequiredField } from "../forms/RequiredField";
import { OptionalField } from "../forms/OptionalField";
import PropTypes from "prop-types";

export const SetupRepositoryB2 = forwardRef(function SetupRepositoryB2(props, ref) {
  const [state, setState] = useState({
    ...props.initial,
  });

  // Create handleChange function that works with the form system
  const handleChange = useCallback((event, valueGetter = (x) => x.value) => {
    const fieldName = event.target.name;
    const fieldValue = valueGetter(event.target);
    setState(prevState => ({ ...prevState, [fieldName]: fieldValue }));
  }, []);

  // Create a component-like object for forms compatibility
  const componentRef = useRef({
    state: state,
    setState: setState,
    handleChange: handleChange,
  });

  // Keep componentRef in sync with current state
  componentRef.current.state = state;
  componentRef.current.setState = setState;
  componentRef.current.handleChange = handleChange;

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

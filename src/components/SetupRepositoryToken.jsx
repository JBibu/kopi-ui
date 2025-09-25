import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export const SetupRepositoryToken = forwardRef(function SetupRepositoryToken(props, ref) {
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
    return validateRequiredFields(componentRef.current, ["token"]);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate,
    state
  }));

  return (
    <>
      <div className="space-y-4">
        {RequiredField(componentRef.current, "Token", "token", {
          autoFocus: true,
          type: "password",
          placeholder: "paste connection token",
        })}
      </div>
    </>
  );
});

SetupRepositoryToken.propTypes = {
  initial: PropTypes.object,
};

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export const SetupRepositoryToken = forwardRef(function SetupRepositoryToken(props, ref) {
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

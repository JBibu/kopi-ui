import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export const SetupRepositoryRclone = forwardRef(function SetupRepositoryRclone(props, ref) {
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
    return validateRequiredFields(componentRef.current, ["remotePath"]);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate,
    state
  }));

  return (
    <>
      <div className="space-y-4">
        {RequiredField(componentRef.current, "Rclone Remote Path", "remotePath", {
          autoFocus: true,
          placeholder: "enter <name-of-rclone-remote>:<path>",
        })}
      </div>
      <div className="space-y-4">
        {OptionalField(componentRef.current, "Rclone Executable Path", "rcloneExe", {
          placeholder: "enter path to rclone executable",
        })}
      </div>
    </>
  );
});

SetupRepositoryRclone.propTypes = {
  initial: PropTypes.object,
};

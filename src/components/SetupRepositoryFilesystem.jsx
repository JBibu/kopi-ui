import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { RequiredDirectory } from "../forms/RequiredDirectory";
import PropTypes from "prop-types";

export const SetupRepositoryFilesystem = forwardRef(function SetupRepositoryFilesystem(props, ref) {
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
    return validateRequiredFields(componentRef.current, ["path"]);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate,
    state
  }));

  return (
    <>
      {RequiredDirectory(componentRef.current, "Directory Path", "path", {
        autoFocus: true,
        placeholder: "enter directory path where you want to store repository files",
      })}
    </>
  );
});

SetupRepositoryFilesystem.propTypes = {
  initial: PropTypes.object,
};

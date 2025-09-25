import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export const SetupRepositoryGCS = forwardRef(function SetupRepositoryGCS(props, ref) {
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
    return validateRequiredFields(componentRef.current, ["bucket"]);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate,
    state
  }));

  return (
    <>
      <div className="space-y-4">
        {RequiredField(componentRef.current, "GCS Bucket", "bucket", {
          autoFocus: true,
          placeholder: "enter bucket name",
        })}
        {OptionalField(componentRef.current, "Object Name Prefix", "prefix", {
          placeholder: "enter object name prefix or leave empty",
          type: "password",
        })}
      </div>
      <div className="space-y-4">
        {OptionalField(componentRef.current, "Credentials File", "credentialsFile", {
          placeholder: "enter name of credentials JSON file",
        })}
      </div>
      <div className="space-y-4">
        {OptionalField(componentRef.current, "Credentials JSON", "credentials", {
          placeholder: "paste JSON credentials here",
          as: "textarea",
          rows: 5,
        })}
      </div>
    </>
  );
});

SetupRepositoryGCS.propTypes = {
  initial: PropTypes.object,
};

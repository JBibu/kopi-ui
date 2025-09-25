import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export const SetupRepositoryS3 = forwardRef(function SetupRepositoryS3(props, ref) {
  const [state, setState] = useState({
    doNotUseTLS: false,
    doNotVerifyTLS: false,
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
    return validateRequiredFields(componentRef.current, ["bucket", "endpoint", "accessKeyID", "secretAccessKey"]);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate,
    state
  }));

  return (
    <>
      <div className="space-y-4">
        {RequiredField(componentRef.current, "Bucket", "bucket", {
          autoFocus: true,
          placeholder: "enter bucket name",
        })}
        {RequiredField(componentRef.current, "Server Endpoint", "endpoint", {
          placeholder: "enter server address (e.g., s3.amazonaws.com)",
        })}
        {OptionalField(componentRef.current, "Override Region", "region", {
          placeholder: "enter specific region (e.g., us-west-1) or leave empty",
        })}
      </div>
      <div className="space-y-4">
        {RequiredBoolean(componentRef.current, "Use HTTP connection (insecure)", "doNotUseTLS")}
        {RequiredBoolean(componentRef.current, "Do not verify TLS certificate", "doNotVerifyTLS")}
      </div>
      <div className="space-y-4">
        {RequiredField(componentRef.current, "Access Key ID", "accessKeyID", {
          placeholder: "enter access key ID",
        })}
        {RequiredField(componentRef.current, "Secret Access Key", "secretAccessKey", {
          placeholder: "enter secret access key",
          type: "password",
        })}
        {OptionalField(componentRef.current, "Session Token", "sessionToken", {
          placeholder: "enter session token or leave empty",
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

SetupRepositoryS3.propTypes = {
  initial: PropTypes.object,
};

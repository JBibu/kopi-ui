import React, { forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";

import { OptionalField } from "../forms/OptionalField";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";

import { useFormValidation, createLegacyFormRef } from "../hooks/useFormValidation";

export const SetupRepositoryS3 = forwardRef(function SetupRepositoryS3(props, ref) {
  const formState = useFormValidation(
    {
      doNotUseTLS: false,
      doNotVerifyTLS: false,
      ...props.initial,
    },
    ["bucket", "endpoint", "accessKeyID", "secretAccessKey"]
  );

  // Create legacy compatibility object for existing form components
  const componentRef = createLegacyFormRef(formState);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate: formState.validate,
    state: formState.state
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

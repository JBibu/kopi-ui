import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";
export const SetupRepositoryAzure = forwardRef(function SetupRepositoryAzure(props, ref) {
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
    return validateRequiredFields(componentRef.current, ["container", "storageAccount"]);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate,
    state
  }));

  return (
    <>
      <div className="space-y-4">
        {RequiredField(componentRef.current, "Container", "container", {
          autoFocus: true,
          placeholder: "enter container name",
        })}
        {OptionalField(componentRef.current, "Object Name Prefix", "prefix", {
          placeholder: "enter object name prefix or leave empty",
        })}
      </div>
      <div className="space-y-4">
        {RequiredField(componentRef.current, "Storage Account", "storageAccount", {
          placeholder: "enter storage account name",
        })}
        {OptionalField(componentRef.current, "Access Key", "storageKey", {
          placeholder: "enter secret access key",
          type: "password",
        })}
      </div>
      <div className="space-y-4">
        {OptionalField(componentRef.current, "Azure Storage Domain", "storageDomain", {
          placeholder: "enter storage domain or leave empty for default 'blob.core.windows.net'",
        })}
        {OptionalField(componentRef.current, "SAS Token", "sasToken", {
          placeholder: "enter secret SAS Token",
          type: "password",
        })}
      </div>
    </>
  );
});

SetupRepositoryAzure.propTypes = {
  initial: PropTypes.object,
};

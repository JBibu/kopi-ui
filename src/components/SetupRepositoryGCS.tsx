import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, MutableRefObject } from "react";
import { validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";

interface SetupRepositoryGCSProps {
  initial?: Record<string, any>;
}

interface ComponentRef {
  state: Record<string, any>;
  setState: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, valueGetter?: (x: any) => any) => void;
}

export interface SetupRepositoryGCSHandle {
  validate: () => boolean;
  state: Record<string, any>;
}

export const SetupRepositoryGCS = forwardRef<SetupRepositoryGCSHandle, SetupRepositoryGCSProps>(
  function SetupRepositoryGCS(props, ref) {
    const [state, setState] = useState<Record<string, any>>({
      ...props.initial,
    });

    // Create handleChange function that works with the form system
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, valueGetter = (x: any) => x.value) => {
      const fieldName = event.target.name;
      const fieldValue = valueGetter(event.target);
      setState(prevState => ({ ...prevState, [fieldName]: fieldValue }));
    }, []);

    // Create a component-like object for forms compatibility
    const componentRef: MutableRefObject<ComponentRef> = useRef({
      state: state,
      setState: setState,
      handleChange: handleChange,
    });

    // Keep componentRef in sync with current state
    componentRef.current.state = state;
    componentRef.current.setState = setState;
    componentRef.current.handleChange = handleChange;

    const validate = (): boolean => {
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
  }
);
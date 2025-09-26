import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, MutableRefObject } from "react";
import { validateRequiredFields } from "../forms";
import { RequiredField } from "../forms/RequiredField";
import { OptionalField } from "../forms/OptionalField";

interface SetupRepositoryB2Props {
  initial?: Record<string, any>;
}

interface ComponentRef {
  state: Record<string, any>;
  setState: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>, valueGetter?: (x: any) => any) => void;
}

export interface SetupRepositoryB2Handle {
  validate: () => boolean;
  state: Record<string, any>;
}

export const SetupRepositoryB2 = forwardRef<SetupRepositoryB2Handle, SetupRepositoryB2Props>(
  function SetupRepositoryB2(props, ref) {
    const [state, setState] = useState<Record<string, any>>({
      ...props.initial,
    });

    // Create handleChange function that works with the form system
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, valueGetter = (x: any) => x.value) => {
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
  }
);
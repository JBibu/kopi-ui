import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, MutableRefObject } from "react";
import { validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";

interface SetupRepositoryWebDAVProps {
  initial?: Record<string, any>;
}

interface ComponentRef {
  state: Record<string, any>;
  setState: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>, valueGetter?: (x: any) => any) => void;
}

export interface SetupRepositoryWebDAVHandle {
  validate: () => boolean;
  state: Record<string, any>;
}

export const SetupRepositoryWebDAV = forwardRef<SetupRepositoryWebDAVHandle, SetupRepositoryWebDAVProps>(
  function SetupRepositoryWebDAV(props, ref) {
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
      return validateRequiredFields(componentRef.current, ["url"]);
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      validate,
      state
    }));

    return (
      <>
        <div className="space-y-4">
          {RequiredField(componentRef.current, "WebDAV Server URL", "url", {
            autoFocus: true,
            placeholder: "http[s]://server:port/path",
          })}
        </div>
        <div className="space-y-4">
          {OptionalField(componentRef.current, "Username", "username", {
            placeholder: "enter username",
          })}
          {OptionalField(componentRef.current, "Password", "password", {
            placeholder: "enter password",
            type: "password",
          })}
        </div>
      </>
    );
  }
);
import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, MutableRefObject } from "react";
import { validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";

interface SetupRepositoryRcloneProps {
  initial?: Record<string, unknown>;
}

interface ComponentRef {
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    valueGetter?: (target: EventTarget & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)) => unknown,
  ) => void;
}

export interface SetupRepositoryRcloneHandle {
  validate: () => boolean;
  state: Record<string, unknown>;
}

export const SetupRepositoryRclone = forwardRef<SetupRepositoryRcloneHandle, SetupRepositoryRcloneProps>(
  function SetupRepositoryRclone(props, ref) {
    const [state, setState] = useState<Record<string, unknown>>({
      ...props.initial,
    });

    // Create handleChange function that works with the form system
    const handleChange = useCallback(
      (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        valueGetter?: (target: EventTarget & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)) => unknown,
      ) => {
        const fieldName = event.target.name;
        const fieldValue = valueGetter
          ? valueGetter(event.target as EventTarget & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement))
          : (event.target as HTMLInputElement).value;
        setState((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
      },
      [],
    );

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
      return validateRequiredFields(componentRef.current, ["remotePath"]);
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      validate,
      state,
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
  },
);

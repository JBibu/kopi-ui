import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, MutableRefObject } from "react";
import { validateRequiredFields, stateProperty } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { OptionalNumberField } from "../forms/OptionalNumberField";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";

interface SetupRepositorySFTPProps {
  initial?: Record<string, unknown>;
}

interface ComponentRef {
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, valueGetter?: (target: EventTarget & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)) => unknown) => void;
}

export interface SetupRepositorySFTPHandle {
  validate: () => boolean;
  state: Record<string, unknown>;
}

function hasExactlyOneOf(component: ComponentRef, names: string[]): boolean {
  let count = 0;

  for (let i = 0; i < names.length; i++) {
    if (stateProperty(component, names[i])) {
      count++;
    }
  }

  return count === 1;
}

export const SetupRepositorySFTP = forwardRef<SetupRepositorySFTPHandle, SetupRepositorySFTPProps>(
  function SetupRepositorySFTP(props, ref) {
    const [state, setState] = useState<Record<string, unknown>>({
      port: 22,
      validated: false,
      ...props.initial,
    });

    // Create handleChange function that works with the form system
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, valueGetter = (x: { value: unknown }) => x.value) => {
      const fieldName = event.target.name;
      const fieldValue = valueGetter ? valueGetter(event.target as EventTarget & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)) : (event.target as HTMLInputElement).value;
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
      setState(prevState => ({
        ...prevState,
        validated: true,
      }));

      // Update componentRef immediately for validation
      componentRef.current.state = { ...componentRef.current.state, validated: true };

      if (!validateRequiredFields(componentRef.current, ["host", "port", "username", "path"])) {
        return false;
      }

      if (componentRef.current.state.externalSSH) {
        return true;
      }

      if (!hasExactlyOneOf(componentRef.current, ["password", "keyfile", "keyData"])) {
        return false;
      }

      if (!hasExactlyOneOf(componentRef.current, ["knownHostsFile", "knownHostsData"])) {
        return false;
      }

      return true;
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      validate,
      state
    }));

    return (
      <>
        <div className="space-y-4">
          {RequiredField(componentRef.current, "Host", "host", {
            autoFocus: true,
            placeholder: "ssh host name (e.g., example.com)",
          })}
          {RequiredField(componentRef.current, "User", "username", {
            placeholder: "user name",
          })}
          {OptionalNumberField(componentRef.current, "Port", "port", {
            placeholder: "port number (e.g., 22)",
          })}
        </div>
        <div className="space-y-4">
          {RequiredField(componentRef.current, "Path", "path", {
            placeholder: "enter remote path to repository, e.g., '/mnt/data/repository'",
          })}
        </div>
        {!state.externalSSH && (
            <>
              <div className="space-y-4">
                {OptionalField(componentRef.current, "Password", "password", {
                  type: "password",
                  placeholder: "password",
                })}
              </div>
              <div className="space-y-4">
                {OptionalField(componentRef.current, "Path to key file", "keyfile", {
                  placeholder: "enter path to the key file",
                })}
                {OptionalField(componentRef.current, "Path to known_hosts File", "knownHostsFile", {
                  placeholder: "enter path to the known_hosts file",
                })}
              </div>
              <div className="space-y-4">
                {OptionalField(
                  componentRef.current,
                  "Key Data",
                  "keyData",
                  {
                    placeholder: "paste contents of the key file",
                    as: "textarea",
                    rows: 5,
                    isInvalid:
                      state.validated &&
                      !state.externalSSH &&
                      !hasExactlyOneOf(componentRef.current, ["password", "keyfile", "keyData"]),
                  },
                  null,
                  <>
                    One of <b>Password</b>, <b>Key File</b> or <b>Key Data</b> is required.
                  </>,
                )}
                {OptionalField(
                  componentRef.current,
                  "Known Hosts Data",
                  "knownHostsData",
                  {
                    placeholder: "paste contents of the known_hosts file",
                    as: "textarea",
                    rows: 5,
                    isInvalid:
                      state.validated &&
                      !state.externalSSH &&
                      !hasExactlyOneOf(componentRef.current, ["knownHostsFile", "knownHostsData"]),
                  },
                  null,
                  <>
                    Either <b>Known Hosts File</b> or <b>Known Hosts Data</b> is required, but not both.
                  </>,
                )}
              </div>
              <hr />
            </>
          )}
          {RequiredBoolean(
            componentRef.current,
            "Launch external password-less SSH command",
            "externalSSH",
            "By default Kopia connects to the server using internal SSH client which supports limited options. Alternatively it may launch external password-less SSH command, which supports additional options, but is generally less efficient than the built-in client.",
          )}
          {state.externalSSH && (
            <>
              <div className="space-y-4">
                {OptionalField(componentRef.current, "SSH Command", "sshCommand", {
                  placeholder: "provide enter passwordless SSH command to execute (typically 'ssh')",
                })}
                {OptionalField(componentRef.current, "SSH Arguments", "sshArguments", {
                  placeholder: "enter SSH command arguments ('user@host -s sftp' will be appended automatically)",
                })}
              </div>
            </>
          )}
        </>
      );
  }
);
import React, { forwardRef, useImperativeHandle } from "react";
import { FolderOpen } from "lucide-react";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { OptionalField } from "../forms/OptionalField";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";

import { useFormValidation, createLegacyFormRef, FormValidationState } from "../hooks/useFormValidation";

interface FieldDefinition {
  component: typeof RequiredField | typeof OptionalField | typeof RequiredBoolean;
  label: string;
  name: string;
  props?: Record<string, unknown>;
}

interface ProviderConfig {
  name: string;
  defaultState: Record<string, unknown>;
  requiredFields: string[];
  fields?: FieldDefinition[];
  customComponent?: boolean;
}

// Repository provider configurations
const PROVIDERS: Record<string, ProviderConfig> = {
  s3: {
    name: "Amazon S3",
    defaultState: {
      doNotUseTLS: false,
      doNotVerifyTLS: false,
    },
    requiredFields: ["bucket", "endpoint", "accessKeyID", "secretAccessKey"],
    fields: [
      { component: RequiredField, label: "Bucket", name: "bucket", props: { autoFocus: true, placeholder: "enter bucket name" }},
      { component: RequiredField, label: "Server Endpoint", name: "endpoint", props: { placeholder: "enter server address (e.g., s3.amazonaws.com)" }},
      { component: OptionalField, label: "Override Region", name: "region", props: { placeholder: "enter specific region (e.g., us-west-1) or leave empty" }},
      { component: RequiredBoolean, label: "Use HTTP connection (insecure)", name: "doNotUseTLS" },
      { component: RequiredBoolean, label: "Do not verify TLS certificate", name: "doNotVerifyTLS" },
      { component: RequiredField, label: "Access Key ID", name: "accessKeyID", props: { placeholder: "enter access key ID" }},
      { component: RequiredField, label: "Secret Access Key", name: "secretAccessKey", props: { placeholder: "enter secret access key", type: "password" }},
      { component: OptionalField, label: "Session Token", name: "sessionToken", props: { placeholder: "enter session token or leave empty", type: "password" }},
      { component: OptionalField, label: "Object Name Prefix", name: "prefix", props: { placeholder: "enter object name prefix or leave empty" }},
    ],
  },
  gcs: {
    name: "Google Cloud Storage",
    defaultState: {},
    requiredFields: ["bucket"],
    fields: [
      { component: RequiredField, label: "Bucket", name: "bucket", props: { autoFocus: true, placeholder: "enter bucket name" }},
      { component: OptionalField, label: "Object Name Prefix", name: "prefix", props: { placeholder: "enter object name prefix or leave empty" }},
      { component: OptionalField, label: "Credentials File", name: "credentialsFile", props: { placeholder: "enter path to credentials JSON file or leave empty" }},
      { component: OptionalField, label: "Service Account Key", name: "serviceAccountKey", props: { placeholder: "enter service account key JSON or leave empty", type: "password" }},
    ],
  },
  azure: {
    name: "Azure Blob Storage",
    defaultState: {},
    requiredFields: ["container", "storageAccount"],
    fields: [
      { component: RequiredField, label: "Container", name: "container", props: { autoFocus: true, placeholder: "enter container name" }},
      { component: RequiredField, label: "Storage Account", name: "storageAccount", props: { placeholder: "enter storage account name" }},
      { component: OptionalField, label: "Object Name Prefix", name: "prefix", props: { placeholder: "enter object name prefix or leave empty" }},
      { component: RequiredField, label: "Storage Key", name: "storageKey", props: { placeholder: "enter storage key", type: "password" }},
    ],
  },
  filesystem: {
    name: "Local Filesystem",
    defaultState: {
      path: "",
    },
    requiredFields: ["path"],
    customComponent: true, // Use custom rendering for filesystem
  },
  sftp: {
    name: "SFTP",
    defaultState: {
      port: 22,
    },
    requiredFields: ["path", "host", "username"],
    fields: [
      { component: RequiredField, label: "Path", name: "path", props: { autoFocus: true, placeholder: "enter path on remote server" }},
      { component: RequiredField, label: "Host", name: "host", props: { placeholder: "enter hostname or IP address" }},
      { component: RequiredField, label: "Username", name: "username", props: { placeholder: "enter username" }},
      { component: OptionalField, label: "Port", name: "port", props: { placeholder: "enter port number (default: 22)", type: "number" }},
      { component: OptionalField, label: "Password", name: "password", props: { placeholder: "enter password or leave empty for key-based auth", type: "password" }},
      { component: OptionalField, label: "Private Key Path", name: "keyfile", props: { placeholder: "enter path to private key file or leave empty" }},
    ],
  },
  webdav: {
    name: "WebDAV",
    defaultState: {},
    requiredFields: ["url", "username"],
    fields: [
      { component: RequiredField, label: "WebDAV URL", name: "url", props: { autoFocus: true, placeholder: "enter WebDAV server URL" }},
      { component: RequiredField, label: "Username", name: "username", props: { placeholder: "enter username" }},
      { component: OptionalField, label: "Password", name: "password", props: { placeholder: "enter password or leave empty", type: "password" }},
    ],
  },
  b2: {
    name: "Backblaze B2",
    defaultState: {},
    requiredFields: ["bucket", "keyID", "key"],
    fields: [
      { component: RequiredField, label: "Bucket", name: "bucket", props: { autoFocus: true, placeholder: "enter bucket name" }},
      { component: RequiredField, label: "Key ID", name: "keyID", props: { placeholder: "enter application key ID" }},
      { component: RequiredField, label: "Key", name: "key", props: { placeholder: "enter application key", type: "password" }},
      { component: OptionalField, label: "Object Name Prefix", name: "prefix", props: { placeholder: "enter object name prefix or leave empty" }},
    ],
  },
};

interface FilesystemFieldsProps {
  formState: FormValidationState;
  onDirectorySelected: (path: string) => void;
}

const FilesystemFields: React.FC<FilesystemFieldsProps> = ({ formState, onDirectorySelected }) => (
  <div className="space-y-2">
    <Label htmlFor="path" className="text-sm font-medium required">
      Directory Path
      <span className="text-red-500 ml-1">*</span>
    </Label>
    <div className="flex gap-2">
      <Input
        id="path"
        name="path"
        value={typeof formState.state.path === 'string' ? formState.state.path : ""}
        data-testid="control-path"
        onChange={(e) => formState.handleChange("path", e.target.value)}
        className={formState.errors.path && formState.touched.path ? "border-red-500 focus:border-red-500 flex-1" : "flex-1"}
        autoFocus={true}
        placeholder="enter directory path where you want to store repository files"
      />
      {window.kopiaUI && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.kopiaUI?.selectDirectory(onDirectorySelected)}
        >
          <FolderOpen className="h-4 w-4" />
        </Button>
      )}
    </div>
    {formState.errors.path && formState.touched.path && (
      <p className="text-sm text-red-500">{formState.errors.path}</p>
    )}
  </div>
);

interface RepositorySetupFormProps {
  provider: keyof typeof PROVIDERS;
  initial?: Record<string, unknown>;
}

export interface RepositorySetupFormHandle {
  validate: () => boolean;
  state: Record<string, unknown>;
}

export const RepositorySetupForm = forwardRef<RepositorySetupFormHandle, RepositorySetupFormProps>(
  function RepositorySetupForm({ provider, initial }, ref) {
    const config = PROVIDERS[provider];

    if (!config) {
      throw new Error(`Unsupported repository provider: ${provider}`);
    }

    const formState = useFormValidation(
      {
        ...config.defaultState,
        ...initial,
      },
      config.requiredFields
    );

    // Create legacy compatibility object for existing form components
    const componentRef = createLegacyFormRef(formState);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      validate: formState.validate,
      state: formState.state
    }));

    // Handle filesystem directory selection
    const onDirectorySelected = (path: string): void => {
      formState.handleChange("path", path);
    };

    // Custom rendering for filesystem provider
    if (config.customComponent && provider === "filesystem") {
      return <FilesystemFields formState={formState} onDirectorySelected={onDirectorySelected} />;
    }

    // Group fields by section for better organization
    const groupedFields: FieldDefinition[][] = [];
    let currentGroup: FieldDefinition[] = [];

    config.fields?.forEach((field, index) => {
      currentGroup.push(field);

      // Start new group after certain field types or every 4 fields
      if (
        field.component === RequiredBoolean ||
        (index > 0 && field.name.includes("Key")) ||
        currentGroup.length >= 4
      ) {
        groupedFields.push([...currentGroup]);
        currentGroup = [];
      }
    });

    // Add remaining fields
    if (currentGroup.length > 0) {
      groupedFields.push(currentGroup);
    }

    return (
      <>
        {groupedFields.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            {group.map((field, fieldIndex) => {
              const FieldComponent = field.component;
              return (
                <div key={`${groupIndex}-${fieldIndex}`}>
                  {FieldComponent(componentRef.current, field.label, field.name, field.props)}
                </div>
              );
            })}
          </div>
        ))}
      </>
    );
  }
);

// Export provider configurations for use in other components
export { PROVIDERS };

// Export individual provider components for backward compatibility
export const SetupRepositoryS3 = forwardRef<RepositorySetupFormHandle, { initial?: Record<string, unknown> }>(
  function SetupRepositoryS3(props, ref) {
    return <RepositorySetupForm provider="s3" {...props} ref={ref} />;
  }
);

export const SetupRepositoryGCS = forwardRef<RepositorySetupFormHandle, { initial?: Record<string, unknown> }>(
  function SetupRepositoryGCS(props, ref) {
    return <RepositorySetupForm provider="gcs" {...props} ref={ref} />;
  }
);

export const SetupRepositoryAzure = forwardRef<RepositorySetupFormHandle, { initial?: Record<string, unknown> }>(
  function SetupRepositoryAzure(props, ref) {
    return <RepositorySetupForm provider="azure" {...props} ref={ref} />;
  }
);

export const SetupRepositoryFilesystem = forwardRef<RepositorySetupFormHandle, { initial?: Record<string, unknown> }>(
  function SetupRepositoryFilesystem(props, ref) {
    return <RepositorySetupForm provider="filesystem" {...props} ref={ref} />;
  }
);

export const SetupRepositorySFTP = forwardRef<RepositorySetupFormHandle, { initial?: Record<string, unknown> }>(
  function SetupRepositorySFTP(props, ref) {
    return <RepositorySetupForm provider="sftp" {...props} ref={ref} />;
  }
);

export const SetupRepositoryWebDAV = forwardRef<RepositorySetupFormHandle, { initial?: Record<string, unknown> }>(
  function SetupRepositoryWebDAV(props, ref) {
    return <RepositorySetupForm provider="webdav" {...props} ref={ref} />;
  }
);

export const SetupRepositoryB2 = forwardRef<RepositorySetupFormHandle, { initial?: Record<string, unknown> }>(
  function SetupRepositoryB2(props, ref) {
    return <RepositorySetupForm provider="b2" {...props} ref={ref} />;
  }
);
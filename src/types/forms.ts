// Form Component Types for Kopia UI

import { ReactNode } from 'react';

// Base form component interface
export interface FormComponentRef {
  state: Record<string, unknown>;
  setState: (updates: Record<string, unknown>) => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, valueGetter?: (target: EventTarget & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)) => unknown) => void;
}

// Field component props
export interface BaseFieldProps {
  autoFocus?: boolean;
  placeholder?: string;
  help?: string;
  className?: string;
  readOnly?: boolean;
  type?: string;
}

export interface RequiredFieldProps extends BaseFieldProps {
  // Props are passed as the fourth parameter in the legacy pattern
}

export interface OptionalFieldProps extends BaseFieldProps {
  // Props are passed as the fourth parameter in the legacy pattern
}

export interface RequiredBooleanProps extends BaseFieldProps {
  // Props are passed as the fourth parameter in the legacy pattern
}

export interface NumberFieldProps extends BaseFieldProps {
  min?: number;
  max?: number;
  step?: number;
}

export interface DirectoryFieldProps extends BaseFieldProps {
  onDirectorySelected?: (path: string) => void;
}

export interface StringListProps extends BaseFieldProps {
  placeholder?: string;
}

export interface TimesOfDayProps extends BaseFieldProps {
  // Specific props for times of day component
}

// Repository provider configuration types
export interface RepositoryProviderField {
  component: 'RequiredField' | 'OptionalField' | 'RequiredBoolean' | 'RequiredNumberField' | 'OptionalNumberField';
  label: string;
  name: string;
  props?: BaseFieldProps | NumberFieldProps;
}

export interface RepositoryProviderConfig {
  name: string;
  defaultState: Record<string, unknown>;
  requiredFields: string[];
  fields?: RepositoryProviderField[];
  customComponent?: boolean;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Legacy form function signatures
export type FormFieldRenderer = (
  component: FormComponentRef,
  label: string,
  name: string,
  props?: Record<string, unknown>,
  helpText?: string | null
) => ReactNode;

// Repository setup types
export interface RepositorySetupFormData {
  // S3
  bucket?: string;
  endpoint?: string;
  region?: string;
  doNotUseTLS?: boolean;
  doNotVerifyTLS?: boolean;
  accessKeyID?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  prefix?: string;

  // Filesystem
  path?: string;

  // SFTP
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  keyfile?: string;

  // WebDAV
  url?: string;

  // Azure
  container?: string;
  storageAccount?: string;
  storageKey?: string;

  // GCS
  credentialsFile?: string;
  serviceAccountKey?: string;

  // B2
  keyID?: string;
  key?: string;
}
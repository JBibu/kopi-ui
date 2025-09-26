// Common Component Prop Types for Kopia UI

import { ReactNode } from 'react';
import { Location, NavigateFunction } from 'react-router-dom';
import { Policy, Repository, Source, Task } from './api';

// Navigation Props
export interface RouteComponentProps {
  location: Location;
  navigate: NavigateFunction;
  params?: Record<string, string>;
}

// Common Component Props
export interface PageComponentProps extends RouteComponentProps {
  children?: ReactNode;
}

// Context Types
export interface AppContextValue {
  hostname?: string;
  username?: string;
  canChangePassword?: boolean;
  serverInfo?: {
    version?: string;
    buildInfo?: {
      version: string;
      gitRevision?: string;
      buildTime?: string;
    };
  };
  repositoryDescription?: string;
  apiServerURL?: string;
  configFile?: string;
  readonly?: boolean;
  localUsername?: string;
  multiUser?: boolean;
  refreshUserInfo?: () => void;
}

export interface UIPreferencesContextValue {
  theme: 'light' | 'dark' | 'auto';
  bytesStringBase2: boolean;
  defaultSnapshotViewAction: string;
  pageSize: number;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setBytesStringBase2: (value: boolean) => void;
  setDefaultSnapshotViewAction: (action: string) => void;
  setPageSize: (size: number) => void;
}

export interface AlertContextValue {
  alert?: {
    message: string;
    variant?: 'success' | 'info' | 'warning' | 'danger';
  };
  setAlert: (alert: { message: string; variant?: string }) => void;
  clearAlert: () => void;
}

export interface ErrorContextValue {
  error?: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
}

// Table Component Props
export interface KopiaTableColumn<T = any> {
  id?: string;
  header: string | ReactNode;
  accessor?: string | ((row: T) => any);
  accessorFn?: (row: T) => any;
  cell?: (props: { row: { original: T }; cell: { getValue: () => any } }) => ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface KopiaTableProps<T = any> {
  data: T[];
  columns: KopiaTableColumn<T>[];
  defaultSort?: string;
  defaultSortOrder?: 'asc' | 'desc';
  pageSize?: number;
  className?: string;
}

// Form Component Props
export interface RequiredFieldProps {
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  className?: string;
  help?: string;
  readOnly?: boolean;
  invalid?: boolean;
  invalidFeedback?: string;
}

export interface OptionalFieldProps extends Omit<RequiredFieldProps, 'value'> {
  value?: string;
}

export interface RequiredBooleanProps {
  name: string;
  label: string;
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  help?: string;
  className?: string;
}

export interface SelectOptionProps {
  name: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }> | string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  help?: string;
  className?: string;
}

// Policy Editor Props
export interface PolicyEditorProps {
  policy: Policy;
  policies?: Policy[];
  policyDefinition?: any;
  sourceInfo?: Source;
  onChange?: (policy: Policy) => void;
  onSave?: () => void;
  onCancel?: () => void;
  isNew?: boolean;
  readOnly?: boolean;
}

export interface EffectiveValueProps {
  definition: {
    label?: string;
    help?: string;
    type?: string;
    enum?: string[];
    default?: any;
  };
  effectiveValue?: any;
  sourceDescription?: string;
  className?: string;
}

// Repository Setup Props
export interface ProviderCardProps {
  provider: string;
  title: string;
  icon?: ReactNode;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
}

export interface RepositorySetupFormProps {
  provider: string;
  providerSettings: Record<string, any>;
  onChange?: (settings: Record<string, any>) => void;
  onValidate?: () => boolean;
  advanced?: boolean;
}

// Notification Props
export interface NotificationEditorProps {
  profile?: {
    profileName: string;
    profileType: 'email' | 'webhook' | 'pushover';
    config: Record<string, any>;
  };
  onSave?: (profile: any) => void;
  onCancel?: () => void;
  isNew?: boolean;
}

export interface NotificationMethodProps {
  config: Record<string, any>;
  onChange?: (config: Record<string, any>) => void;
  onValidate?: () => boolean;
}

// Snapshot Props
export interface SnapshotViewerProps {
  snapshotID: string;
  rootID?: string;
  path?: string;
  onNavigate?: (path: string) => void;
}

export interface SnapshotEstimationProps {
  sourceInfo: Source;
  onClose?: () => void;
  onStart?: () => void;
}

// Task Props
export interface TaskDetailsProps {
  task: Task;
  onCancel?: () => void;
  onRetry?: () => void;
}

export interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onRefresh?: () => void;
  showCompleted?: boolean;
}

// Directory Browser Props
export interface DirectoryBreadcrumbsProps {
  path: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export interface DirectoryItemsProps {
  items: Array<{
    name: string;
    type: 'f' | 'd' | 's';
    size?: number;
    mtime?: string;
  }>;
  onItemClick?: (item: any) => void;
  onSelectionChange?: (selected: string[]) => void;
  multiSelect?: boolean;
}

// CLI Equivalent Props
export interface CLIEquivalentProps {
  command: string | string[];
  comment?: string;
  className?: string;
}

// Button Props
export interface GoBackButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
}

// Theme Props
export interface ThemeSelectorProps {
  value?: 'light' | 'dark' | 'auto';
  onChange?: (theme: 'light' | 'dark' | 'auto') => void;
  className?: string;
}
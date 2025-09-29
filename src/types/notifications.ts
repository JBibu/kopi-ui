// Notification configuration types
export interface NotificationProfile {
  profile: string;
  method: NotificationMethod;
  minSeverity: number;
}

export interface NotificationMethod {
  type: string;
  config: Record<string, unknown>;
}

export interface EmailNotificationConfig {
  smtpServer?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpIdentity?: string;
  from?: string;
  to?: string;
  cc?: string;
  format?: string;
}

export interface WebhookNotificationConfig {
  url?: string;
  headers?: Record<string, string>;
  format?: string;
}

export interface PushoverNotificationConfig {
  apiToken?: string;
  userKey?: string;
  device?: string;
  title?: string;
  priority?: number;
  sound?: string;
  format?: string;
}

// Form component interface for notifications
export interface NotificationComponentWithState<T = Record<string, unknown>> {
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>>;
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: unknown } },
    valueGetter?: (target: { value: unknown }) => unknown
  ) => void;
}

export interface NotificationMethodComponent {
  displayName: string;
  component: React.ComponentType<Record<string, unknown>>;
}
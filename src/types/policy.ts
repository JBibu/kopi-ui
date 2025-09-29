// Policy configuration types
export interface PolicyData {
  [key: string]: unknown;
  compression?: {
    compressFiles?: boolean;
  };
  errorHandling?: {
    ignoreFileErrors?: boolean;
  };
  upload?: {
    maxParallelUploads?: number;
  };
  logging?: {
    level?: string;
  };
  actions?: {
    beforeSnapshotRoot?: ActionConfig;
    afterSnapshotRoot?: ActionConfig;
    beforeFolder?: ActionConfig;
    afterFolder?: ActionConfig;
  };
  retention?: RetentionConfig;
  files?: FilesConfig;
  scheduling?: SchedulingConfig;
}

export interface ActionConfig {
  mode?: 'essential' | 'optional' | 'async';
  script?: string;
  timeout?: number;
}

export interface RetentionConfig {
  keepLatest?: number;
  keepHourly?: number;
  keepDaily?: number;
  keepWeekly?: number;
  keepMonthly?: number;
  keepAnnual?: number;
}

export interface FilesConfig {
  ignore?: string[];
  dotIgnoreFiles?: string[];
  maxFileSize?: number;
  oneFileSystem?: boolean;
}

export interface SchedulingConfig {
  intervalSeconds?: number;
  timesOfDay?: Array<{
    hour: number;
    min: number;
  }>;
  manual?: boolean;
}

export interface ResolvedPolicy {
  [key: string]: unknown;
}

export interface PolicyDefinitionPoint {
  [key: string]: unknown;
}

// Component with state interface for policy forms
export interface PolicyComponentWithState {
  state: {
    policy: PolicyData;
  };
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, valueGetter?: (target: unknown) => unknown) => void;
}
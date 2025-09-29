// API Response Types for Kopia UI

// Snapshot Types
export interface SnapshotSummary {
  size: number;
  files: number;
  dirs: number;
  errors?: number;
  warnings?: number;
}

export interface Snapshot {
  id: string;
  source: {
    host: string;
    userName: string;
    path: string;
  };
  description?: string;
  startTime: string;
  endTime?: string;
  rootID: string;
  summary: SnapshotSummary;
  retention: string[];
  pins: string[];
  manifestID?: string;
}

export interface SnapshotsResponse {
  snapshots: Snapshot[];
  unfilteredCount: number;
  uniqueCount: number;
}

// Repository Types
export interface Repository {
  configFile: string;
  description?: string;
  readonly: boolean;
  username?: string;
  hostname?: string;
  apiServerURL?: string;
  status?: string;
  contentFormat?: {
    formatVersion: number;
    hash?: string;
    encryption?: string;
  };
}

export interface RepositoryStatus {
  connected?: boolean;
  description?: string;
  initTaskID?: string;
  readonly?: boolean;
  apiServerURL?: string;
  configFile?: string;
  storage?: string;
  encryption?: string;
  hash?: string;
  splitter?: string;
  formatVersion?: string;
  eccOverheadPercent?: number;
  ecc?: string;
  supportsContentCompression?: boolean;
  username?: string;
  hostname?: string;
}

// Policy Types
export interface RetentionPolicy {
  keepLatest?: number;
  keepHourly?: number;
  keepDaily?: number;
  keepWeekly?: number;
  keepMonthly?: number;
  keepAnnual?: number;
}

export interface SchedulingPolicy {
  manual?: boolean;
  intervalSeconds?: number;
  timesOfDay?: string[];
  noParentTimesOfDay?: boolean;
}

export interface CompressionPolicy {
  compressorName?: string;
  onlyCompress?: string[];
  neverCompress?: string[];
  minSize?: number;
  maxSize?: number;
}

export interface Policy {
  id?: string;
  target?: {
    host?: string;
    userName?: string;
    path?: string;
  };
  retention?: RetentionPolicy;
  files?: {
    ignore?: string[];
    ignoreDotFiles?: string[];
    noParentIgnore?: boolean;
    oneFileSystem?: boolean;
  };
  errorHandling?: {
    ignoreFileErrors?: boolean;
    ignoreDirectoryErrors?: boolean;
    ignoreUnknownTypes?: boolean;
  };
  scheduling?: SchedulingPolicy;
  compression?: CompressionPolicy;
  actions?: {
    beforeSnapshotRoot?: {
      path?: string;
      args?: string[];
      timeout?: number;
      mode?: string;
    };
    afterSnapshotRoot?: {
      path?: string;
      args?: string[];
      timeout?: number;
      mode?: string;
    };
  };
  upload?: {
    maxParallelSnapshots?: number;
    maxParallelFileReads?: number;
  };
  upcomingSnapshotTimes?: string[];
}

// Task Types
export interface TaskLog {
  timestamp: string;
  message: string;
  level?: "info" | "error" | "warning" | "debug";
}

export interface Task {
  id: string;
  kind: string;
  description: string;
  status: "running" | "success" | "failed" | "cancelled";
  startTime: string;
  endTime?: string;
  logs?: TaskLog[];
  counters?: Record<string, number>;
  progressPercent?: number;
}

export interface TasksResponse {
  tasks: Task[];
  totalCount?: number;
}

// Source Types
export interface Source {
  source: {
    host: string;
    userName: string;
    path: string;
  };
  status: "IDLE" | "UPLOADING" | "PENDING" | "PAUSED";
  lastSnapshot?: {
    id: string;
    startTime: string;
    endTime?: string;
    summary?: SnapshotSummary;
  };
  nextSnapshotTime?: string;
  policy?: Policy;
}

export interface SourcesResponse {
  sources: Source[];
  localHost: string;
  localUsername: string;
}

// Storage Provider Types
export interface ProviderSettings {
  type: string;
  config: Record<string, unknown>;
  description?: string;
  isReadOnly?: boolean;
  formatVersion?: number;
}

export interface StorageInfo {
  connectionInfo: {
    configFile: string;
    cacheDirectory?: string;
  };
  storageConfig: ProviderSettings;
}

// Preferences Types
export interface UIPreferences {
  theme?: "light" | "dark" | "auto";
  bytesStringBase2?: boolean;
  defaultSnapshotViewAction?: string;
  pageSize?: number;
}

// Directory Entry Types
export interface DirectoryEntry {
  name: string;
  type: "f" | "d" | "s"; // file, directory, symlink
  size: number;
  mode: string;
  mtime: string;
  obj?: string;
  summ?: {
    size: number;
    files: number;
    dirs: number;
    errors?: number;
  };
}

export interface DirectoryInfo {
  path: string;
  entries: DirectoryEntry[];
  summary?: SnapshotSummary;
}

// Mount Types
export interface MountedSnapshot {
  root: string;
  source: {
    host: string;
    userName: string;
    path: string;
  };
  mountPoint: string;
}

export interface MountInfo {
  path: string;
  controller?: string;
  mounted?: MountedSnapshot[];
}

// Task Summary Types
export interface TasksSummaryResponse {
  RUNNING?: number;
  SUCCESS?: number;
  FAILED?: number;
  CANCELED?: number;
}

// Estimation Types
export interface EstimateResult {
  stats: {
    excluded: {
      fileCount: number;
      totalFileSize: number;
    };
    included: {
      fileCount: number;
      totalFileSize: number;
    };
    errors: number;
  };
  uploadSpeed?: number;
  estimatedTime?: number;
}

// Notification Types
export interface NotificationProfile {
  profileName: string;
  profileType: "email" | "webhook" | "pushover";
  config: Record<string, unknown>;
}

export interface NotificationConfig {
  profiles?: NotificationProfile[];
  templates?: Record<string, string>;
}

// Error Response
export interface ErrorResponse {
  error: string;
  details?: string;
}

// Server Info Types
export interface ServerInfo {
  version: string;
  buildInfo: {
    version: string;
    gitRevision: string;
    buildTime: string;
  };
  hostname?: string;
  username?: string;
  supportsContentCompression?: boolean;
}

// Algorithm Types
export interface Algorithms {
  defaultHash?: string;
  defaultEncryption?: string;
  defaultSplitter?: string;
  defaultCompression?: string;
  hash: string[];
  encryption: string[];
  splitter: string[];
  compression: string[];
}

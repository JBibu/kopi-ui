import { Algorithms } from "../../types/api";

export interface ProviderInfo {
  provider: string;
  description: string;
  component: React.ComponentType<Record<string, unknown>>;
}

export interface RepositoryState {
  confirmCreate: boolean;
  isLoading: boolean;
  showAdvanced: boolean;
  storageVerified: boolean;
  providerSettings: Record<string, unknown>;
  description: string;
  formatVersion: string;
  provider: string | null;
  connectError: string | null;
  password: string;
  confirmPassword: string;
  readonly: boolean;
  username: string;
  hostname: string;
  algorithms: Algorithms | null;
  defaultHash: string;
  defaultEncryption: string;
  defaultEcc: string;
  defaultSplitter: string;
  hash: string;
  encryption: string;
  ecc: string;
  eccOverheadPercent: string;
  splitter: string;
  indexVersion: string;
}

export type RepositoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROVIDER'; payload: string | null }
  | { type: 'SET_PROVIDER_SETTINGS'; payload: Record<string, unknown> }
  | { type: 'SET_STORAGE_VERIFIED'; payload: boolean }
  | { type: 'SET_CONFIRM_CREATE'; payload: boolean }
  | { type: 'SET_CONNECT_ERROR'; payload: string | null }
  | { type: 'SET_ADVANCED'; payload: boolean }
  | { type: 'SET_ALGORITHMS'; payload: Algorithms }
  | { type: 'SET_USER_INFO'; payload: { username: string; hostname: string } }
  | { type: 'UPDATE_FIELD'; payload: { field: string; value: unknown } }
  | { type: 'RESET_PROVIDER' }
  | { type: 'RESET_STORAGE' };
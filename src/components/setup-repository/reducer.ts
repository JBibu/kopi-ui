import { RepositoryState, RepositoryAction } from './types';

export const initialState: RepositoryState = {
  confirmCreate: false,
  isLoading: false,
  showAdvanced: false,
  storageVerified: false,
  providerSettings: {},
  description: "My Repository",
  formatVersion: "2",
  provider: null,
  connectError: null,
  password: "",
  confirmPassword: "",
  readonly: false,
  username: "",
  hostname: "",
  algorithms: null,
  defaultHash: "",
  defaultEncryption: "",
  defaultEcc: "",
  defaultSplitter: "",
  hash: "",
  encryption: "",
  ecc: "",
  eccOverheadPercent: "0",
  splitter: "",
  indexVersion: "",
};

export function repositoryReducer(state: RepositoryState, action: RepositoryAction): RepositoryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_PROVIDER':
      return {
        ...state,
        provider: action.payload,
        providerSettings: {},
        connectError: null
      };

    case 'SET_PROVIDER_SETTINGS':
      return { ...state, providerSettings: action.payload };

    case 'SET_STORAGE_VERIFIED':
      return { ...state, storageVerified: action.payload };

    case 'SET_CONFIRM_CREATE':
      return { ...state, confirmCreate: action.payload };

    case 'SET_CONNECT_ERROR':
      return { ...state, connectError: action.payload };

    case 'SET_ADVANCED':
      return { ...state, showAdvanced: action.payload };

    case 'SET_ALGORITHMS':
      return {
        ...state,
        algorithms: action.payload,
        defaultHash: action.payload.defaultHash || "",
        defaultEncryption: action.payload.defaultEncryption || "",
        defaultEcc: action.payload.defaultEcc || "",
        defaultSplitter: action.payload.defaultSplitter || "",
        hash: action.payload.defaultHash || "",
        encryption: action.payload.defaultEncryption || "",
        ecc: action.payload.defaultEcc || "",
        splitter: action.payload.defaultSplitter || "",
      };

    case 'SET_USER_INFO':
      return {
        ...state,
        username: action.payload.username,
        hostname: action.payload.hostname,
      };

    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.payload.field]: action.payload.value,
      };

    case 'RESET_PROVIDER':
      return {
        ...state,
        provider: null,
        providerSettings: {},
        connectError: null,
      };

    case 'RESET_STORAGE':
      return {
        ...state,
        providerSettings: {},
        storageVerified: false,
      };

    default:
      return state;
  }
}
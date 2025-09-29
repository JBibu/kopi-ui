import axios from 'axios';
import { Algorithms } from '../types/api';

export interface StorageConfig {
  type: string;
  config: Record<string, unknown>;
}

export interface RepositoryOptions {
  blockFormat: {
    version: number;
    hash: string;
    encryption: string;
    ecc: string;
    eccOverheadPercent: number;
  };
  objectFormat: {
    splitter: string;
  };
}

export interface ClientOptions {
  description: string;
  username: string;
  readonly: boolean;
  hostname: string;
}

export interface CreateRepositoryRequest {
  storage: StorageConfig;
  password: string;
  options: RepositoryOptions;
  clientOptions: ClientOptions;
}

export interface ConnectRepositoryRequest {
  storage?: StorageConfig;
  password?: string;
  token?: string;
  apiServer?: Record<string, unknown>;
  clientOptions: ClientOptions;
}

export interface VerifyStorageRequest {
  storage: StorageConfig;
}

export interface UserInfo {
  username: string;
  hostname: string;
}

class RepositoryService {
  async getAlgorithms(): Promise<Algorithms> {
    const response = await axios.get<Algorithms>('/api/v1/repo/algorithms');
    return response.data;
  }

  async getCurrentUser(): Promise<UserInfo> {
    const response = await axios.get<UserInfo>('/api/v1/current-user');
    return response.data;
  }

  async verifyStorage(request: VerifyStorageRequest): Promise<void> {
    await axios.post('/api/v1/repo/exists', request);
  }

  async createRepository(request: CreateRepositoryRequest): Promise<void> {
    await axios.post('/api/v1/repo/create', request);
  }

  async connectRepository(request: ConnectRepositoryRequest): Promise<void> {
    await axios.post('/api/v1/repo/connect', request);
  }

  async getRepositoryStatus(): Promise<Record<string, unknown>> {
    const response = await axios.get('/api/v1/repo/status');
    return response.data;
  }
}

export const repositoryService = new RepositoryService();
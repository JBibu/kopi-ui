import axios from 'axios';
import { Policy, Algorithms } from '../types';

export interface PolicyQueryParams {
  host?: string;
  userName?: string;
  path?: string;
}

export interface ResolvePolicyRequest {
  updates: Policy;
  numUpcomingSnapshotTimes: number;
}

class PolicyService {
  private buildQueryString(params: PolicyQueryParams): string {
    const queryParams = new URLSearchParams();
    if (params.host) queryParams.append('host', params.host);
    if (params.userName) queryParams.append('userName', params.userName);
    if (params.path) queryParams.append('path', params.path);
    return queryParams.toString();
  }

  async getPolicy(params: PolicyQueryParams): Promise<Policy> {
    const queryString = this.buildQueryString(params);
    const response = await axios.get(`/api/v1/policy?${queryString}`);
    return response.data;
  }

  async savePolicy(params: PolicyQueryParams, policy: Policy): Promise<void> {
    const queryString = this.buildQueryString(params);
    await axios.put(`/api/v1/policy?${queryString}`, policy);
  }

  async deletePolicy(params: PolicyQueryParams): Promise<void> {
    const queryString = this.buildQueryString(params);
    await axios.delete(`/api/v1/policy?${queryString}`);
  }

  async resolvePolicy(params: PolicyQueryParams, request: ResolvePolicyRequest): Promise<Record<string, unknown>> {
    const queryString = this.buildQueryString(params);
    const response = await axios.post(`/api/v1/policy/resolve?${queryString}`, request);
    return response.data;
  }

  async getAlgorithms(): Promise<Algorithms> {
    const response = await axios.get('/api/v1/repo/algorithms');
    return response.data;
  }

  validatePolicy(policy: Policy): Policy {
    const validatedPolicy = JSON.parse(JSON.stringify(policy));

    const removeEmpty = (arr?: string[]): string[] | undefined => {
      if (!arr) return arr;
      return arr.filter(s => s !== '');
    };

    const validateTimesOfDay = (arr: unknown[]): unknown[] => {
      for (const tod of arr) {
        if (typeof tod !== 'object') {
          throw new Error(`Invalid time of day: '${tod}'`);
        }
      }
      return arr;
    };

    if (validatedPolicy.files) {
      if (validatedPolicy.files.ignore) {
        validatedPolicy.files.ignore = removeEmpty(validatedPolicy.files.ignore);
      }
      if (validatedPolicy.files.ignoreDotFiles) {
        validatedPolicy.files.ignoreDotFiles = removeEmpty(validatedPolicy.files.ignoreDotFiles);
      }
    }

    if (validatedPolicy.compression) {
      if (validatedPolicy.compression.onlyCompress) {
        validatedPolicy.compression.onlyCompress = removeEmpty(validatedPolicy.compression.onlyCompress);
      }
      if (validatedPolicy.compression.neverCompress) {
        validatedPolicy.compression.neverCompress = removeEmpty(validatedPolicy.compression.neverCompress);
      }
    }

    if (validatedPolicy.scheduling?.timesOfDay) {
      validatedPolicy.scheduling.timesOfDay = validateTimesOfDay(
        removeEmpty(validatedPolicy.scheduling.timesOfDay) || []
      );
    }

    if (validatedPolicy.actions) {
      if (validatedPolicy.actions.beforeSnapshotRoot) {
        validatedPolicy.actions.beforeSnapshotRoot = removeEmpty(
          validatedPolicy.actions.beforeSnapshotRoot as string[]
        ) as string[] | undefined;
      }
      if (validatedPolicy.actions.afterSnapshotRoot) {
        validatedPolicy.actions.afterSnapshotRoot = removeEmpty(
          validatedPolicy.actions.afterSnapshotRoot as string[]
        ) as string[] | undefined;
      }
    }

    return validatedPolicy;
  }
}

export const policyService = new PolicyService();
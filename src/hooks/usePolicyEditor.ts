import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLoading } from '../contexts/LoadingContext';
import { useError } from '../contexts/ErrorContext';
import { policyService, type PolicyQueryParams } from '../services/policy.service';
import { Policy, Algorithms } from '../types';

interface PolicyEditorState {
  items: unknown[];
  error: Error | null;
  policy: Policy;
  isNew: boolean;
  algorithms: Algorithms | null;
  resolved: Record<string, unknown> | null;
  resolvedError: Error | null;
}

interface PolicyEditorProps {
  host?: string;
  userName?: string;
  path?: string;
}

const initialState: PolicyEditorState = {
  items: [],
  error: null,
  policy: {},
  isNew: false,
  algorithms: null,
  resolved: null,
  resolvedError: null,
};

export const usePolicyEditor = (props: PolicyEditorProps) => {
  const [state, setState] = useState<PolicyEditorState>(initialState);
  const { showError } = useError();
  const { withLoading, isLoading } = useLoading();

  const form = useForm({
    defaultValues: {
      policy: {},
    },
  });

  const params: PolicyQueryParams = useMemo(
    () => ({
      host: props.host,
      userName: props.userName,
      path: props.path,
    }),
    [props.host, props.userName, props.path]
  );

  const isGlobal = useCallback((): boolean => {
    return !props.host && !props.userName && !props.path;
  }, [props.host, props.userName, props.path]);

  const fetchPolicy = useCallback(async (): Promise<void> => {
    try {
      const policy = await withLoading('fetchPolicy', () => policyService.getPolicy(params));

      setState(prev => ({
        ...prev,
        error: null,
        policy,
        isNew: false,
      }));

      form.reset({ policy });
    } catch (error: any) {
      if (error.response && error.response.data.code !== 'NOT_FOUND') {
        setState(prev => ({
          ...prev,
          error: error,
        }));
        showError(error, 'Failed to fetch policy');
      } else {
        setState(prev => ({
          ...prev,
          policy: {},
          isNew: true,
        }));
        form.reset({ policy: {} });
      }
    }
  }, [params, withLoading, form, showError]);

  const resolvePolicy = useCallback(async (): Promise<void> => {
    try {
      const validatedPolicy = policyService.validatePolicy(state.policy);

      const resolved = await withLoading('resolvePolicy', () =>
        policyService.resolvePolicy(params, {
          updates: validatedPolicy,
          numUpcomingSnapshotTimes: 5,
        })
      );

      setState(prev => ({
        ...prev,
        resolved,
        resolvedError: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        resolvedError: error as Error
      }));
    }
  }, [params, state.policy, withLoading]);

  const handlePolicyChange = useCallback((fieldPath: string, value: unknown): void => {
    setState(prev => {
      const newPolicy = { ...prev.policy };
      const keys = fieldPath.split('.');
      let current: Record<string, unknown> = newPolicy;

      // Navigate to the parent object
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      // Set the value
      current[keys[keys.length - 1]] = value;

      return {
        ...prev,
        policy: newPolicy,
      };
    });
  }, []);

  const saveChanges = useCallback(async (): Promise<void> => {
    try {
      const validatedPolicy = policyService.validatePolicy(state.policy);

      await withLoading('savePolicy', () => policyService.savePolicy(params, validatedPolicy));

      setState(prev => ({
        ...prev,
        isNew: false,
      }));
    } catch (error) {
      showError(error as Error, 'Failed to save policy');
    }
  }, [state.policy, params, withLoading, showError]);

  const deletePolicy = useCallback(async (): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      await withLoading('deletePolicy', () => policyService.deletePolicy(params));

      setState(prev => ({
        ...prev,
        policy: {},
        isNew: true,
      }));

      form.reset({ policy: {} });
    } catch (error) {
      showError(error as Error, 'Failed to delete policy');
    }
  }, [params, withLoading, showError, form]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        const algorithms = await policyService.getAlgorithms();
        setState(prev => ({ ...prev, algorithms }));
        await fetchPolicy();
      } catch (error) {
        console.error('Failed to initialize policy editor:', error);
      }
    };

    initializeData();
  }, [fetchPolicy]);

  // Auto-resolve policy when it changes
  const lastResolvedPolicy = useMemo(() => JSON.stringify(state.policy), [state.policy]);

  useEffect(() => {
    if (state.policy && Object.keys(state.policy).length > 0) {
      resolvePolicy();
    }
  }, [lastResolvedPolicy, resolvePolicy]);

  const policyDefinitionPoint = useCallback((p: Record<string, unknown>) => {
    if (!p) return '';

    if (p.userName === props.userName && p.host === props.host && p.path === props.path) {
      return '(Defined by this policy)';
    }

    // This would need to be implemented based on your PolicyEditorLink component
    return `Defined by policy at ${p.host || 'global'}${p.path ? ':' + p.path : ''}`;
  }, [props.userName, props.host, props.path]);

  return {
    state,
    form,
    isGlobal,
    isLoading,
    fetchPolicy,
    resolvePolicy,
    handlePolicyChange,
    saveChanges,
    deletePolicy,
    policyDefinitionPoint,
  };
};
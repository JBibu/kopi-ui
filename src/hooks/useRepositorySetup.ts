import { useReducer, useEffect, useContext, useCallback, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useLoading } from '../contexts/LoadingContext';
import { repositoryService, type CreateRepositoryRequest, type ConnectRepositoryRequest } from '../services/repository.service';
import { repositoryReducer, initialState } from '../components/setup-repository/reducer';

export const useRepositorySetup = () => {
  const [state, dispatch] = useReducer(repositoryReducer, initialState);
  const optionsEditor = useRef<{ validate: () => boolean; state: Record<string, unknown> } | null>(null);
  const context = useContext(AppContext);
  const { withLoading } = useLoading();

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [algorithms, userInfo] = await Promise.all([
          repositoryService.getAlgorithms(),
          repositoryService.getCurrentUser(),
        ]);

        dispatch({ type: 'SET_ALGORITHMS', payload: algorithms });
        dispatch({ type: 'SET_USER_INFO', payload: userInfo });
      } catch (error) {
        console.error('Failed to initialize repository setup data:', error);
      }
    };

    initializeData();
  }, []);

  const handleProviderSelect = useCallback((provider: string) => {
    dispatch({ type: 'SET_PROVIDER', payload: provider });
  }, []);

  const handleProviderBack = useCallback(() => {
    dispatch({ type: 'RESET_PROVIDER' });
  }, []);

  const toggleAdvanced = useCallback(() => {
    dispatch({ type: 'SET_ADVANCED', payload: !state.showAdvanced });
  }, [state.showAdvanced]);

  const handleFieldChange = useCallback((field: string, value: unknown) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  }, []);

  const verifyStorage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const ed = optionsEditor.current;
      if (ed && !ed.validate()) {
        return;
      }

      if (state.provider === '_token' || state.provider === '_server') {
        dispatch({ type: 'SET_STORAGE_VERIFIED', payload: true });
        dispatch({ type: 'SET_CONFIRM_CREATE', payload: false });
        if (ed) {
          dispatch({ type: 'SET_PROVIDER_SETTINGS', payload: ed.state });
        }
        return;
      }

      const request = {
        storage: {
          type: state.provider,
          config: ed?.state || {},
        },
      };

      try {
        await withLoading('verifyStorage', () => repositoryService.verifyStorage(request));

        dispatch({ type: 'SET_STORAGE_VERIFIED', payload: true });
        dispatch({ type: 'SET_CONFIRM_CREATE', payload: false });
        if (ed) {
          dispatch({ type: 'SET_PROVIDER_SETTINGS', payload: ed.state });
        }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { code?: string; error?: string } }; message?: string };
        if (axiosError.response?.data) {
          if (axiosError.response.data.code === 'NOT_INITIALIZED') {
            dispatch({ type: 'SET_CONFIRM_CREATE', payload: true });
            dispatch({ type: 'SET_STORAGE_VERIFIED', payload: true });
            if (ed) {
              dispatch({ type: 'SET_PROVIDER_SETTINGS', payload: ed.state });
            }
            dispatch({ type: 'SET_CONNECT_ERROR', payload: null });
          } else {
            dispatch({
              type: 'SET_CONNECT_ERROR',
              payload: (axiosError.response.data.code || 'Error') + ': ' + (axiosError.response.data.error || 'Unknown error'),
            });
          }
        } else {
          dispatch({ type: 'SET_CONNECT_ERROR', payload: axiosError.message || 'Unknown error occurred' });
        }
      }
    },
    [state.provider, withLoading]
  );

  const createRepository = useCallback(
    async (formData: Record<string, unknown>) => {
      const request: CreateRepositoryRequest = {
        storage: {
          type: state.provider,
          config: state.providerSettings,
        },
        password: formData.password,
        options: {
          blockFormat: {
            version: parseInt(state.formatVersion),
            hash: state.hash,
            encryption: state.encryption,
            ecc: state.ecc,
            eccOverheadPercent: parseInt(state.eccOverheadPercent),
          },
          objectFormat: {
            splitter: state.splitter,
          },
        },
        clientOptions: {
          description: formData.description || state.description,
          username: formData.username || state.username,
          readonly: formData.readonly || state.readonly,
          hostname: formData.hostname || state.hostname,
        },
      };

      try {
        await withLoading('createRepository', () => repositoryService.createRepository(request));

        if (context.repositoryUpdated) {
          context.repositoryUpdated(true);
        }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { code?: string; error?: string } }; message?: string };
        if (axiosError.response?.data) {
          dispatch({
            type: 'SET_CONNECT_ERROR',
            payload: (axiosError.response.data.code || 'Error') + ': ' + (axiosError.response.data.error || 'Unknown error'),
          });
        } else {
          dispatch({ type: 'SET_CONNECT_ERROR', payload: axiosError.message || 'Unknown error occurred' });
        }
      }
    },
    [state, context, withLoading]
  );

  const connectToRepository = useCallback(
    async (formData: Record<string, unknown>) => {
      let request: ConnectRepositoryRequest;

      switch (state.provider) {
        case '_token':
          request = {
            token: state.providerSettings.token,
            clientOptions: {
              description: formData.description || state.description,
              username: formData.username || state.username,
              readonly: formData.readonly || state.readonly,
              hostname: formData.hostname || state.hostname,
            },
          };
          break;

        case '_server':
          request = {
            apiServer: state.providerSettings,
            password: formData.password,
            clientOptions: {
              description: formData.description || state.description,
              username: formData.username || state.username,
              readonly: formData.readonly || state.readonly,
              hostname: formData.hostname || state.hostname,
            },
          };
          break;

        default:
          request = {
            storage: {
              type: state.provider,
              config: state.providerSettings,
            },
            password: formData.password,
            clientOptions: {
              description: formData.description || state.description,
              username: formData.username || state.username,
              readonly: formData.readonly || state.readonly,
              hostname: formData.hostname || state.hostname,
            },
          };
          break;
      }

      try {
        await withLoading('connectRepository', () => repositoryService.connectRepository(request));

        if (context.repositoryUpdated) {
          context.repositoryUpdated(true);
        }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { code?: string; error?: string } }; message?: string };
        if (axiosError.response?.data) {
          dispatch({ type: 'SET_CONFIRM_CREATE', payload: false });
          dispatch({
            type: 'SET_CONNECT_ERROR',
            payload: (axiosError.response.data.code || 'Error') + ': ' + (axiosError.response.data.error || 'Unknown error'),
          });
        } else {
          dispatch({ type: 'SET_CONNECT_ERROR', payload: axiosError.message || 'Unknown error occurred' });
        }
      }
    },
    [state, context, withLoading]
  );

  return {
    state,
    dispatch,
    optionsEditor,
    handleProviderSelect,
    handleProviderBack,
    toggleAdvanced,
    handleFieldChange,
    verifyStorage,
    createRepository,
    connectToRepository,
  };
};
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useError } from '../contexts/ErrorContext';
import { useLoading } from '../contexts/LoadingContext';

export interface NotificationProfile {
  profile: string;
  method: {
    type: string;
    config: Record<string, unknown>;
  };
  minSeverity: number;
}

export interface NotificationMethod {
  displayName: string;
  editor: React.ForwardRefExoticComponent<Record<string, unknown>>;
}

export interface SeverityOption {
  value: number;
  label: string;
}

export const SEVERITY_OPTIONS: SeverityOption[] = [
  { value: -100, label: "Verbose" },
  { value: -10, label: "Success" },
  { value: 0, label: "Report" },
  { value: 10, label: "Warning" },
  { value: 20, label: "Error" },
];

export function getSeverityName(severity: number): string {
  const opt = SEVERITY_OPTIONS.find((o) => o.value === severity);
  return opt ? opt.label : "Unknown";
}

interface UseNotificationEditorReturn {
  profiles: NotificationProfile[];
  editedProfile: NotificationProfile | null;
  isNewProfile: boolean;
  isLoading: boolean;
  error: Error | null;
  setEditedProfile: (profile: NotificationProfile | null, isNew: boolean) => void;
  duplicateProfile: (profile: NotificationProfile) => void;
  saveProfile: (profile: NotificationProfile) => Promise<void>;
  updateProfile: (profile: NotificationProfile) => Promise<void>;
  deleteProfile: (profileName: string) => Promise<void>;
  sendTestNotification: (profile: NotificationProfile) => Promise<void>;
  fetchProfiles: () => Promise<void>;
  cancelEdit: () => void;
  generateNewProfileName: (type: string) => string;
}

export function useNotificationEditor(): UseNotificationEditorReturn {
  const [profiles, setProfiles] = useState<NotificationProfile[]>([]);
  const [editedProfile, setEditedProfile] = useState<NotificationProfile | null>(null);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { setError: setGlobalError } = useError();
  const { setLoading } = useLoading();

  const fetchProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<NotificationProfile[]>('/api/v1/notificationProfiles');
      setProfiles(response.data || []);
    } catch (err) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'Unknown error';
      const error = new Error(`Failed to fetch notification profiles (${axiosError.response?.status || 'Unknown'}): ${errorMessage}`);
      setError(error);
      setGlobalError('Failed to fetch notification profiles', errorMessage);
      console.error('Notification profiles fetch error:', axiosError);
    } finally {
      setIsLoading(false);
    }
  }, [setGlobalError]);

  const generateNewProfileName = useCallback((type: string): string => {
    let i = 1;
    while (true) {
      const name = `${type}-${i}`;
      if (!profiles.find((p) => name === p.profile)) {
        return name;
      }
      i++;
    }
  }, [profiles]);

  const handleSetEditedProfile = useCallback((profile: NotificationProfile | null, isNew: boolean) => {
    setEditedProfile(profile);
    setIsNewProfile(isNew);
  }, []);

  const duplicateProfile = useCallback((profile: NotificationProfile) => {
    const newProfile = { ...profile };
    newProfile.profile = generateNewProfileName(profile.method.type);
    handleSetEditedProfile(newProfile, true);
  }, [generateNewProfileName, handleSetEditedProfile]);

  const saveProfile = useCallback(async (profile: NotificationProfile) => {
    try {
      setLoading(true);
      await axios.post('/api/v1/notificationProfiles', profile);
      handleSetEditedProfile(null, false);
      await fetchProfiles();
    } catch (err) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'Unknown error';
      console.error('Save notification profile error:', axiosError);
      throw new Error(`Failed to save profile (${axiosError.response?.status || 'Unknown'}): ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [fetchProfiles, handleSetEditedProfile, setLoading]);

  const updateProfile = useCallback(async (profile: NotificationProfile) => {
    try {
      setLoading(true);
      await axios.post('/api/v1/notificationProfiles', profile);
      handleSetEditedProfile(null, false);
      await fetchProfiles();
    } catch (err) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'Unknown error';
      throw new Error(`Failed to update profile (${axiosError.response?.status || 'Unknown'}): ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [fetchProfiles, handleSetEditedProfile, setLoading]);

  const deleteProfile = useCallback(async (profileName: string) => {
    if (!window.confirm(`Are you sure you want to delete the profile: ${profileName}?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/v1/notificationProfiles/${profileName}`);
      await fetchProfiles();
    } catch (err) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'Unknown error';
      throw new Error(`Failed to delete profile (${axiosError.response?.status || 'Unknown'}): ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [fetchProfiles, setLoading]);

  const sendTestNotification = useCallback(async (profile: NotificationProfile) => {
    try {
      setLoading(true);
      await axios.post('/api/v1/testNotificationProfile', profile);
      alert('Notification sent, please make sure you have received it.');
    } catch (err) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'Unknown error';
      throw new Error(`Failed to send test notification (${axiosError.response?.status || 'Unknown'}): ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const cancelEdit = useCallback(() => {
    handleSetEditedProfile(null, false);
  }, [handleSetEditedProfile]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    editedProfile,
    isNewProfile,
    isLoading,
    error,
    setEditedProfile: handleSetEditedProfile,
    duplicateProfile,
    saveProfile,
    updateProfile,
    deleteProfile,
    sendTestNotification,
    fetchProfiles,
    cancelEdit,
    generateNewProfileName,
  };
}
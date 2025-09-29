import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useNotificationEditor, NotificationProfile } from '../useNotificationEditor';
import { ErrorProvider } from '../../contexts/ErrorContext';
import { LoadingProvider } from '../../contexts/LoadingContext';
import React from 'react';

const mock = new MockAdapter(axios);

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    ErrorProvider,
    {},
    React.createElement(LoadingProvider, {}, children)
  );

describe('useNotificationEditor', () => {
  beforeEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  const mockProfiles: NotificationProfile[] = [
    {
      profile: 'email-1',
      method: { type: 'email', config: {} },
      minSeverity: 0,
    },
    {
      profile: 'webhook-1',
      method: { type: 'webhook', config: {} },
      minSeverity: 10,
    },
  ];

  it('should fetch profiles on mount', async () => {
    mock.onGet('/api/v1/notificationProfiles').reply(200, mockProfiles);

    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    await waitFor(() => {
      expect(result.current.profiles).toEqual(mockProfiles);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle fetch error gracefully', async () => {
    mock.onGet('/api/v1/notificationProfiles').reply(500);

    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should set edited profile', () => {
    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    act(() => {
      result.current.setEditedProfile(mockProfiles[0], false);
    });

    expect(result.current.editedProfile).toEqual(mockProfiles[0]);
    expect(result.current.isNewProfile).toBe(false);
  });

  it('should duplicate profile with new name', async () => {
    mock.onGet('/api/v1/notificationProfiles').reply(200, mockProfiles);

    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    await waitFor(() => {
      expect(result.current.profiles).toEqual(mockProfiles);
    });

    act(() => {
      result.current.duplicateProfile(mockProfiles[0]);
    });

    expect(result.current.editedProfile?.profile).toBe('email-2');
    expect(result.current.isNewProfile).toBe(true);
  });

  it('should save new profile successfully', async () => {
    mock.onGet('/api/v1/notificationProfiles').reply(200, mockProfiles);
    mock.onPost('/api/v1/notificationProfiles').reply(200);

    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    const newProfile: NotificationProfile = {
      profile: 'test-profile',
      method: { type: 'email', config: {} },
      minSeverity: 0,
    };

    await act(async () => {
      await result.current.saveProfile(newProfile);
    });

    expect(result.current.editedProfile).toBeNull();
    expect(result.current.isNewProfile).toBe(false);
  });

  it('should handle save error with error message', async () => {
    mock.onPost('/api/v1/notificationProfiles').reply(400, {
      error: 'Invalid profile configuration',
    });

    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    const newProfile: NotificationProfile = {
      profile: 'test-profile',
      method: { type: 'email', config: {} },
      minSeverity: 0,
    };

    await expect(result.current.saveProfile(newProfile)).rejects.toThrow(
      'Invalid profile configuration'
    );
  });

  it('should delete profile with confirmation', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    mock.onGet('/api/v1/notificationProfiles').reply(200, mockProfiles);
    mock.onDelete('/api/v1/notificationProfiles/email-1').reply(200);

    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    await act(async () => {
      await result.current.deleteProfile('email-1');
    });

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to delete the profile: email-1?'
    );
    confirmSpy.mockRestore();
  });

  it('should not delete profile without confirmation', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    mock.onDelete('/api/v1/notificationProfiles/email-1').reply(200);

    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    await act(async () => {
      await result.current.deleteProfile('email-1');
    });

    expect(mock.history.delete.length).toBe(0);
    confirmSpy.mockRestore();
  });

  it('should send test notification', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
    mock.onPost('/api/v1/testNotificationProfile').reply(200);

    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    await act(async () => {
      await result.current.sendTestNotification(mockProfiles[0]);
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Notification sent, please make sure you have received it.'
    );
    alertSpy.mockRestore();
  });

  it('should generate unique profile name', async () => {
    mock.onGet('/api/v1/notificationProfiles').reply(200, mockProfiles);

    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    await waitFor(() => {
      expect(result.current.profiles).toEqual(mockProfiles);
    });

    const newName = result.current.generateNewProfileName('email');
    expect(newName).toBe('email-2');

    const webhookName = result.current.generateNewProfileName('webhook');
    expect(webhookName).toBe('webhook-2');

    const pushoverName = result.current.generateNewProfileName('pushover');
    expect(pushoverName).toBe('pushover-1');
  });

  it('should cancel edit', () => {
    const { result } = renderHook(() => useNotificationEditor(), { wrapper });

    act(() => {
      result.current.setEditedProfile(mockProfiles[0], true);
    });

    expect(result.current.editedProfile).toEqual(mockProfiles[0]);

    act(() => {
      result.current.cancelEdit();
    });

    expect(result.current.editedProfile).toBeNull();
    expect(result.current.isNewProfile).toBe(false);
  });
});
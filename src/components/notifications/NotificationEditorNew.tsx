import React, { useState } from 'react';
import { useNotificationEditor, NotificationProfile } from '../../hooks/useNotificationEditor';
import { ProfileList } from './sections/ProfileList';
import { ProfileEditor } from './sections/ProfileEditor';
import { EmailMethodForm } from './methods/EmailMethodForm';
import { WebhookMethodForm } from './methods/WebhookMethodForm';
import { PushoverMethodForm } from './methods/PushoverMethodForm';
import { Alert, AlertDescription } from '../ui/alert';
import { Spinner } from '../ui/spinner';
import { AlertCircle } from 'lucide-react';

interface NotificationMethod {
  displayName: string;
  component: React.ComponentType<any>;
}

const notificationMethods: Record<string, NotificationMethod> = {
  email: { displayName: 'E-mail', component: EmailMethodForm },
  pushover: { displayName: 'Pushover', component: PushoverMethodForm },
  webhook: { displayName: 'Webhook', component: WebhookMethodForm },
};

export const NotificationEditorNew: React.FC = () => {
  const {
    profiles,
    editedProfile,
    isNewProfile,
    isLoading,
    error,
    setEditedProfile,
    duplicateProfile,
    saveProfile,
    updateProfile,
    deleteProfile,
    sendTestNotification,
    generateNewProfileName,
  } = useNotificationEditor();

  const handleCreateNew = (type: string) => {
    const newProfile: NotificationProfile = {
      profile: generateNewProfileName(type),
      method: {
        type,
        config: {},
      },
      minSeverity: 0,
    };
    setEditedProfile(newProfile, true);
  };

  const handleSave = async (profile: NotificationProfile) => {
    try {
      if (isNewProfile) {
        await saveProfile(profile);
      } else {
        await updateProfile(profile);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert(`Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSendTest = async (profile: NotificationProfile) => {
    try {
      await sendTestNotification(profile);
    } catch (error) {
      console.error('Failed to send test notification:', error);
      alert(`Error sending test notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Loading notification profiles...</span>
      </div>
    );
  }

  if (error && !editedProfile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load notification profiles: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (editedProfile) {
    const MethodComponent = notificationMethods[editedProfile.method.type]?.component;

    if (!MethodComponent) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unknown notification method: {editedProfile.method.type}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <ProfileEditor
        profile={editedProfile}
        isNew={isNewProfile}
        onSave={handleSave}
        onCancel={() => setEditedProfile(null, false)}
        onSendTest={handleSendTest}
      >
        <MethodComponent />
      </ProfileEditor>
    );
  }

  return (
    <ProfileList
      profiles={profiles}
      notificationMethods={notificationMethods}
      onEdit={(profile) => setEditedProfile(profile, false)}
      onDuplicate={duplicateProfile}
      onDelete={deleteProfile}
      onSendTest={sendTestNotification}
      onCreateNew={handleCreateNew}
    />
  );
};
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NotificationProfile, SEVERITY_OPTIONS } from '../../../hooks/useNotificationEditor';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

interface ProfileEditorProps {
  profile: NotificationProfile;
  isNew: boolean;
  onSave: (profile: NotificationProfile) => Promise<void>;
  onCancel: () => void;
  onSendTest: (profile: NotificationProfile) => Promise<void>;
  children: React.ReactNode;
}

interface ProfileFormData {
  profileName: string;
  minSeverity: number;
  methodConfig: Record<string, unknown>;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  isNew,
  onSave,
  onCancel,
  onSendTest,
  children,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
  } = useForm<ProfileFormData>({
    defaultValues: {
      profileName: profile.profile,
      minSeverity: profile.minSeverity,
      methodConfig: profile.method.config,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updatedProfile: NotificationProfile = {
        profile: data.profileName,
        minSeverity: data.minSeverity,
        method: {
          type: profile.method.type,
          config: data.methodConfig,
        },
      };
      await onSave(updatedProfile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleTestNotification = async () => {
    const values = getValues();
    const testProfile: NotificationProfile = {
      profile: values.profileName,
      minSeverity: values.minSeverity,
      method: {
        type: profile.method.type,
        config: values.methodConfig,
      },
    };
    await onSendTest(testProfile);
  };

  const updateMethodConfig = (config: Record<string, unknown>) => {
    setValue('methodConfig', config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNew ? 'New Notification Profile' : 'Edit Notification Profile'}</CardTitle>
        <CardDescription>
          Configure how and when you receive notifications from Kopia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profileName" className="required">
              Profile Name
            </Label>
            <Controller
              name="profileName"
              control={control}
              rules={{
                required: 'Profile name is required',
                minLength: { value: 1, message: 'Profile name cannot be empty' },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="profileName"
                  placeholder="Enter profile name"
                  readOnly={!isNew}
                  className={errors.profileName ? 'border-destructive' : ''}
                />
              )}
            />
            {errors.profileName && (
              <p className="text-sm text-destructive">{errors.profileName.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Unique name for this notification profile
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minSeverity" className="required">
              Minimum Severity
            </Label>
            <Controller
              name="minSeverity"
              control={control}
              rules={{ required: 'Minimum severity is required' }}
              render={({ field }) => (
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                >
                  <SelectTrigger id="minSeverity" className="h-9">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.minSeverity && (
              <p className="text-sm text-destructive">{errors.minSeverity.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Minimum severity required to use this notification profile
            </p>
          </div>

          <div className="space-y-4">
            <Label>Notification Method Configuration</Label>
            <div className="p-4 border border-border rounded-lg bg-muted/20">
              {React.cloneElement(children as React.ReactElement, {
                config: profile.method.config,
                onConfigChange: updateMethodConfig,
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isNew ? 'Create Profile' : 'Update Profile'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleTestNotification}
              disabled={isSubmitting}
            >
              Send Test Notification
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
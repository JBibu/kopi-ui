import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

interface EmailConfig {
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpIdentity?: string;
  from: string;
  to: string;
  cc?: string;
  format: 'txt' | 'html';
}

interface EmailMethodFormProps {
  config: Partial<EmailConfig>;
  onConfigChange: (config: EmailConfig) => void;
}

export const EmailMethodForm: React.FC<EmailMethodFormProps> = ({
  config,
  onConfigChange,
}) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useForm<EmailConfig>({
    defaultValues: {
      smtpServer: config.smtpServer || '',
      smtpPort: config.smtpPort || 587,
      smtpUsername: config.smtpUsername || '',
      smtpPassword: config.smtpPassword || '',
      smtpIdentity: config.smtpIdentity || '',
      from: config.from || '',
      to: config.to || '',
      cc: config.cc || '',
      format: config.format || 'txt',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    onConfigChange(watchedValues);
  }, [watchedValues, onConfigChange]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="smtpServer" className="required">
            SMTP Server
          </Label>
          <Controller
            name="smtpServer"
            control={control}
            rules={{ required: 'SMTP Server is required' }}
            render={({ field }) => (
              <Input
                {...field}
                id="smtpServer"
                placeholder="smtp.gmail.com"
                className={errors.smtpServer ? 'border-destructive' : ''}
              />
            )}
          />
          {errors.smtpServer && (
            <p className="text-sm text-destructive">{errors.smtpServer.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpPort" className="required">
            SMTP Port
          </Label>
          <Controller
            name="smtpPort"
            control={control}
            rules={{
              required: 'SMTP Port is required',
              min: { value: 1, message: 'Port must be between 1 and 65535' },
              max: { value: 65535, message: 'Port must be between 1 and 65535' },
            }}
            render={({ field }) => (
              <Input
                {...field}
                id="smtpPort"
                type="number"
                placeholder="587"
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                className={errors.smtpPort ? 'border-destructive' : ''}
              />
            )}
          />
          {errors.smtpPort && (
            <p className="text-sm text-destructive">{errors.smtpPort.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Common ports: 25 (SMTP), 465 (SMTPS), 587 (STARTTLS)
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="smtpUsername" className="required">
            SMTP Username
          </Label>
          <Controller
            name="smtpUsername"
            control={control}
            rules={{ required: 'SMTP Username is required' }}
            render={({ field }) => (
              <Input
                {...field}
                id="smtpUsername"
                placeholder="username@example.com"
                className={errors.smtpUsername ? 'border-destructive' : ''}
              />
            )}
          />
          {errors.smtpUsername && (
            <p className="text-sm text-destructive">{errors.smtpUsername.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpPassword" className="required">
            SMTP Password
          </Label>
          <Controller
            name="smtpPassword"
            control={control}
            rules={{ required: 'SMTP Password is required' }}
            render={({ field }) => (
              <Input
                {...field}
                id="smtpPassword"
                type="password"
                placeholder="••••••••"
                className={errors.smtpPassword ? 'border-destructive' : ''}
              />
            )}
          />
          {errors.smtpPassword && (
            <p className="text-sm text-destructive">{errors.smtpPassword.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="smtpIdentity">
          SMTP Identity (Optional)
        </Label>
        <Controller
          name="smtpIdentity"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="smtpIdentity"
              placeholder="Optional SMTP identity"
            />
          )}
        />
        <p className="text-sm text-muted-foreground">
          Leave empty if not required by your SMTP server
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="from" className="required">
            From Address
          </Label>
          <Controller
            name="from"
            control={control}
            rules={{
              required: 'From address is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                id="from"
                type="email"
                placeholder="noreply@example.com"
                className={errors.from ? 'border-destructive' : ''}
              />
            )}
          />
          {errors.from && (
            <p className="text-sm text-destructive">{errors.from.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="to" className="required">
            To Address
          </Label>
          <Controller
            name="to"
            control={control}
            rules={{
              required: 'To address is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                id="to"
                type="email"
                placeholder="admin@example.com"
                className={errors.to ? 'border-destructive' : ''}
              />
            )}
          />
          {errors.to && (
            <p className="text-sm text-destructive">{errors.to.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cc">
          CC Address (Optional)
        </Label>
        <Controller
          name="cc"
          control={control}
          rules={{
            pattern: {
              value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address',
            },
          }}
          render={({ field }) => (
            <Input
              {...field}
              id="cc"
              type="email"
              placeholder="cc@example.com"
              className={errors.cc ? 'border-destructive' : ''}
            />
          )}
        />
        {errors.cc && (
          <p className="text-sm text-destructive">{errors.cc.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">
          Email Format
        </Label>
        <Controller
          name="format"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="format" className="h-9">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">Plain Text</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-sm text-muted-foreground">
          Choose between plain text or HTML formatted emails
        </p>
      </div>
    </div>
  );
};
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

interface WebhookConfig {
  endpoint: string;
  method: "GET" | "POST" | "PUT";
  headers?: string;
  payload?: string;
  format: "json" | "form";
}

interface WebhookMethodFormProps {
  config: Partial<WebhookConfig>;
  onConfigChange: (config: WebhookConfig) => void;
}

export function WebhookMethodForm({ config, onConfigChange }: WebhookMethodFormProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useForm<WebhookConfig>({
    defaultValues: {
      endpoint: config.endpoint || "",
      method: config.method || "POST",
      headers: config.headers || "",
      payload: config.payload || "",
      format: config.format || "json",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    onConfigChange(watchedValues);
  }, [watchedValues, onConfigChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="endpoint" className="required">
          Webhook URL
        </Label>
        <Controller
          name="endpoint"
          control={control}
          rules={{
            required: "Webhook URL is required",
            pattern: {
              value: /^https?:\/\/.+/,
              message: "Please enter a valid URL starting with http:// or https://",
            },
          }}
          render={({ field }) => (
            <Input
              {...field}
              id="endpoint"
              type="url"
              placeholder="https://example.com/webhook"
              className={errors.endpoint ? "border-destructive" : ""}
            />
          )}
        />
        {errors.endpoint && <p className="text-sm text-destructive">{errors.endpoint.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="method">HTTP Method</Label>
          <Controller
            name="method"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="method" className="h-9">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Payload Format</Label>
          <Controller
            name="format"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="format" className="h-9">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="form">Form Data</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headers">Custom Headers (Optional)</Label>
        <Controller
          name="headers"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="headers"
              placeholder='{"Authorization": "Bearer token", "X-Custom-Header": "value"}'
              className="font-mono text-sm"
              rows={3}
            />
          )}
        />
        <p className="text-sm text-muted-foreground">JSON object with custom headers to include in the request</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payload">Custom Payload Template (Optional)</Label>
        <Controller
          name="payload"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="payload"
              placeholder='{"message": "{{message}}", "severity": "{{severity}}"}'
              className="font-mono text-sm"
              rows={4}
            />
          )}
        />
        <p className="text-sm text-muted-foreground">
          Custom payload template. Use {"{{variable}}"} for dynamic values. Available variables: message, severity,
          profile, timestamp
        </p>
      </div>
    </div>
  );
}

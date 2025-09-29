import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

interface PushoverConfig {
  userKey: string;
  appToken: string;
  device?: string;
  priority: number;
  sound?: string;
}

interface PushoverMethodFormProps {
  config: Partial<PushoverConfig>;
  onConfigChange: (config: PushoverConfig) => void;
}

const PRIORITY_OPTIONS = [
  { value: -2, label: "Lowest" },
  { value: -1, label: "Low" },
  { value: 0, label: "Normal" },
  { value: 1, label: "High" },
  { value: 2, label: "Emergency" },
];

const SOUND_OPTIONS = [
  "pushover",
  "bike",
  "bugle",
  "cashregister",
  "classical",
  "cosmic",
  "falling",
  "gamelan",
  "incoming",
  "intermission",
  "magic",
  "mechanical",
  "pianobar",
  "siren",
  "spacealarm",
  "tugboat",
  "alien",
  "climb",
  "persistent",
  "echo",
  "updown",
  "vibrate",
  "none",
];

export function PushoverMethodForm({ config, onConfigChange }: PushoverMethodFormProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useForm<PushoverConfig>({
    defaultValues: {
      userKey: config.userKey || "",
      appToken: config.appToken || "",
      device: config.device || "",
      priority: config.priority || 0,
      sound: config.sound || "pushover",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    onConfigChange(watchedValues);
  }, [watchedValues, onConfigChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userKey" className="required">
          User Key
        </Label>
        <Controller
          name="userKey"
          control={control}
          rules={{
            required: "User Key is required",
            minLength: { value: 30, message: "User Key should be 30 characters" },
            maxLength: { value: 30, message: "User Key should be 30 characters" },
          }}
          render={({ field }) => (
            <Input
              {...field}
              id="userKey"
              placeholder="Enter your Pushover User Key"
              className={errors.userKey ? "border-destructive" : ""}
            />
          )}
        />
        {errors.userKey && <p className="text-sm text-destructive">{errors.userKey.message}</p>}
        <p className="text-sm text-muted-foreground">Your Pushover User Key from pushover.net/apps</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appToken" className="required">
          Application Token
        </Label>
        <Controller
          name="appToken"
          control={control}
          rules={{
            required: "Application Token is required",
            minLength: { value: 30, message: "Application Token should be 30 characters" },
            maxLength: { value: 30, message: "Application Token should be 30 characters" },
          }}
          render={({ field }) => (
            <Input
              {...field}
              id="appToken"
              placeholder="Enter your Application Token"
              className={errors.appToken ? "border-destructive" : ""}
            />
          )}
        />
        {errors.appToken && <p className="text-sm text-destructive">{errors.appToken.message}</p>}
        <p className="text-sm text-muted-foreground">Register an application at pushover.net/apps to get a token</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="device">Device Name (Optional)</Label>
        <Controller
          name="device"
          control={control}
          render={({ field }) => <Input {...field} id="device" placeholder="Leave empty to send to all devices" />}
        />
        <p className="text-sm text-muted-foreground">
          Specific device to send notifications to (leave empty for all devices)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority Level</Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value, 10))}>
                <SelectTrigger id="priority" className="h-9">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-sm text-muted-foreground">Emergency priority requires user acknowledgement</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sound">Notification Sound</Label>
          <Controller
            name="sound"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="sound" className="h-9">
                  <SelectValue placeholder="Select sound" />
                </SelectTrigger>
                <SelectContent>
                  {SOUND_OPTIONS.map((sound) => (
                    <SelectItem key={sound} value={sound}>
                      {sound}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-sm text-muted-foreground">Sound to play when notification is received</p>
        </div>
      </div>
    </div>
  );
}

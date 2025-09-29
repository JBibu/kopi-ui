import React from "react";
import { X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";

import { useError } from "../contexts/ErrorContext";
import {
  NotificationType,
  NotificationPosition,
  getNotificationConfig,
  getPositionClass
} from "../utils/notification-utils";

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

const NotificationIcon = ({ type, className }: NotificationIconProps): React.JSX.Element => {
  const config = getNotificationConfig(type);
  const IconComponent = config.icon;
  return <IconComponent className={`h-4 w-4 ${className || ""}`} />;
};

interface Notification {
  id: number;
  type: NotificationType;
  title?: string;
  message: string;
  dismissible?: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: number) => void;
}

const NotificationItem = ({ notification, onDismiss }: NotificationItemProps): React.JSX.Element => {
  const config = getNotificationConfig(notification.type);

  return (
    <Alert variant={config.variant} className={`mb-3 ${config.className}`}>
      <NotificationIcon type={notification.type} />
      <div className="flex-1">
        {notification.title && <AlertTitle className="text-sm font-medium">{notification.title}</AlertTitle>}
        <AlertDescription className="text-sm">{notification.message}</AlertDescription>
      </div>
      {notification.dismissible && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-transparent"
          onClick={() => onDismiss(notification.id)}
          aria-label="Dismiss notification"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
};

interface NotificationDisplayProps {
  position?: NotificationPosition;
  maxNotifications?: number;
}

/**
 * Global notification display component
 * Shows error messages, success notifications, etc.
 */
export const NotificationDisplay = ({
  position = "top-right",
  maxNotifications = 5,
}: NotificationDisplayProps): React.JSX.Element | null => {
  const { notifications, clearError } = useError();

  if (notifications.length === 0) {
    return null;
  }

  const displayNotifications = notifications.slice(-maxNotifications) as Notification[];

  return (
    <div className={getPositionClass(position)}>
      {displayNotifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onDismiss={clearError} />
      ))}
    </div>
  );
};

interface InlineErrorDisplayProps {
  error?: string | null;
  className?: string;
}

/**
 * Inline error display component for form fields
 */
export const InlineErrorDisplay = ({ error, className = "" }: InlineErrorDisplayProps): React.JSX.Element | null => {
  if (!error) return null;

  return (
    <div className={`text-sm text-red-600 mt-1 ${className}`} role="alert">
      <NotificationIcon type="error" className="inline mr-1" />
      {error}
    </div>
  );
};

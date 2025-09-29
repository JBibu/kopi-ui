import React from 'react';
import { AlertTriangle, CheckCircle, Info, X, AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

import { useError } from '../contexts/ErrorContext';

type NotificationType = 'error' | 'success' | 'warning' | 'info';

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

const NotificationIcon = ({ type, className }: NotificationIconProps): React.JSX.Element => {
  const iconProps = { className: `h-4 w-4 ${className || ''}` };

  switch (type) {
    case 'error':
      return <AlertTriangle {...iconProps} />;
    case 'success':
      return <CheckCircle {...iconProps} />;
    case 'warning':
      return <AlertCircle {...iconProps} />;
    case 'info':
      return <Info {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};

const getAlertVariant = (type: NotificationType): 'default' | 'destructive' => {
  switch (type) {
    case 'error':
      return 'destructive';
    case 'success':
      return 'default';
    case 'warning':
      return 'default';
    case 'info':
      return 'default';
    default:
      return 'default';
  }
};

const getAlertClassName = (type: NotificationType): string => {
  switch (type) {
    case 'error':
      return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200';
    case 'success':
      return 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
    case 'info':
      return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200';
    default:
      return '';
  }
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

const NotificationItem = ({ notification, onDismiss }: NotificationItemProps): React.JSX.Element => (
  <Alert variant={getAlertVariant(notification.type)} className={`mb-3 ${getAlertClassName(notification.type)}`}>
    <NotificationIcon type={notification.type} />
    <div className="flex-1">
      {notification.title && (
        <AlertTitle className="text-sm font-medium">
          {notification.title}
        </AlertTitle>
      )}
      <AlertDescription className="text-sm">
        {notification.message}
      </AlertDescription>
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

type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';

interface NotificationDisplayProps {
  position?: NotificationPosition;
  maxNotifications?: number;
}

/**
 * Global notification display component
 * Shows error messages, success notifications, etc.
 */
export const NotificationDisplay = ({ position = 'top-right', maxNotifications = 5 }: NotificationDisplayProps): React.JSX.Element | null => {
  const { notifications, clearError } = useError();

  if (notifications.length === 0) {
    return null;
  }

  const positionClasses: Record<NotificationPosition, string> = {
    'top-right': 'fixed top-4 right-4 z-50 max-w-md',
    'top-left': 'fixed top-4 left-4 z-50 max-w-md',
    'bottom-right': 'fixed bottom-4 right-4 z-50 max-w-md',
    'bottom-left': 'fixed bottom-4 left-4 z-50 max-w-md',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md',
  };

  const displayNotifications = notifications.slice(-maxNotifications) as Notification[];

  return (
    <div className={positionClasses[position]}>
      {displayNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={clearError}
        />
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
export const InlineErrorDisplay = ({ error, className = '' }: InlineErrorDisplayProps): React.JSX.Element | null => {
  if (!error) return null;

  return (
    <div className={`text-sm text-red-600 mt-1 ${className}`} role="alert">
      <NotificationIcon type="error" className="inline mr-1" />
      {error}
    </div>
  );
};
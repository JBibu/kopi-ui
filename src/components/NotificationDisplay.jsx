import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, CheckCircle, Info, X, AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

import { useError } from '../contexts/ErrorContext';

const NotificationIcon = ({ type, className }) => {
  const iconProps = { className: `h-4 w-4 ${className}` };

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

NotificationIcon.propTypes = {
  type: PropTypes.oneOf(['error', 'success', 'warning', 'info']).isRequired,
  className: PropTypes.string,
};

const getAlertVariant = (type) => {
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

const getAlertClassName = (type) => {
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

const NotificationItem = ({ notification, onDismiss }) => (
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

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.oneOf(['error', 'success', 'warning', 'info']).isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    dismissible: PropTypes.bool,
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

/**
 * Global notification display component
 * Shows error messages, success notifications, etc.
 */
export const NotificationDisplay = ({ position = 'top-right', maxNotifications = 5 }) => {
  const { notifications, clearError } = useError();

  if (notifications.length === 0) {
    return null;
  }

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50 max-w-md',
    'top-left': 'fixed top-4 left-4 z-50 max-w-md',
    'bottom-right': 'fixed bottom-4 right-4 z-50 max-w-md',
    'bottom-left': 'fixed bottom-4 left-4 z-50 max-w-md',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md',
  };

  const displayNotifications = notifications.slice(-maxNotifications);

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

NotificationDisplay.propTypes = {
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center']),
  maxNotifications: PropTypes.number,
};

/**
 * Inline error display component for form fields
 */
export const InlineErrorDisplay = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`text-sm text-red-600 mt-1 ${className}`} role="alert">
      <NotificationIcon type="error" className="inline mr-1" />
      {error}
    </div>
  );
};

InlineErrorDisplay.propTypes = {
  error: PropTypes.string,
  className: PropTypes.string,
};
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'error' | 'success' | 'warning' | 'info';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  dismissible: boolean;
  timestamp: Date;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
      code?: string;
    };
  };
  message?: string;
}

interface ErrorContextValue {
  notifications: Notification[];
  errors: Notification[];
  showError: (error: string | Error | ApiError, prefix?: string) => number;
  showSuccess: (message: string, title?: string) => number;
  showWarning: (message: string, title?: string) => number;
  showInfo: (message: string, title?: string) => number;
  clearError: (id: number) => void;
  clearAll: () => void;
  hasErrors: boolean;
  hasNotifications: boolean;
}

interface ErrorProviderProps {
  children: ReactNode;
}

const ErrorContext = createContext<ErrorContextValue>({
  notifications: [],
  errors: [],
  showError: () => 0,
  showSuccess: () => 0,
  showWarning: () => 0,
  showInfo: () => 0,
  clearError: () => {},
  clearAll: () => {},
  hasErrors: false,
  hasNotifications: false,
});

/**
 * Unified error handling context to replace scattered error alert patterns
 */
export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>): number => {
    const id = Date.now() + Math.random();
    const newNotification: Notification = { ...notification, id, timestamp: new Date() };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove success messages after 5 seconds
    if (notification.type === 'success') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }

    return id;
  }, []);

  const showError = useCallback((error: string | Error | ApiError, prefix = 'Error'): number => {
    let message = '';

    // Handle different error formats
    if (typeof error === 'string') {
      message = error;
    } else if ((error as ApiError)?.response?.data?.error) {
      message = (error as ApiError).response!.data!.error!;
    } else if ((error as Error)?.message) {
      message = (error as Error).message;
    } else {
      message = 'An unexpected error occurred';
    }

    // Handle repository connection errors
    if ((error as ApiError)?.response?.data?.code === 'NOT_CONNECTED') {
      window.location.replace('/repo');
      return 0;
    }

    const fullMessage = prefix ? `${prefix}: ${message}` : message;

    return addNotification({
      type: 'error',
      title: prefix,
      message: fullMessage,
      dismissible: true,
    });
  }, [addNotification]);

  const showSuccess = useCallback((message: string, title = 'Success'): number => {
    return addNotification({
      type: 'success',
      title,
      message,
      dismissible: true,
    });
  }, [addNotification]);

  const showWarning = useCallback((message: string, title = 'Warning'): number => {
    return addNotification({
      type: 'warning',
      title,
      message,
      dismissible: true,
    });
  }, [addNotification]);

  const showInfo = useCallback((message: string, title = 'Info'): number => {
    return addNotification({
      type: 'info',
      title,
      message,
      dismissible: true,
    });
  }, [addNotification]);

  const clearError = useCallback((id: number): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback((): void => {
    setNotifications([]);
  }, []);

  const value: ErrorContextValue = {
    notifications,
    errors: notifications.filter(n => n.type === 'error'),
    showError,
    showSuccess,
    showWarning,
    showInfo,
    clearError,
    clearAll,
    hasErrors: notifications.some(n => n.type === 'error'),
    hasNotifications: notifications.length > 0,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

/**
 * Hook to access error handling functionality
 */
export const useError = (): ErrorContextValue => {
  const context = useContext(ErrorContext);

  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }

  return context;
};

/**
 * Hook specifically for error handling (backward compatibility)
 */
export const useErrorHandler = () => {
  const { showError, showSuccess, clearError, clearAll } = useError();

  return {
    errorAlert: showError, // Backward compatibility with existing errorAlert calls
    successAlert: showSuccess,
    clearError,
    clearAll,
  };
};
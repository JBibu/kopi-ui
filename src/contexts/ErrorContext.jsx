import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const ErrorContext = createContext({
  errors: [],
  showError: () => {},
  showSuccess: () => {},
  clearError: () => {},
  clearAll: () => {},
});

/**
 * Unified error handling context to replace scattered error alert patterns
 */
export const ErrorProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { ...notification, id, timestamp: new Date() };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove success messages after 5 seconds
    if (notification.type === 'success') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }

    return id;
  }, []);

  const showError = useCallback((error, prefix = 'Error') => {
    let message = '';

    // Handle different error formats
    if (typeof error === 'string') {
      message = error;
    } else if (error?.response?.data?.error) {
      message = error.response.data.error;
    } else if (error?.message) {
      message = error.message;
    } else {
      message = 'An unexpected error occurred';
    }

    // Handle repository connection errors
    if (error?.response?.data?.code === 'NOT_CONNECTED') {
      window.location.replace('/repo');
      return;
    }

    const fullMessage = prefix ? `${prefix}: ${message}` : message;

    return addNotification({
      type: 'error',
      title: prefix,
      message: fullMessage,
      dismissible: true,
    });
  }, [addNotification]);

  const showSuccess = useCallback((message, title = 'Success') => {
    return addNotification({
      type: 'success',
      title,
      message,
      dismissible: true,
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning') => {
    return addNotification({
      type: 'warning',
      title,
      message,
      dismissible: true,
    });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Info') => {
    return addNotification({
      type: 'info',
      title,
      message,
      dismissible: true,
    });
  }, [addNotification]);

  const clearError = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
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

ErrorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access error handling functionality
 */
export const useError = () => {
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
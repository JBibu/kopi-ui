import React, { createContext, useContext, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    description: '',
    type: 'error'
  });

  const showAlert = (title, description, type = 'error') => {
    setAlert({
      isOpen: true,
      title,
      description,
      type
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertDialog open={alert.isOpen} onOpenChange={hideAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alert.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap">
              {alert.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={hideAlert}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
};
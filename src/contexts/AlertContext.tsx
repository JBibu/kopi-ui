import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertState {
  isOpen: boolean;
  title: string;
  description: string;
  type: AlertType;
}

interface AlertContextValue {
  showAlert: (title: string, description: string, type?: AlertType) => void;
  hideAlert: () => void;
}

interface AlertProviderProps {
  children: ReactNode;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const useAlert = (): AlertContextValue => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    title: '',
    description: '',
    type: 'error'
  });

  const showAlert = (title: string, description: string, type: AlertType = 'error'): void => {
    setAlert({
      isOpen: true,
      title,
      description,
      type
    });
  };

  const hideAlert = (): void => {
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
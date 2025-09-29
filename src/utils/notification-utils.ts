import { AlertTriangle, CheckCircle, Info, AlertCircle, LucideIcon } from "lucide-react";

export type NotificationType = "error" | "success" | "warning" | "info";
export type NotificationPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center";

export interface NotificationConfig {
  icon: LucideIcon;
  variant: "default" | "destructive";
  className: string;
}

// Configuration objects for notification types
export const NOTIFICATION_CONFIGS: Record<NotificationType, NotificationConfig> = {
  error: {
    icon: AlertTriangle,
    variant: "destructive",
    className: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  },
  success: {
    icon: CheckCircle,
    variant: "default",
    className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
  },
  warning: {
    icon: AlertCircle,
    variant: "default",
    className: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  },
  info: {
    icon: Info,
    variant: "default",
    className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  },
};

// Position classes for notification display
export const POSITION_CLASSES: Record<NotificationPosition, string> = {
  "top-right": "fixed top-4 right-4 z-50 max-w-md",
  "top-left": "fixed top-4 left-4 z-50 max-w-md",
  "bottom-right": "fixed bottom-4 right-4 z-50 max-w-md",
  "bottom-left": "fixed bottom-4 left-4 z-50 max-w-md",
  "top-center": "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md",
};

// Utility functions
export const getNotificationConfig = (type: NotificationType): NotificationConfig => {
  return NOTIFICATION_CONFIGS[type] || NOTIFICATION_CONFIGS.info;
};

export const getPositionClass = (position: NotificationPosition): string => {
  return POSITION_CLASSES[position] || POSITION_CLASSES["top-right"];
};
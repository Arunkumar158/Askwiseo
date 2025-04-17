export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  icon?: string;
}

export interface NotificationButtonProps {
  notifications: Notification[];
}

export interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
} 
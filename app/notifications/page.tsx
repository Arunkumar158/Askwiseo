'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationType } from '@/lib/types/notification';

// Example notifications data - replace with your actual data fetching logic
const initialNotifications = [
  {
    id: "1",
    type: "info" as NotificationType,
    title: "New AI Model Available",
    description: "We've added support for GPT-4 in your workspace",
    timestamp: new Date(),
    read: false,
  },
  {
    id: "2",
    type: "success" as NotificationType,
    title: "Training Complete",
    description: "Your custom model has finished training",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
  },
  {
    id: "3",
    type: "warning" as NotificationType,
    title: "Storage Space Low",
    description: "You have less than 10% storage space remaining",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
  },
];

const typeIcons: Record<NotificationType, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const typeColors: Record<NotificationType, string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        {notifications.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            You're all caught up! 👏
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type];
              const typeColor = typeColors[notification.type];
              
              return (
                <div
                  key={notification.id}
                  className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent ${
                    !notification.read ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <Icon className={`mt-1 h-5 w-5 shrink-0 ${typeColor}`} />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 
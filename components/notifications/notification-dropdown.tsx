'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationButtonProps, Notification } from '@/lib/types/notification';
import { NotificationItem } from './notification-item';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown({
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationButtonProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Mark all as read
          </Button>
        )}
      </div>
      <ScrollArea className="h-[300px]">
        {notifications.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            You're all caught up! 👏
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onNotificationClick}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 
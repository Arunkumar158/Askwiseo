'use client';

import { formatDistanceToNow } from 'date-fns';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle 
} from 'lucide-react';
import { NotificationItemProps, NotificationType } from '@/lib/types/notification';
import { cn } from '@/lib/utils';

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

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = typeIcons[notification.type];
  const typeColor = typeColors[notification.type];

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-accent',
        !notification.read && 'bg-accent/50'
      )}
      onClick={() => onClick(notification)}
    >
      <Icon className={cn('mt-1 h-4 w-4 shrink-0', typeColor)} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.description}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
} 
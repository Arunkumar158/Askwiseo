'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { NotificationButtonProps } from '@/lib/types/notification';

export function NotificationButton({
  notifications,
}: NotificationButtonProps) {
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative h-10 w-10 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      aria-label="Notifications"
      onClick={() => router.push('/notifications')}
    >
      <Bell className="h-4 w-4" />
      <span className="sr-only">Notifications</span>
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] text-white">
          {unreadCount}
        </span>
      )}
    </Button>
  );
} 
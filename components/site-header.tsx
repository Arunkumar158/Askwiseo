"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { NotificationButton } from "@/components/notifications/notification-button"
import { NotificationType } from "@/lib/types/notification"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

// Example notifications data - replace with your actual data
const notifications = [
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

import { usePlan } from "@/hooks/usePlan"

export function SiteHeader() {
  const router = useRouter()
  const { user, logOut, loading } = useAuth()
  const { plan } = usePlan()
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarToggle />
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NotificationButton notifications={notifications} />
          <div className="flex items-center gap-2">
            {user && (
              <Link href="/pricing">
                <Badge variant="outline" className="bg-violet-50 text-violet-700 hover:bg-violet-50 cursor-pointer capitalize">
                  {plan?.plan || "Free"} Plan
                </Badge>
              </Link>
            )}
            
            {!loading && !user && (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

          </div>
        </div>
      </div>
    </header>
  )
}

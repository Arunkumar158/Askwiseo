"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { NotificationButton } from "@/components/notifications/notification-button"
import { NotificationType } from "@/lib/types/notification"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

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

export function SiteHeader() {
  const router = useRouter()
  const { handleLogout } = useAuth()
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarToggle />
          <div className="hidden md:flex md:flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="w-full rounded-full bg-muted pl-8 md:w-[300px] lg:w-[400px]"
              />
            </div>
          </div>
        </div>
        <div className="flex md:hidden">
          <Button variant="outline" size="icon" className="mr-2">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NotificationButton notifications={notifications} />
          <div className="flex items-center gap-2">
            <Link href="/pricing">
              <Badge variant="outline" className="bg-violet-50 text-violet-700 hover:bg-violet-50 cursor-pointer">
                Pro Plan
              </Badge>
            </Link>
            <Link href="/signin">
              <Button variant="ghost" className="text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Get Started
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full"
                  onClick={(e) => {
                    // Prevent the dropdown from opening when clicking the avatar
                    e.stopPropagation();
                  }}
                >
                  <Avatar 
                    className="h-8 w-8 cursor-pointer" 
                    onClick={() => router.push('/profile')}
                  >
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">john.doe@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

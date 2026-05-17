"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarToggle } from "@/components/sidebar-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <SidebarToggle />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

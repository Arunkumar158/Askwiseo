"use client"

import * as React from "react"
import { PanelLeft, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar()
  const isMobile = useIsMobile()

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={cn(
        "h-9 w-9 rounded-full transition-all duration-200",
        "text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95"
      )} 
      onClick={toggleSidebar}
      data-sidebar="trigger"
    >
      {isMobile ? (
        <Menu className="h-5 w-5" />
      ) : (
        <PanelLeft className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
} 
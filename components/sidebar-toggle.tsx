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
        "h-9 w-9 md:h-7 md:w-7 transition-all duration-200",
        "hover:bg-accent active:scale-95"
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
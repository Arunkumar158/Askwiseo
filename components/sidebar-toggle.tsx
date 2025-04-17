"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-7 w-7" 
      onClick={toggleSidebar}
      data-sidebar="trigger"
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
} 
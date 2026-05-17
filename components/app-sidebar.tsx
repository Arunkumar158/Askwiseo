"use client"

import { Home, Upload, Search, BarChart2, Settings, ChevronDown, User2 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Menu items
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Uploads",
    url: "/uploads",
    icon: Upload,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: BarChart2,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-white/5 bg-[#121212]/80 backdrop-blur-xl">
      <SidebarHeader className="px-6 pt-6 pb-2">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Askwiseo Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Askwiseo
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-4">
        <SidebarMenu className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.url} 
                tooltip={item.title}
                className={`flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-200 group ${
                  pathname === item.url 
                    ? "bg-white/[0.05] text-white shadow-premium-glow border border-white/10" 
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Link href={item.url}>
                  <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${pathname === item.url ? "text-violet-400" : ""}`} />
                  <span className="font-medium font-sans">{item.title}</span>
                  {pathname === item.url && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_#8b5cf6]" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-3 mt-auto space-y-1">
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={pathname === "/settings"} 
              tooltip="Settings"
              className={`flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-200 group ${
                pathname === "/settings" 
                  ? "bg-white/[0.05] text-white shadow-premium-glow border border-white/10" 
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Link href="/settings">
                <Settings className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${pathname === "/settings" ? "text-violet-400" : ""}`} />
                <span className="font-medium font-sans">Settings</span>
                {pathname === "/settings" && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_#8b5cf6]" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={pathname === "/profile"} 
              tooltip="Profile"
              className={`flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-200 group ${
                pathname === "/profile" 
                  ? "bg-white/[0.05] text-white shadow-premium-glow border border-white/10" 
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Link href="/profile">
                <User2 className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${pathname === "/profile" ? "text-violet-400" : ""}`} />
                <span className="font-medium font-sans">Profile</span>
                {pathname === "/profile" && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_#8b5cf6]" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

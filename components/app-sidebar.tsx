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

  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-white/5 bg-[#121212]/80 backdrop-blur-xl">
      <SidebarHeader className="flex items-center justify-between px-6 py-8">
        <Link href="/" className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-premium-glow group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2Z" />
              <path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8Z" />
              <path d="M19.5 14a2.5 2.5 0 0 1 2.5 2.5v3a2.5 2.5 0 0 1-5 0v-3A2.5 2.5 0 0 1 19.5 14Z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">Askwiseo</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3">
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
      <SidebarFooter className="p-4 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-start gap-3 rounded-xl h-14 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all duration-200"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-800 flex items-center justify-center border border-white/10">
            <User2 className="h-4 w-4 text-zinc-300" />
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <span className="font-medium text-sm text-white font-sans">Profile</span>
            <span className="text-[10px] text-zinc-500 font-mono truncate w-full">Free Plan</span>
          </div>
          <ChevronDown className="ml-auto h-4 w-4 text-zinc-500" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

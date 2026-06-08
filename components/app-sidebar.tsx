"use client"

import { Home, Upload, Search, BarChart2, Settings, User2, BookOpen, FileText } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { useDocuments } from "@/hooks/useDocuments"
import { cn } from "@/lib/utils"

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
  const { state, toggleSidebar, isMobile } = useSidebar()
  const isSearchPage = pathname === "/search"
  const isExpanded = state === "expanded" || isMobile

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#121212]/80 backdrop-blur-xl">
      <SidebarHeader className={`transition-all duration-200 ${
        !isExpanded
          ? "px-0 pt-4 pb-2 flex items-center justify-center"
          : "px-6 pt-6 pb-2 flex flex-row items-center justify-between"
      }`}>
        {isExpanded ? (
          <>
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
            <SidebarToggle />
          </>
        ) : (
          <button 
            onClick={toggleSidebar} 
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95"
            title="Expand Sidebar"
          >
            <img 
              src="/logo.png" 
              alt="Askwiseo Logo" 
              className="w-6 h-6 object-contain"
            />
          </button>
        )}
      </SidebarHeader>
      <SidebarContent className="px-3 pt-4">
        <SidebarMenu className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.url} 
                tooltip={item.title}
                className={`flex items-center transition-all duration-200 group ${
                  !isExpanded 
                    ? "w-10 h-10 p-0 rounded-xl mx-auto justify-center" 
                    : "gap-3 px-4 py-6 rounded-xl"
                } ${
                  pathname === item.url 
                    ? "bg-white/[0.05] text-white shadow-premium-glow border border-white/10" 
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Link href={item.url} className={!isExpanded ? "flex items-center justify-center w-full h-full" : "flex items-center w-full gap-3"}>
                  <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${pathname === item.url ? "text-violet-400" : ""}`} />
                  {isExpanded && (
                    <>
                      <span className="font-medium font-sans">{item.title}</span>
                      {pathname === item.url && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_#8b5cf6]" />
                      )}
                    </>
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
              className={`flex items-center transition-all duration-200 group ${
                !isExpanded 
                  ? "w-10 h-10 p-0 rounded-xl mx-auto justify-center" 
                  : "gap-3 px-4 py-6 rounded-xl"
              } ${
                pathname === "/settings" 
                  ? "bg-white/[0.05] text-white shadow-premium-glow border border-white/10" 
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Link href="/settings" className={!isExpanded ? "flex items-center justify-center w-full h-full" : "flex items-center w-full gap-3"}>
                <Settings className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${pathname === "/settings" ? "text-violet-400" : ""}`} />
                {isExpanded && (
                  <>
                    <span className="font-medium font-sans">Settings</span>
                    {pathname === "/settings" && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_#8b5cf6]" />
                    )}
                  </>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={pathname === "/profile"} 
              tooltip="Profile"
              className={`flex items-center transition-all duration-200 group ${
                !isExpanded 
                  ? "w-10 h-10 p-0 rounded-xl mx-auto justify-center" 
                  : "gap-3 px-4 py-6 rounded-xl"
              } ${
                pathname === "/profile" 
                  ? "bg-white/[0.05] text-white shadow-premium-glow border border-white/10" 
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Link href="/profile" className={!isExpanded ? "flex items-center justify-center w-full h-full" : "flex items-center w-full gap-3"}>
                <User2 className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${pathname === "/profile" ? "text-violet-400" : ""}`} />
                {isExpanded && (
                  <>
                    <span className="font-medium font-sans">Profile</span>
                    {pathname === "/profile" && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_#8b5cf6]" />
                    )}
                  </>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {isSearchPage && isExpanded && <SearchKnowledgeBase />}
      </SidebarFooter>
    </Sidebar>
  )
}

function SearchKnowledgeBase() {
  const searchParams = useSearchParams()
  const { documents } = useDocuments()
  const { setOpenMobile } = useSidebar()
  const selectedDocId = searchParams.get("doc")

  const getSearchHref = (documentId?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (documentId) {
      params.set("doc", documentId)
    } else {
      params.delete("doc")
    }

    const query = params.toString()
    return query ? `/search?${query}` : "/search"
  }

  const closeMobileSidebar = () => setOpenMobile(false)

  return (
    <div className="mt-auto pt-6 min-h-0 flex flex-col">
      <div className="px-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 font-sans">KNOWLEDGE BASE</h2>
        <div className="space-y-1">
          <Link
            href={getSearchHref()}
            onClick={closeMobileSidebar}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
              !selectedDocId
                ? "bg-white/[0.05] text-white border border-white/10"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
            )}
          >
            <BookOpen className={cn("h-4 w-4", !selectedDocId ? "text-violet-400" : "text-zinc-500")} />
            <span className="text-sm font-medium truncate">All Documents</span>
          </Link>

          <div className="pt-4 pb-2">
            <div className="h-px bg-white/5 w-full" />
          </div>

          <ScrollArea className="max-h-64">
            <div className="space-y-1 pr-3">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={getSearchHref(doc.id)}
                  onClick={closeMobileSidebar}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                    selectedDocId === doc.id
                      ? "bg-white/[0.05] text-white border border-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                  )}
                >
                  <FileText className={cn("h-4 w-4 shrink-0", selectedDocId === doc.id ? "text-violet-400" : "text-zinc-500")} />
                  <span className="text-sm font-medium truncate text-left">{doc.filename}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="mt-4 px-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-dashed border-white/10 hover:bg-white/5"
          asChild
        >
          <Link href="/uploads" onClick={closeMobileSidebar}>
            <Upload className="h-4 w-4" />
            <span>Upload PDF</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { SiteFooter } from "@/components/site-footer"
import { AppSidebar } from "@/components/app-sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"

interface LayoutContentProps {
  children: React.ReactNode
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password"
  const isPublicPage = pathname === "/pricing" || pathname === "/contact" || pathname === "/"

  // Auth pages bypass the entire app shell
  if (isAuthPage) {
    return <>{children}</>
  }

  // Public pages (pricing, contact) keep the sidebar but skip the global header/footer
  // since they have their own SiteHeader/SiteFooter in their layout
  if (isPublicPage) {
    return (
      <div className="flex w-full min-h-screen flex-col md:flex-row">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          {children}
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex w-full min-h-screen flex-col md:flex-row">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 pt-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
          <SiteFooter />
        </div>
      </div>
    </ProtectedRoute>
  )
} 
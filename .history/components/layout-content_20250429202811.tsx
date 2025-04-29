"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { SiteFooter } from "@/components/site-footer"
import { AppSidebar } from "@/components/app-sidebar"

interface LayoutContentProps {
  children: React.ReactNode
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/signin" || pathname === "/signup"

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && <AppSidebar />}
      <div className="flex-1">
        {!isAuthPage && <Header />}
        <main className="flex-1 pt-16">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
} 
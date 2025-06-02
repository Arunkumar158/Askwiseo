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
    <div className="flex min-h-screen flex-col md:flex-row">
      {!isAuthPage && <AppSidebar />}
      <div className="flex-1 flex flex-col min-h-screen">
        {!isAuthPage && <Header />}
        <main className="flex-1 pt-16 px-4 md:px-6">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
} 
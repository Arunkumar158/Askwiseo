import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/Header"
import { SiteFooter } from "@/components/site-footer"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { FeedbackButton } from "@/components/feedback-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Askwiseo - AI Knowledge Companion",
  description: "Convert PDFs into searchable knowledge bases with AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <AppSidebar />
              <div className="flex-1">
                <Header />
                <main className="flex-1 pt-16">{children}</main>
                <SiteFooter />
              </div>
            </div>
            <FeedbackButton />
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

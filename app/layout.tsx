import type React from "react"
import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import ClientRoot from "@/components/client-root";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Toaster as HotToaster } from "react-hot-toast"
import { FeedbackButton } from "@/components/feedback-button"
import { LayoutContent } from "../components/layout-content"
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://askwiseo.com'),
  title: {
    default: "Askwiseo - AI Knowledge Companion",
    template: "%s | Askwiseo"
  },
  description: "Convert PDFs into searchable knowledge bases with AI. Unlock insights from your documents using advanced AI technology.",
  keywords: ["AI", "knowledge base", "PDF conversion", "document search", "artificial intelligence"],
  authors: [{ name: "Askwiseo Team" }],
  creator: "Askwiseo",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://askwiseo.com',
    title: 'Askwiseo - AI Knowledge Companion',
    description: 'Convert PDFs into searchable knowledge bases with AI',
    siteName: 'Askwiseo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Askwiseo - AI Knowledge Companion',
    description: 'Convert PDFs into searchable knowledge bases with AI',
    creator: '@askwiseo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={`${GeistSans.variable} ${GeistMono.variable} ${jetbrainsMono.variable} ${inter.variable}`}
    >
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={GeistSans.className}>
        <AuthProvider>
          <ClientRoot>
            <SidebarProvider>
              <LayoutContent>{children}</LayoutContent>
              <FeedbackButton />
            </SidebarProvider>
            <Toaster />
            <HotToaster position="top-center" />
          </ClientRoot>
        </AuthProvider>
      </body>
    </html>
  )
}

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { UploadSection } from "@/components/dashboard/upload-section"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { PlanTracker } from "@/components/dashboard/plan-tracker"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your documents and AI insights with Askwiseo's intelligent dashboard.",
}

// JSON-LD structured data for the dashboard
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Askwiseo Dashboard",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}

export default function DashboardPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DashboardShell>
        <DashboardHeader heading="Dashboard" text="Welcome back to Askwiseo — Your AI Knowledge Companion." />
        <section aria-label="Quick Actions" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UploadSection className="md:col-span-2 lg:col-span-2" />
          <PlanTracker className="md:col-span-1 lg:col-span-1" />
        </section>
        <section aria-label="Document Management" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article className="md:col-span-2 lg:col-span-2">
            <RecentDocuments className="h-full" />
          </article>
          <aside className="md:col-span-2 lg:col-span-1">
            <AIInsights className="h-full" />
          </aside>
        </section>
        <nav aria-label="Quick Links" className="mt-8 text-center space-y-2">
          <Link href="/test" className="block text-primary hover:underline">
            Test Link: Go to Test Page
          </Link>
          <Link href="/contact" className="block text-primary hover:underline">
            Test Link: Go to Contact Page
          </Link>
        </nav>
      </DashboardShell>
    </>
  )
}

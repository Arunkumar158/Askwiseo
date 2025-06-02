import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { UploadSection } from "@/components/dashboard/upload-section"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { PlanTracker } from "@/components/dashboard/plan-tracker"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Welcome back to Askwiseo — Your AI Knowledge Companion." />
      <div className="grid gap-4 md:gap-6">
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UploadSection className="md:col-span-2 lg:col-span-2" />
          <PlanTracker className="md:col-span-1 lg:col-span-1" />
        </div>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RecentDocuments className="md:col-span-2 lg:col-span-2" />
          <AIInsights className="md:col-span-2 lg:col-span-1" />
        </div>
      </div>
      <div className="mt-8 text-center space-y-2">
        <Link href="/test" className="block text-primary hover:underline">
          Test Link: Go to Test Page
        </Link>
        <Link href="/contact" className="block text-primary hover:underline">
          Test Link: Go to Contact Page
        </Link>
      </div>
    </DashboardShell>
  )
}

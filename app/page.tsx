"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { UploadSection } from "@/components/dashboard/upload-section"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { PlanTracker } from "@/components/dashboard/plan-tracker"
import { MotionWrapper } from "@/components/ui/motion-wrapper"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <MotionWrapper delay={0}>
        <DashboardHeader heading="Dashboard" text="Welcome back to Askwiseo — Your AI Knowledge Companion." />
      </MotionWrapper>
      <div className="grid gap-6">
        <MotionWrapper delay={0.1}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UploadSection className="md:col-span-2 lg:col-span-2" />
            <PlanTracker className="md:col-span-1 lg:col-span-1" />
          </div>
        </MotionWrapper>
        <MotionWrapper delay={0.2}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <RecentDocuments className="md:col-span-2 lg:col-span-2" />
            <AIInsights className="md:col-span-2 lg:col-span-1" />
          </div>
        </MotionWrapper>
      </div>
    </DashboardShell>
  )
}

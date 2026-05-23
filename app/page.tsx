"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
const DashboardHeader = dynamic(() => import("@/components/dashboard/header").then(mod => mod.DashboardHeader), { loading: () => <Skeleton className="h-6 w-32" /> });
const DashboardShell = dynamic(() => import("@/components/dashboard/shell").then(mod => mod.DashboardShell), { loading: () => <Skeleton className="h-6 w-32" /> });
const UploadSection = dynamic(() => import("@/components/dashboard/upload-section").then(mod => mod.UploadSection), { loading: () => <Skeleton className="h-6 w-32" /> });
const RecentDocuments = dynamic(() => import("@/components/dashboard/recent-documents").then(mod => mod.RecentDocuments), { loading: () => <Skeleton className="h-6 w-32" /> });
const AIInsights = dynamic(() => import("@/components/dashboard/ai-insights").then(mod => mod.AIInsights), { loading: () => <Skeleton className="h-6 w-32" /> });
const PlanTracker = dynamic(() => import("@/components/dashboard/plan-tracker").then(mod => mod.PlanTracker), { loading: () => <Skeleton className="h-6 w-32" /> });
const MotionWrapper = dynamic(() => import("@/components/ui/motion-wrapper").then(mod => mod.MotionWrapper), { loading: () => <Skeleton className="h-6 w-32" /> });

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

"use client"

import { InsightHeader } from "@/components/insights/InsightHeader"
import { InsightOverviewCard } from "@/components/insights/InsightOverviewCard"
import { SummaryCard } from "@/components/insights/SummaryCard"
import { TopicCloud } from "@/components/insights/TopicCloud"
import { PopularQuestions } from "@/components/insights/PopularQuestions"
import { ActivityFeed } from "@/components/insights/ActivityFeed"
import { ActionItemsPanel } from "@/components/insights/ActionItemsPanel"
import { Database, FileText, Search, Zap } from "lucide-react"

export default function InsightsDashboard() {
  return (
    <div className="flex flex-col min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <InsightHeader />

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <InsightOverviewCard
          title="Documents Indexed"
          metric="1,248"
          subtitle="+12 this week"
          icon={Database}
          iconColor="text-blue-500"
          glowColor="bg-blue-500"
        />
        <InsightOverviewCard
          title="Pages Processed"
          metric="14,092"
          subtitle="Across all sources"
          icon={FileText}
          iconColor="text-purple-500"
          glowColor="bg-purple-500"
        />
        <InsightOverviewCard
          title="Total AI Searches"
          metric="8,542"
          subtitle="+24% this month"
          icon={Search}
          iconColor="text-rose-500"
          glowColor="bg-rose-500"
        />
        <InsightOverviewCard
          title="Knowledge Coverage"
          metric="94%"
          subtitle="Confidence score"
          icon={Zap}
          iconColor="text-amber-500"
          glowColor="bg-amber-500"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 items-start">
        
        {/* Left Column (2/3 width on desktop) */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold tracking-tight">Recent Document Summaries</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SummaryCard
                title="Q4 Financial Report 2023"
                date="2 days ago"
                summary="The Q4 report indicates a 23% increase in overall revenue, driven primarily by strong performance in the Enterprise sector. Operational costs decreased by 5%, leading to a higher profit margin. The report also highlights three key risks for the upcoming quarter including supply chain disruptions and increased market competition."
                confidence={98}
              />
              <SummaryCard
                title="Product Roadmap 2024"
                date="1 week ago"
                summary="Strategic plan outlining the major feature releases for 2024. Key highlights include the launch of the new AI Assistant in Q2, an overhaul of the user interface by Q3, and expanded integration capabilities with popular CRMs by Q4. Resource allocation emphasizes the AI division."
                confidence={94}
              />
              <SummaryCard
                title="Employee Handbook 2024"
                date="2 weeks ago"
                summary="Updated company policies for the new year. Major changes include a revised remote work policy allowing up to 3 days from home, expanded mental health benefits, and a new structured professional development allowance of $1,000 per employee annually."
                confidence={99}
              />
              <SummaryCard
                title="Competitor Analysis - Tech Industry"
                date="3 weeks ago"
                summary="Our main competitors have recently launched similar AI-driven features. However, our platform maintains a competitive edge in processing speed and accuracy. The analysis suggests focusing marketing efforts on our superior security compliance."
                confidence={92}
              />
            </div>
          </section>

          <section>
            <ActivityFeed />
          </section>
        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="space-y-6 md:space-y-8 xl:sticky xl:top-6">
          <TopicCloud />
          <PopularQuestions />
          <ActionItemsPanel />
        </div>
      </div>
    </div>
  )
}
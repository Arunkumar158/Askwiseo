import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"
import { usePlan } from "@/hooks/usePlan"
import Link from "next/link"

interface PlanTrackerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PlanTracker({ className, ...props }: PlanTrackerProps) {
  const { plan, isFree, loading } = usePlan()

  if (loading) {
    return (
      <Card className={cn("rounded-2xl shadow-sm transition-transform duration-200 hover:scale-[1.02]", className)} {...props}>
        <CardContent className="p-6 flex justify-center items-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!plan) return null;

  const docsUsed = plan.pdf_count
  const docsLimit = plan.pdf_limit === 999999 ? "Unlimited" : plan.pdf_limit
  const docsPercent = plan.pdf_limit === 999999 ? 0 : Math.min((docsUsed / plan.pdf_limit) * 100, 100)
  
  const storageUsedMB = plan.storage_used_bytes / (1024 * 1024)
  const storageLimitMB = plan.storage_limit_bytes / (1024 * 1024)
  const storagePercent = Math.min((storageUsedMB / storageLimitMB) * 100, 100)
  
  const queriesUsed = plan.questions_today
  const queriesLimit = plan.questions_limit === 999999 ? "Unlimited" : plan.questions_limit
  const queriesPercent = plan.questions_limit === 999999 ? 0 : Math.min((queriesUsed / plan.questions_limit) * 100, 100)

  const planName = plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1)

  return (
    <Card className={cn("rounded-2xl shadow-sm transition-transform duration-200 hover:scale-[1.02]", className)} {...props}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Plan Usage
          <span className="text-xs px-2 py-1 bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 rounded-full font-medium">
            {planName} Plan
          </span>
        </CardTitle>
        <CardDescription>Your current plan usage and limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Documents</span>
            <span className="text-sm text-muted-foreground">
              {docsUsed}/{docsLimit}
            </span>
          </div>
          <Progress value={docsPercent} className="h-2 bg-muted" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Storage</span>
            <span className="text-sm text-muted-foreground">
              {storageUsedMB.toFixed(1)} MB/{storageLimitMB.toFixed(0)} MB
            </span>
          </div>
          <Progress value={storagePercent} className="h-2 bg-muted" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI Queries (Today)</span>
            <span className="text-sm text-muted-foreground">
              {queriesUsed}/{queriesLimit}
            </span>
          </div>
          <Progress value={queriesPercent} className="h-2 bg-muted" />
        </div>

        {isFree && (
          <Button asChild className="w-full gap-2 bg-violet-600 hover:bg-violet-700 active:scale-95 transition-transform">
            <Link href="/pricing">
              <CreditCard className="h-4 w-4" />
              Upgrade Plan
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

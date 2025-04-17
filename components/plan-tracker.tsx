import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import Link from "next/link"

interface PlanTrackerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PlanTracker({ className, ...props }: PlanTrackerProps) {
  // Example usage data
  const docsUsed = 4
  const docsLimit = 10
  const storageUsed = 125 // MB
  const storageLimit = 500 // MB
  const queriesUsed = 78
  const queriesLimit = 500

  return (
    <Card className={cn("rounded-2xl shadow-sm", className)} {...props}>
      <CardHeader>
        <CardTitle>Plan Usage</CardTitle>
        <CardDescription>Your current Pro plan usage and limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Documents</span>
            <span className="text-sm text-muted-foreground">
              {docsUsed}/{docsLimit}
            </span>
          </div>
          <Progress value={(docsUsed / docsLimit) * 100} className="h-2 bg-muted" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Storage</span>
            <span className="text-sm text-muted-foreground">
              {storageUsed} MB/{storageLimit} MB
            </span>
          </div>
          <Progress value={(storageUsed / storageLimit) * 100} className="h-2 bg-muted" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI Queries</span>
            <span className="text-sm text-muted-foreground">
              {queriesUsed}/{queriesLimit}
            </span>
          </div>
          <Progress value={(queriesUsed / queriesLimit) * 100} className="h-2 bg-muted" />
        </div>

        <Link href="/pricing">
          <Button className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
            <CreditCard className="h-4 w-4" />
            Upgrade Plan
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

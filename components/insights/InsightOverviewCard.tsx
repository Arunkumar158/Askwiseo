import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface InsightOverviewCardProps {
  title: string
  metric: string
  subtitle: string
  icon: LucideIcon
  iconColor: string
  glowColor: string
}

export function InsightOverviewCard({
  title,
  metric,
  subtitle,
  icon: Icon,
  iconColor,
  glowColor,
}: InsightOverviewCardProps) {
  return (
    <Card className="relative overflow-hidden group border-border/40 bg-card/40 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-border/80 hover:-translate-y-1">
      <div className={cn("absolute -inset-1 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20", glowColor)} />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
          <div className={cn("p-2 rounded-xl bg-background/50 backdrop-blur-md border border-border/50", glowColor.replace("bg-", "border-").replace("500", "500/30"))}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <div className="text-3xl font-bold tracking-tight">{metric}</div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Upload, Search, Sparkles } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "upload",
    user: "Alex",
    action: "uploaded",
    target: "Q4 Financial Report.pdf",
    time: "2 hours ago",
    icon: Upload,
    color: "text-blue-500 bg-blue-500/10"
  },
  {
    id: 2,
    type: "insight",
    user: "AI",
    action: "generated insights for",
    target: "Employee Handbook 2024",
    time: "4 hours ago",
    icon: Sparkles,
    color: "text-primary bg-primary/10"
  },
  {
    id: 3,
    type: "search",
    user: "Sarah",
    action: "searched across",
    target: "Legal Contracts",
    time: "5 hours ago",
    icon: Search,
    color: "text-purple-500 bg-purple-500/10"
  },
  {
    id: 4,
    type: "upload",
    user: "Mike",
    action: "uploaded",
    target: "Competitor Analysis.pdf",
    time: "Yesterday",
    icon: Upload,
    color: "text-blue-500 bg-blue-500/10"
  }
]

export function ActivityFeed() {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[300px] w-full px-6 pb-6">
          <div className="relative border-l border-border/60 ml-3 space-y-6 pt-2">
            {activities.map((activity) => (
              <div key={activity.id} className="relative pl-6">
                <div className={`absolute -left-[11px] top-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="h-3 w-3" />
                </div>
                <div className="flex flex-col">
                  <div className="text-sm">
                    <span className="font-medium text-foreground">{activity.user}</span>
                    <span className="text-muted-foreground mx-1">{activity.action}</span>
                    <span className="font-medium text-foreground">{activity.target}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

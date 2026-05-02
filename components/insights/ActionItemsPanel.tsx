import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const items = [
  {
    id: 1,
    title: "Contract Renewal Due",
    doc: "Vendor Agreement 2023.pdf",
    deadline: "Tomorrow",
    priority: "high",
    color: "bg-rose-500/10 border-rose-500/20 text-rose-500",
    icon: AlertCircle
  },
  {
    id: 2,
    title: "Quarterly Taxes Filing",
    doc: "Q3 Financials.pdf",
    deadline: "In 3 Days",
    priority: "medium",
    color: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    icon: Clock
  },
  {
    id: 3,
    title: "Missing Signatures",
    doc: "Employee Onboarding.pdf",
    deadline: "Next Week",
    priority: "low",
    color: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    icon: CheckCircle2
  }
]

export function ActionItemsPanel() {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          AI Detected Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className={`p-3 rounded-lg border ${item.color} flex items-start gap-3 transition-transform hover:-translate-y-0.5 duration-200`}>
            <item.icon className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium leading-none mb-1.5">{item.title}</h4>
              <p className="text-xs opacity-80 truncate mb-2">{item.doc}</p>
              <Badge variant="outline" className={`h-5 text-[10px] border-current bg-transparent`}>
                Due: {item.deadline}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

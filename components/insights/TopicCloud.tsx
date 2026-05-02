import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"

const topics = [
  { name: "Finance", weight: "lg", count: 42, color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20" },
  { name: "Legal", weight: "md", count: 28, color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20" },
  { name: "HR", weight: "sm", count: 15, color: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" },
  { name: "Compliance", weight: "lg", count: 37, color: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20" },
  { name: "Contracts", weight: "md", count: 24, color: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20" },
  { name: "Invoices", weight: "sm", count: 19, color: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/20" },
  { name: "Quarterly Reports", weight: "md", count: 22, color: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20" },
]

export function TopicCloud() {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          Key Topics Extracted
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2.5">
          {topics.map((topic) => (
            <Badge
              key={topic.name}
              variant="outline"
              className={`
                cursor-pointer transition-all duration-300
                ${topic.color}
                ${topic.weight === "lg" ? "text-sm px-3 py-1.5" : ""}
                ${topic.weight === "md" ? "text-xs px-2.5 py-1" : ""}
                ${topic.weight === "sm" ? "text-[10px] px-2 py-0.5" : ""}
              `}
            >
              {topic.name}
              <span className="ml-1.5 opacity-60 text-[10px]">{topic.count}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

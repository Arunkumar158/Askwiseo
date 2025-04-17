import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Clock } from "lucide-react"

interface AIInsightsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AIInsights({ className, ...props }: AIInsightsProps) {
  return (
    <Card className={cn("rounded-2xl shadow-sm", className)} {...props}>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>Analytics and insights from your knowledge base</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="queried">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queried">Most Queried</TabsTrigger>
            <TabsTrigger value="keywords">Top Keywords</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          <TabsContent value="queried" className="mt-4 space-y-4">
            <div className="space-y-3">
              {[
                { name: "Annual Report 2023.pdf", count: 42 },
                { name: "Product Specifications.pdf", count: 28 },
                { name: "Financial Analysis Q4.pdf", count: 17 },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100">
                      <Search className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="text-sm font-medium">{doc.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{doc.count} queries</span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="keywords" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                { keyword: "Financial", count: 56 },
                { keyword: "Product", count: 42 },
                { keyword: "Market", count: 38 },
                { keyword: "Analysis", count: 35 },
                { keyword: "Revenue", count: 29 },
                { keyword: "Growth", count: 24 },
                { keyword: "Strategy", count: 22 },
                { keyword: "Forecast", count: 18 },
              ].map((keyword, i) => (
                <div
                  key={i}
                  className="rounded-full border bg-muted px-3 py-1 text-xs"
                  style={{
                    fontSize: `${Math.max(0.7, Math.min(1.2, 0.7 + keyword.count / 100))}rem`,
                  }}
                >
                  {keyword.keyword}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="recent" className="mt-4 space-y-4">
            <div className="space-y-3">
              {[
                { query: "What were the Q4 financial results?", time: "2 hours ago" },
                { query: "Product launch timeline", time: "5 hours ago" },
                { query: "Market share comparison", time: "Yesterday" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100">
                      <Clock className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="text-sm font-medium">{item.query}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

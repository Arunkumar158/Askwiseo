"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"
import { useDocuments } from "@/hooks/useDocuments"

interface AIInsightsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AIInsights({ className, ...props }: AIInsightsProps) {
  const { documents, loading } = useDocuments()

  // Get 3 most recently uploaded documents
  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <Card className={cn("rounded-2xl shadow-sm transition-transform duration-200 hover:scale-[1.02]", className)} {...props}>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>Analytics and insights from your knowledge base</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Upload documents to see insights
          </div>
        ) : (
          <div className="space-y-3">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100">
                    <Search className="h-4 w-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-medium">{doc.filename}</span>
                </div>
                <span className="text-sm text-muted-foreground">{doc.chunk_count} chunks</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useDocuments } from "@/hooks/useDocuments"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { 
  Database, 
  FileText, 
  Search, 
  Zap, 
  Loader2, 
  Plus, 
  Tag, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Sparkles,
  BarChart3,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { InsightOverviewCard } from "@/components/insights/InsightOverviewCard"
import { InsightHeader } from "@/components/insights/InsightHeader"

export default function InsightsDashboard() {
  const { documents, loading, formatFileSize } = useDocuments()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Extracting intelligence from your knowledge base...</p>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center px-4">
        <div className="p-6 rounded-full bg-primary/10 text-primary">
          <Database className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">No documents found</h2>
          <p className="text-muted-foreground max-w-[450px] mx-auto">
            You haven&apos;t uploaded any documents yet. Upload your first PDF to see AI-generated insights, summaries, and key topics.
          </p>
        </div>
        <Link href="/uploads">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-5 w-5" />
            Upload Now
          </Button>
        </Link>
      </div>
    )
  }

  // Calculate stats
  const totalPages = documents.reduce((acc, doc) => acc + (doc.page_count || 0), 0)
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunk_count || 0), 0)
  const totalSize = documents.reduce((acc, doc) => acc + (doc.file_size_bytes || 0), 0)

  // Document Types aggregation
  const typeCounts = documents.reduce((acc: Record<string, number>, doc) => {
    const type = doc.document_type || "Uncategorized"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])

  // Topics aggregation
  const topicCounts = documents.reduce((acc: Record<string, number>, doc) => {
    (doc.key_topics || []).forEach(topic => {
      acc[topic] = (acc[topic] || 0) + 1
    })
    return acc
  }, {})
  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

  // Recent Activity
  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // Action Items collection
  const allActionItems = documents.flatMap(doc => 
    (doc.action_items || []).map(item => ({ text: item, source: doc.filename }))
  )

  return (
    <div className="flex flex-col min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      <InsightHeader />

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <InsightOverviewCard
          title="Total Documents"
          metric={documents.length.toString()}
          subtitle="Real-time count"
          icon={Database}
          iconColor="text-blue-500"
          glowColor="bg-blue-500"
        />
        <InsightOverviewCard
          title="Pages Processed"
          metric={totalPages.toLocaleString()}
          subtitle="Across all sources"
          icon={FileText}
          iconColor="text-purple-500"
          glowColor="bg-purple-500"
        />
        <InsightOverviewCard
          title="Knowledge Chunks"
          metric={totalChunks.toLocaleString()}
          subtitle="Vector embeddings"
          icon={Search}
          iconColor="text-rose-500"
          glowColor="bg-rose-500"
        />
        <InsightOverviewCard
          title="Total Storage"
          metric={formatFileSize(totalSize)}
          subtitle="Compressed size"
          icon={Zap}
          iconColor="text-amber-500"
          glowColor="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 items-start">
        
        {/* Left Column (2/3 width on desktop) */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Intelligence Summaries</h2>
                <p className="text-sm text-muted-foreground mt-1">AI-generated deep dives into your document contents</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {documents.map((doc) => (
                <Card key={doc.id} className="group relative overflow-hidden border-border/40 bg-card/40 hover:bg-card/60 transition-all duration-300 backdrop-blur-sm">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/50 transition-colors" />
                  
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-bold truncate max-w-[300px] md:max-w-[450px]">{doc.filename}</h3>
                              {doc.document_type && (
                                <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] uppercase tracking-wider font-bold border-primary/20">
                                  {doc.document_type}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })} • {doc.page_count} pages • {formatFileSize(doc.file_size_bytes)}
                            </p>
                          </div>
                          
                          <Link href={`/search?doc=${doc.id}`}>
                            <Button size="sm" className="gap-1.5 shadow-md hover:shadow-primary/20">
                              <Sparkles className="h-3.5 w-3.5" />
                              Ask AI
                            </Button>
                          </Link>
                        </div>

                        {doc.summary ? (
                          <div className="space-y-4">
                            <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/20 italic">
                              &quot;{doc.summary}&quot;
                            </p>
                            
                            {doc.key_topics && doc.key_topics.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {doc.key_topics.map((topic) => (
                                  <Link key={topic} href={`/search?q=${encodeURIComponent(topic)}`}>
                                    <Badge variant="outline" className="bg-background/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer text-xs">
                                      #{topic}
                                    </Badge>
                                  </Link>
                                ))}
                              </div>
                            )}

                            {doc.action_items && doc.action_items.length > 0 && (
                              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                                <div className="flex items-center gap-2 text-amber-500 mb-1">
                                  <AlertCircle className="h-4 w-4" />
                                  <span className="text-xs font-bold uppercase tracking-wider">Detected Action Items</span>
                                </div>
                                <ul className="space-y-1.5">
                                  {doc.action_items.map((item, idx) => (
                                    <li key={idx} className="text-sm text-amber-900/80 dark:text-amber-200/80 flex items-start gap-2">
                                      <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-500 shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-border/60 bg-muted/20">
                            <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-2" />
                            <p className="text-sm text-muted-foreground text-center">
                              No summary available — upload a new PDF to generate insights.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="space-y-6 md:space-y-8 xl:sticky xl:top-6">
          
          {/* Document Types Chart */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Document Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {sortedTypes.map(([type, count]) => (
                <div key={type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{type}</span>
                    <span className="text-muted-foreground">{count} doc{count !== 1 ? 's' : ''}</span>
                  </div>
                  <Progress 
                    value={(count / documents.length) * 100} 
                    className="h-1.5 bg-muted/40" 
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Topics Panel */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Tag className="h-4 w-4 text-rose-500" />
                Trending Knowledge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {sortedTopics.length > 0 ? (
                  sortedTopics.map(([topic, count]) => (
                    <Link key={topic} href={`/search?q=${encodeURIComponent(topic)}`}>
                      <Badge 
                        variant="secondary" 
                        className="bg-muted/50 hover:bg-primary/20 hover:text-primary transition-all cursor-pointer py-1 px-2.5 text-xs font-medium"
                      >
                        {topic}
                        <span className="ml-1.5 text-[10px] opacity-40">{count}</span>
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">No topics extracted yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Items Global Panel */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Action Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {allActionItems.length > 0 ? (
                <div className="divide-y divide-border/20">
                  {allActionItems.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="p-4 hover:bg-muted/30 transition-colors space-y-1">
                      <p className="text-sm font-medium leading-tight text-foreground/90">{item.text}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span className="truncate">{item.source}</span>
                      </div>
                    </div>
                  ))}
                  {allActionItems.length > 6 && (
                    <div className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">+{allActionItems.length - 6} more items</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-xs text-muted-foreground italic">Clear sky! No actions detected.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Panel */}
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-6">
                {recentDocs.map((doc, idx) => (
                  <div key={doc.id} className="relative flex gap-4">
                    {idx !== recentDocs.length - 1 && (
                      <div className="absolute left-[11px] top-6 w-0.5 h-full bg-border/20" />
                    )}
                    <div className="relative z-10 w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center shrink-0">
                      <FileText className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-xs font-bold truncate pr-4">{doc.filename}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Uploaded {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
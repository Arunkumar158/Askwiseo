"use client";

import { useMemo } from "react";
import {
  FileText, TrendingUp, AlertCircle, Tag,
  BarChart3, Clock, Layers, BookOpen, Loader2, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function InsightsPage() {
  const { documents, loading, formatFileSize } = useDocuments();
  const router = useRouter();

  const analytics = useMemo(() => {
    const totalPages = documents.reduce((sum, d) => sum + (d.page_count || 0), 0);
    const totalSize = documents.reduce((sum, d) => sum + (d.file_size_bytes || 0), 0);
    const totalChunks = documents.reduce((sum, d) => sum + (d.chunk_count || 0), 0);
    const typeCount: Record<string, number> = {};
    documents.forEach((d) => {
      const type = d.document_type || "Other";
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    const topicCount: Record<string, number> = {};
    documents.forEach((d) => {
      (d.key_topics || []).forEach((topic) => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
    });
    const allActionItems = documents.flatMap((d) =>
      (d.action_items || []).map((item) => ({
        item,
        filename: d.filename,
        doc_id: d.id,
      }))
    );
    const topTopics = Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([topic]) => topic);
    return { totalPages, totalSize, totalChunks, typeCount, topTopics, allActionItems };
  }, [documents]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
        <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Synthesizing Analytics...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-[#121212] rounded-[2rem] border border-white/5 flex items-center justify-center mx-auto mb-8 shadow-premium-glow">
          <BarChart3 className="h-12 w-12 text-zinc-700" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 font-sans">No intelligence gathered yet</h2>
        <p className="text-zinc-500 max-w-md mx-auto mb-8 text-lg font-inter">
          Your insights dashboard will populate once you upload and index your first documents.
        </p>
        <Button 
          onClick={() => router.push("/uploads")}
          className="rounded-full px-8 h-12 bg-violet-600 hover:bg-violet-500 shadow-premium-glow"
        >
          Upload Knowledge
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-12 bg-[#050505]">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-sans">Strategic Insights</h1>
        <p className="text-zinc-500 text-lg font-inter">AI-distilled intelligence across your entire knowledge repository.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Assets", value: documents.length, icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Analyzed Pages", value: analytics.totalPages, icon: BookOpen, color: "text-violet-400", bg: "bg-violet-400/10" },
          { label: "Knowledge Units", value: analytics.totalChunks, icon: Layers, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Data Volume", value: formatFileSize(analytics.totalSize), icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-400/10" },
        ].map((stat, i) => (
          <Card key={i} className="border border-white/5 bg-[#121212]/40 backdrop-blur-md rounded-3xl overflow-hidden hover:border-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div className="h-1 w-12 bg-white/5 rounded-full" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-sans">{stat.value}</p>
                <p className="text-xs font-mono tracking-widest text-zinc-500 uppercase mt-1">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Summaries */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 font-sans">
              <Sparkles className="h-5 w-5 text-violet-400" />
              Intelligence Summaries
            </h2>
            <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-white">View all</Button>
          </div>
          
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="border border-white/5 bg-[#121212]/40 backdrop-blur-md rounded-3xl overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#050505] border border-white/5 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors">{doc.filename}</h3>
                          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">{doc.document_type || "General Document"}</p>
                        </div>
                      </div>
                      
                      {doc.summary ? (
                        <p className="text-sm text-zinc-400 leading-relaxed font-inter">
                          {doc.summary}
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-600 italic font-inter">
                          No intelligence report generated. Re-index to analyze.
                        </p>
                      )}

                      {doc.key_topics && doc.key_topics.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {doc.key_topics.slice(0, 5).map((topic) => (
                            <Badge key={topic} variant="outline" className="bg-white/5 border-white/5 text-zinc-500 text-[10px] py-0.5 rounded-full">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3 min-w-[140px]">
                       <Button 
                         size="sm" 
                         className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 h-10 font-semibold"
                         onClick={() => router.push(`/search?doc=${doc.id}`)}
                       >
                         Query AI
                       </Button>
                       <div className="flex items-center justify-between px-2 text-[10px] font-mono text-zinc-600">
                         <span>{doc.page_count}p</span>
                         <span className="w-1 h-1 rounded-full bg-zinc-800" />
                         <span>{formatFileSize(doc.file_size_bytes)}</span>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-8">
          {/* Topics Cloud */}
          <Card className="border border-white/5 bg-[#121212]/40 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest font-sans flex items-center gap-2">
                <Tag className="h-4 w-4" /> Global Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics.topTopics.map((topic) => (
                  <button
                    key={topic}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-400 hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-white transition-all font-inter"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(topic)}`)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Items */}
          {analytics.allActionItems.length > 0 && (
            <Card className="border border-amber-500/20 bg-amber-500/5 backdrop-blur-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.05)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-amber-500 uppercase tracking-widest font-sans flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Detected Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.allActionItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <p className="text-sm text-zinc-200 font-medium group-hover:text-amber-400 transition-colors leading-snug">
                      • {item.item}
                    </p>
                    <p className="text-[10px] text-zinc-600 font-mono mt-1 uppercase tracking-tight truncate">
                      REF: {item.filename}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Classification */}
          <Card className="border border-white/5 bg-[#121212]/40 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest font-sans flex items-center gap-2">
                <Layers className="h-4 w-4" /> Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analytics.typeCount).map(([type, count]) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">{type}</span>
                    <span className="text-zinc-600 font-mono">{count} assets</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                      style={{ width: `${(count / documents.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
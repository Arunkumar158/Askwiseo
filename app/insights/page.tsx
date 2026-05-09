"use client";

import { useMemo } from "react";
import {
  FileText, TrendingUp, AlertCircle, Tag,
  BarChart3, Clock, Layers, BookOpen, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BarChart3 className="h-16 w-16 mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">No insights yet</h2>
          <p className="text-muted-foreground mb-6">
            Upload your business documents to see AI-generated insights
          </p>
          <Button onClick={() => router.push("/uploads")}>Upload Documents</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document Insights</h1>
        <p className="text-muted-foreground">
          AI-generated analytics across all your business documents
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalPages}</p>
                <p className="text-xs text-muted-foreground">Total Pages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Layers className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalChunks}</p>
                <p className="text-xs text-muted-foreground">Knowledge Chunks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatFileSize(analytics.totalSize)}</p>
                <p className="text-xs text-muted-foreground">Total Storage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" /> Document Summaries
          </h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-medium text-sm truncate">{doc.filename}</h3>
                        {doc.document_type && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {doc.document_type}
                          </Badge>
                        )}
                      </div>
                      {doc.summary ? (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {doc.summary}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No summary available — re-upload to generate insights
                        </p>
                      )}
                      {doc.key_topics && doc.key_topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {doc.key_topics.map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {doc.action_items && doc.action_items.length > 0 && (
                        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                            ⚠️ Action Items
                          </p>
                          {doc.action_items.slice(0, 2).map((item, i) => (
                            <p key={i} className="text-xs text-amber-600 dark:text-amber-500">
                              • {item}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span>{doc.page_count} pages</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.file_size_bytes)}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => router.push(`/search?doc=${doc.id}`)}
                    >
                      Ask AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {Object.keys(analytics.typeCount).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Document Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(analytics.typeCount).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{type}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(count / documents.length) * 80}px` }}
                      />
                      <span className="text-xs text-muted-foreground w-4">{count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {analytics.topTopics.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Top Topics
                </CardTitle>
                <CardDescription className="text-xs">
                  Extracted across all documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analytics.topTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                      onClick={() => router.push(`/search?q=${encodeURIComponent(topic)}`)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.allActionItems.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" /> Action Items
                </CardTitle>
                <CardDescription className="text-xs">
                  Deadlines and tasks detected by AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.allActionItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-amber-700 dark:text-amber-400 font-medium">
                      • {item.item}
                    </p>
                    <p className="text-muted-foreground mt-0.5 truncate">
                      From: {item.filename}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 text-xs">
                  <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{doc.filename}</p>
                    <p className="text-muted-foreground">
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </p>
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
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Loader2 } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { useRouter } from "next/navigation";
import type React from "react";

interface RecentDocumentsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RecentDocuments({ className, ...props }: RecentDocumentsProps) {
  const { documents, loading, formatFileSize } = useDocuments();
  const router = useRouter();
  const recent = documents.slice(0, 4);

  return (
    <Card className={cn("rounded-2xl shadow-sm transition-transform duration-200 hover:scale-[1.02]", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Your recently uploaded and processed documents</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No documents yet. Upload your first PDF!
          </div>
        ) : (
          <div className="space-y-4">
            {recent.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors duration-150 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-100">
                    <FileText className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()} • {doc.page_count} pages • {formatFileSize(doc.file_size_bytes)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={doc.status === "ready" ? "outline" : "secondary"}
                  className={cn(
                    doc.status === "ready"
                      ? "bg-green-50 text-green-700 hover:bg-green-50"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                  )}
                >
                  {doc.status === "ready" ? "Indexed" : "Processing"}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => router.push("/uploads")}>
              View All Documents
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
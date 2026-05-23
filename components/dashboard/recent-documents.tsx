"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments } from "@/hooks/useDocuments";
import { useRouter } from "next/navigation";
import type React from "react";

interface RecentDocumentsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RecentDocuments({ className, ...props }: RecentDocumentsProps) {
  const { documents, loading, formatFileSize } = useDocuments();
  const router = useRouter();
  const recent = documents.slice(0, 4);

  return (
    <Card className={cn("border border-white/5 bg-[#121212]/40 backdrop-blur-xl rounded-3xl overflow-hidden group transition-all duration-300 hover:border-violet-500/30", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div>
          <CardTitle className="text-xl font-bold font-sans tracking-tight">Recent Intelligence</CardTitle>
          <CardDescription className="font-inter text-zinc-500">Your recently indexed document assets.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5" onClick={() => router.push("/uploads")}>
          <MoreHorizontal className="h-4 w-4 text-zinc-500" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Skeleton className="h-8 w-32" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Syncing Assets...</p>
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
            <FileText className="h-8 w-8 mx-auto mb-3 text-zinc-700" />
            <p className="text-sm text-zinc-500 font-inter">No documents detected.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#050505]/40 p-3 transition-all duration-300 hover:bg-white/[0.03] hover:border-white/10 group/item cursor-pointer"
                onClick={() => router.push(`/documents/${doc.id}`)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#121212] border border-white/10 group-hover/item:border-violet-500/50 transition-colors">
                    <FileText className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate group-hover/item:text-violet-400 transition-colors">{doc.filename}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {new Date(doc.created_at).toLocaleDateString()} • {doc.page_count}p • {formatFileSize(doc.file_size_bytes)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className={cn("w-1.5 h-1.5 rounded-full", 
                     doc.status === 'ready' ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]"
                   )} />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hidden sm:inline">{doc.status}</span>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all font-semibold mt-2" 
              onClick={() => router.push("/uploads")}
            >
              Access Full Repository
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
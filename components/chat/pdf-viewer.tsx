"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PDFViewerProps {
  fileUrl: string;
}

export default function PDFViewer({ fileUrl }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle missing or invalid URLs defensively
  if (!fileUrl || fileUrl === "None" || fileUrl.trim() === "") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8 bg-[#0a0a0a]">
        <div className="w-16 h-16 rounded-[1.25rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/5">
          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="space-y-1 max-w-[280px]">
          <p className="text-amber-400 font-semibold tracking-wide text-sm font-sans">No Preview Available</p>
          <p className="text-xs text-zinc-500 font-inter leading-relaxed">
            This document does not have an active PDF link, but its contents are fully indexed. You can still query it using the chat panel on the right.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-10 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading PDF...</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-red-400 font-medium">Unable to load PDF preview.</p>
          <p className="text-xs text-muted-foreground max-w-[250px]">
            The file may not be accessible or your browser may not support embedded PDFs.
          </p>
        </div>
      )}

      <iframe
        src={fileUrl}
        className="flex-1 w-full h-full border-0 rounded-sm"
        title="PDF Viewer"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        style={{ display: error ? "none" : "block", minHeight: "100%" }}
      />
    </div>
  );
}

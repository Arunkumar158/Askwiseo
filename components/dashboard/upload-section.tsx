"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation"
import { useDocuments } from "@/hooks/useDocuments"
import { useDropzone } from "react-dropzone"

interface UploadSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UploadSection({ className, ...props }: UploadSectionProps) {
  const { upload, uploading, uploadProgress } = useDocuments()
  const router = useRouter()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) upload(acceptedFiles[0])
    },
  })

  return (
    <Card className={cn("border border-white/5 bg-[#121212]/40 backdrop-blur-xl rounded-3xl overflow-hidden group transition-all duration-300 hover:border-violet-500/30", className)} {...props}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold font-sans tracking-tight">Intelligence Ingestion</CardTitle>
        <CardDescription className="font-inter text-zinc-500">Drag and drop your PDFs to expand your searchable knowledge base.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center p-10 text-center cursor-pointer rounded-[2rem] border-2 border-dashed border-white/5 transition-all duration-300 relative overflow-hidden",
            isDragActive ? "bg-violet-500/10 border-violet-500/50" : "hover:bg-white/[0.02]"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="relative mb-4 group-hover:scale-110 transition-transform duration-300">
            <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
            <div className="relative w-14 h-14 rounded-2xl bg-[#050505] border border-white/10 flex items-center justify-center shadow-premium-glow">
                {uploading ? (
                  <Skeleton className="h-6 w-6 text-violet-400" />
                ) : (
                  <Upload className="h-6 w-6 text-violet-400" />
                )}
            </div>
          </div>
          
          <div className="space-y-1">
            {uploading ? (
              <p className="text-lg font-bold text-violet-400 font-mono animate-pulse">{uploadProgress}</p>
            ) : (
              <>
                <p className="font-semibold text-white font-sans">
                  {isDragActive ? "Release to Index" : "Drag & drop PDF"}
                </p>
                <p className="text-xs text-zinc-500 font-inter">PDF files up to 50MB</p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-700 text-white font-bold shadow-premium-glow hover:scale-[1.02] active:scale-95 transition-all"
            disabled={uploading}
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          >
            <FileText className="h-4 w-4 mr-2" />
            {uploading ? "Ingesting..." : "Select Files"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all"
            onClick={() => router.push("/uploads")}
          >
            Browse Library
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
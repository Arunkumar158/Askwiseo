"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Loader2 } from "lucide-react"
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
    <Card className={cn("rounded-2xl shadow-sm transition-transform duration-200 hover:scale-[1.02]", className)} {...props}>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>Drag and drop your PDFs to convert them into searchable knowledge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4">
          <div
            {...getRootProps()}
            className={cn(
              "flex h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 px-4 py-8 text-center transition-colors hover:border-violet-300 hover:bg-muted",
              isDragActive && "border-violet-400 bg-violet-50/10"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-violet-100 p-3">
                {uploading
                  ? <Loader2 className="h-6 w-6 text-violet-600 animate-spin" />
                  : <Upload className="h-6 w-6 text-violet-600" />
                }
              </div>
              <div className="flex flex-col gap-1">
                {uploading ? (
                  <p className="font-medium text-violet-600">{uploadProgress}</p>
                ) : (
                  <>
                    <p className="font-medium">Drag & drop PDFs here or click to browse</p>
                    <p className="text-sm text-muted-foreground">Support for PDF files up to 50MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col sm:flex-row gap-2">
            <Button
              className="w-full gap-2 bg-violet-600 hover:bg-violet-700 active:scale-95 transition-transform"
              disabled={uploading}
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            >
              <FileText className="h-4 w-4" />
              {uploading ? "Uploading..." : "Select Files"}
            </Button>
            <Button
              variant="outline"
              className="w-full active:scale-95 transition-transform"
              onClick={() => router.push("/uploads")}
            >
              Browse Library
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
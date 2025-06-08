"use client"

import type React from "react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { uploadPDF, UploadProgress } from "@/utils/uploadPDF"
import { Progress } from "@/components/ui/progress"

interface UploadSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UploadSection({ className, ...props }: UploadSectionProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ progress: 0, status: 'success' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadPDF(file, setUploadProgress);
  };

  const handleBrowseLibrary = () => {
    router.push('/uploads');
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    await uploadPDF(file, setUploadProgress);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Card className={cn("rounded-2xl shadow-sm", className)} {...props}>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>Drag and drop your PDFs to convert them into searchable knowledge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf"
            className="hidden"
          />
          <div
            className="flex h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 px-4 py-8 text-center transition-colors hover:border-violet-300 hover:bg-muted"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-violet-100 p-3">
                <Upload className="h-6 w-6 text-violet-600" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium">Drag & drop PDFs here or click to browse</p>
                <p className="text-sm text-muted-foreground">Support for PDF files up to 50MB</p>
              </div>
            </div>
          </div>
          {uploadProgress.status === 'uploading' && (
            <div className="w-full">
              <Progress value={uploadProgress.progress} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Uploading... {Math.round(uploadProgress.progress)}%
              </p>
            </div>
          )}
          <div className="flex w-full flex-col sm:flex-row gap-2">
            <Button 
              className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-4 w-4" />
              Select Files
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleBrowseLibrary}
            >
              Browse Library
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

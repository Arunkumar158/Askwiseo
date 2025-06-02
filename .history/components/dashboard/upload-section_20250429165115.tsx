import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"

interface UploadSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UploadSection({ className, ...props }: UploadSectionProps) {
  return (
    <Card className={cn("rounded-2xl shadow-sm", className)} {...props}>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>Drag and drop your PDFs to convert them into searchable knowledge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 px-4 py-8 text-center transition-colors hover:border-violet-300 hover:bg-muted">
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
          <div className="flex w-full gap-2">
            <Button className="flex-1 gap-2 bg-violet-600 hover:bg-violet-700">
              <FileText className="h-4 w-4" />
              Select Files
            </Button>
            <Button variant="outline" className="flex-1">
              Browse Library
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

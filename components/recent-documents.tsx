import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, FileText } from "lucide-react"

interface RecentDocumentsProps extends React.HTMLAttributes<HTMLDivElement> {}

const documents = [
  {
    id: 1,
    name: "Annual Report 2023.pdf",
    date: "2023-12-15",
    status: "indexed",
    pages: 24,
  },
  {
    id: 2,
    name: "Product Specifications.pdf",
    date: "2023-12-10",
    status: "indexed",
    pages: 12,
  },
  {
    id: 3,
    name: "Market Research.pdf",
    date: "2023-12-05",
    status: "processing",
    pages: 45,
  },
  {
    id: 4,
    name: "Financial Analysis Q4.pdf",
    date: "2023-11-28",
    status: "indexed",
    pages: 18,
  },
]

export function RecentDocuments({ className, ...props }: RecentDocumentsProps) {
  return (
    <Card className={cn("rounded-2xl shadow-sm", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Your recently uploaded and processed documents</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-100">
                  <FileText className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Added on {new Date(doc.date).toLocaleDateString()} • {doc.pages} pages
                  </p>
                </div>
              </div>
              <Badge
                variant={doc.status === "indexed" ? "outline" : "secondary"}
                className={cn(
                  doc.status === "indexed"
                    ? "bg-green-50 text-green-700 hover:bg-green-50"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-50",
                )}
              >
                {doc.status === "indexed" ? "Indexed" : "Processing"}
              </Badge>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            View All Documents
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

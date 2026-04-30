"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileText, Grid, List, Search, MoreVertical,
  Tag, Trash2, Eye, Upload, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useDocuments } from "@/hooks/useDocuments";

const statusColors: Record<string, string> = {
  ready: "bg-green-500",
  processing: "bg-yellow-500",
  error: "bg-red-500",
};

export default function UploadsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { documents, loading, uploading, uploadProgress, upload, remove, formatFileSize } = useDocuments();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) upload(acceptedFiles[0]);
    },
  });

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Upload Section */}
      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "bg-blue-500/10" : ""
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="w-12 h-12 mb-4 text-blue-500 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 mb-4 text-blue-500" />
            )}
            <h3 className="text-lg font-semibold mb-2">
              {uploading ? uploadProgress : isDragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
            <p className="text-xs text-muted-foreground">Only .pdf files allowed • Max 50MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 items-center">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No PDFs yet</h3>
          <p className="text-muted-foreground">Upload your first PDF to get started!</p>
        </div>
      )}

      {/* Grid View */}
      {!loading && filteredDocuments.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm leading-tight">{doc.filename}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(doc.created_at), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.page_count} pages • {formatFileSize(doc.file_size_bytes)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-600" onClick={() => remove(doc.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary" className={statusColors[doc.status] || "bg-gray-500"}>
                    {doc.status}
                  </Badge>
                  <Badge variant="outline">{doc.chunk_count} chunks</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && filteredDocuments.length > 0 && viewMode === "list" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.filename}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[doc.status] || "bg-gray-500"}>
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>{doc.page_count}</TableCell>
                <TableCell>{formatFileSize(doc.file_size_bytes)}</TableCell>
                <TableCell>{format(new Date(doc.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => remove(doc.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
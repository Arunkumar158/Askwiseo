"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import {
  FileText, Grid, List, Search, MoreVertical,
  Tag, Trash2, Eye, Upload, Loader2, Clock
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Document } from "@/lib/api";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/upgrade-modal";

const statusColors: Record<string, string> = {
  ready: "bg-green-500",
  processing: "bg-yellow-500",
  error: "bg-red-500",
};

export default function UploadsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { plan, canUpload } = usePlan();
  const { documents, loading, uploading, uploadProgress, upload, remove, formatFileSize } = useDocuments();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (!canUpload && plan) {
        setShowUpgradeModal(true);
        return;
      }
      if (acceptedFiles[0]) upload(acceptedFiles[0]);
    },
  });

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-sans">Knowledge Repository</h1>
          <p className="text-zinc-500 mt-2 text-lg font-inter">Securely manage and index your business intelligence.</p>
        </div>
        {plan && (
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-white/10 bg-white/5 text-zinc-400 font-mono text-[11px]">
              {plan.plan.toUpperCase()} PLAN
            </Badge>
            <span className="text-[10px] text-zinc-500 font-mono uppercase">
              {plan.pdf_count}/{plan.pdf_limit === 999999 ? "∞" : plan.pdf_limit} PDFs used
            </span>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-[2.5rem] blur-xl opacity-50" />
        <Card className="relative border border-white/10 bg-[#121212]/80 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden group transition-all duration-500 hover:border-violet-500/30">
          <CardContent className="p-1 md:p-2">
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center p-12 md:p-20 text-center cursor-pointer rounded-[2rem] border-2 border-dashed border-white/5 transition-all duration-300",
                isDragActive ? "bg-violet-500/10 border-violet-500/50" : "hover:bg-white/[0.02]"
              )}
            >
              <input {...getInputProps()} />
              <div className="relative mb-8">
                {uploading ? (
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-violet-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono text-violet-400">
                      {uploadProgress.replace('%', '')}
                    </div>
                  </div>
                ) : (
                  <div className="relative group-hover:scale-110 transition-transform duration-300">
                    <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-3xl bg-[#050505] border border-white/10 flex items-center justify-center shadow-premium-glow">
                      <Upload className="w-10 h-10 text-violet-400" />
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 font-sans">
                {uploading ? "Ingesting Document..." : isDragActive ? "Release to Index" : "Drag & drop PDF"}
              </h3>
              <p className="text-zinc-500 max-w-sm mb-8 text-base font-inter">
                Upload your PDF to convert it into a searchable AI knowledge base.
              </p>
              <Button 
                variant="outline" 
                className="rounded-full px-8 h-12 border-white/10 bg-white/5 hover:bg-white/10 transition-all font-sans font-semibold"
              >
                Browse Files
              </Button>
              <div className="mt-8 flex items-center gap-6 text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
                <span>Max 50MB</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span>PDF Format</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span>Encrypted</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-[#121212]/30 p-2 rounded-3xl border border-white/5">
        <div className="flex items-center gap-2 p-1 bg-[#050505] rounded-2xl border border-white/5">
          <Button 
            variant={viewMode === "grid" ? "secondary" : "ghost"} 
            size="sm" 
            className="rounded-xl px-4"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button 
            variant={viewMode === "list" ? "secondary" : "ghost"} 
            size="sm" 
            className="rounded-xl px-4"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto px-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search repository..."
              className="pl-10 h-11 bg-[#050505] border-white/5 rounded-2xl focus-visible:ring-violet-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-11 bg-[#050505] border-white/5 rounded-2xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#121212] border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Initializing Database...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-32 bg-[#121212]/20 rounded-[2.5rem] border border-white/5 border-dashed">
          <div className="w-20 h-20 bg-[#121212] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
            <FileText className="w-10 h-10 text-zinc-700" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No documents found</h3>
          <p className="text-zinc-500">Your search did not match any files in your repository.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc) => (
            <Link key={doc.id} href={`/documents/${doc.id}`} className="block group">
              <Card className="relative h-full border border-white/5 bg-[#121212]/40 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:bg-[#121212]/60 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-white/5 flex items-center justify-center group-hover:shadow-premium-glow transition-all duration-300">
                      <FileText className="w-6 h-6 text-violet-400" />
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10">
                            <MoreVertical className="h-4 w-4 text-zinc-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#121212] border-white/10 rounded-xl">
                          <DropdownMenuItem 
                            className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer" 
                            onClick={() => setDocumentToDelete(doc)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-white text-sm leading-tight mb-2 truncate group-hover:text-violet-400 transition-colors">
                    {doc.filename}
                  </h4>
                  
                  <div className="flex flex-col gap-1 text-[11px] font-mono text-zinc-500">
                    <div className="flex items-center gap-2">
                       <Clock className="h-3 w-3" />
                       <span>{format(new Date(doc.created_at), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Grid className="h-3 w-3" />
                       <span>{doc.page_count} pages • {formatFileSize(doc.file_size_bytes)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px]", 
                        doc.status === 'ready' ? "bg-green-500 shadow-green-500/50" : 
                        doc.status === 'processing' ? "bg-yellow-500 shadow-yellow-500/50" : "bg-red-500 shadow-red-500/50"
                      )} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{doc.status}</span>
                    </div>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] font-mono text-zinc-500">
                      {doc.chunk_count} CHUNKS
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#121212]/20 backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">Document</TableHead>
                <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">Metrics</TableHead>
                <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">Indexed On</TableHead>
                <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id} className="border-white/5 hover:bg-white/[0.02] group transition-colors">
                  <TableCell className="py-4">
                    <Link href={`/documents/${doc.id}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#050505] border border-white/5 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className="font-semibold text-white truncate max-w-[300px]">{doc.filename}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        doc.status === 'ready' ? "bg-green-500" : 
                        doc.status === 'processing' ? "bg-yellow-500" : "bg-red-500"
                      )} />
                      <span className="text-xs text-zinc-400 capitalize">{doc.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500 font-mono">
                    {doc.page_count}p • {formatFileSize(doc.file_size_bytes)}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500 font-mono">
                    {format(new Date(doc.created_at), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-zinc-600 hover:text-red-400 hover:bg-red-400/10"
                      onClick={() => setDocumentToDelete(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <DialogContent className="bg-[#121212] border-white/10 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Decommission Intelligence?</DialogTitle>
            <DialogDescription className="text-zinc-500">
              You are about to permanently delete <span className="text-white font-semibold">{documentToDelete?.filename}</span>. 
              This will erase all indexed chunks and AI summaries. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-6">
            <Button variant="ghost" className="rounded-xl hover:bg-white/5" onClick={() => setDocumentToDelete(null)}>
              Abort
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl bg-red-600 hover:bg-red-500"
              onClick={() => {
                if (documentToDelete) {
                  remove(documentToDelete.id);
                  setDocumentToDelete(null);
                }
              }}
            >
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="pdf_limit"
      />
    </div>
  );
}
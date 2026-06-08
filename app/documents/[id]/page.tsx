"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Calendar,
  Layers,
  HardDrive,
  Tag,
  MessageSquare,
  Sparkles,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Trash2,
  Send,
  MoreVertical,
  ListChecks,
  Brain,
} from "lucide-react";

import {
  deleteDocument,
  getDocument,
  formatFileSize,
  Document as IDocument,
} from "@/lib/api";
import { useChat, LocalMessage } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// Dynamically import the isolated PDF viewer to avoid SSR/initialization issues.
const PDFViewer = dynamic(() => import("@/components/chat/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 bg-zinc-950/20">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground">Initializing PDF engine...</p>
    </div>
  ),
});

type DesktopTab = "summary" | "chat" | "info";
type MobileTab = "document" | "summary" | "chat";

const quickActions = [
  "Summarize",
  "Key Insights",
  "Find action items",
  "What are the main points?",
];

const topicColors = [
  "border-violet-400/25 bg-violet-400/10 text-violet-200",
  "border-sky-400/25 bg-sky-400/10 text-sky-200",
  "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  "border-rose-400/25 bg-rose-400/10 text-rose-200",
  "border-amber-400/25 bg-amber-400/10 text-amber-200",
];

export default function DocumentViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [doc, setDoc] = useState<IDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const { messages, loading: chatLoading, sendMessage, loadHistory } = useChat(id);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [desktopTab, setDesktopTab] = useState<DesktopTab>("summary");
  const [mobileTab, setMobileTab] = useState<MobileTab>("document");
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchDoc() {
      try {
        const data = await getDocument(id);
        setDoc(data);
        loadHistory();
      } catch (err: any) {
        setError(err.message || "Failed to load document details");
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [id, loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleQuickAction = (label: string) => {
    const prompts: Record<string, string> = {
      Summarize: "Summarize this document",
      "Key Insights": "What are the key insights?",
      "Find action items": "Identify all action items",
      "What are the main points?": "What are the main points?",
    };
    sendMessage(prompts[label] || label);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Page link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleDownload = () => {
    if (!doc?.file_url) return;
    window.open(doc.file_url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    if (!doc) return;
    setDeleting(true);
    try {
      await deleteDocument(doc.id);
      toast.success(`"${doc.filename}" deleted`);
      router.push("/uploads");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const maxPages = Math.max(doc?.page_count || 1, 1);
  const fileUrlWithControls = doc?.file_url
    ? `${doc.file_url}#page=${pageNumber}&zoom=${zoom}`
    : "";

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-6 bg-[#050505]">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-2xl" />
          <Loader2 className="relative h-16 w-16 animate-spin text-violet-500" />
        </div>
        <p className="font-mono text-xs uppercase text-zinc-500">Opening Document Node...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#050505] p-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/5 bg-[#121212] shadow-premium-glow">
          <FileText className="h-10 w-10 text-zinc-700" />
        </div>
        <div>
          <h1 className="mb-2 font-sans text-3xl font-bold text-white">Document Offline</h1>
          <p className="max-w-sm font-inter text-zinc-500">
            {error || "The requested intelligence asset could not be located."}
          </p>
        </div>
        <Button
          onClick={() => router.push("/uploads")}
          variant="outline"
          className="h-12 rounded-2xl border-white/10 bg-white/5 px-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Repository
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#050505] text-zinc-100">
      <section className="hidden h-screen overflow-hidden md:flex">
        <DocumentColumn
          doc={doc}
          fileUrlWithControls={fileUrlWithControls}
          pageNumber={pageNumber}
          maxPages={maxPages}
          zoom={zoom}
          onBack={() => router.push("/uploads")}
          onDownload={handleDownload}
          onShare={handleShare}
          onPrevPage={() => setPageNumber((page) => Math.max(1, page - 1))}
          onNextPage={() => setPageNumber((page) => Math.min(maxPages, page + 1))}
          onZoomOut={() => setZoom((value) => Math.max(50, value - 10))}
          onZoomIn={() => setZoom((value) => Math.min(200, value + 10))}
        />

        <aside className="flex h-screen w-[45%] min-w-[420px] flex-col border-l border-white/10 bg-[#0b0b0d]">
          <DesktopTabs activeTab={desktopTab} onChange={setDesktopTab} />
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {desktopTab === "summary" && (
              <SummaryPanel doc={doc} onAsk={() => setDesktopTab("chat")} />
            )}
            {desktopTab === "chat" && (
              <ChatPanel
                messages={messages}
                chatLoading={chatLoading}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSend}
                onQuickAction={handleQuickAction}
                bottomRef={bottomRef}
              />
            )}
            {desktopTab === "info" && (
              <InfoPanel doc={doc} deleting={deleting} onDelete={handleDelete} />
            )}
          </div>
        </aside>
      </section>

      <section className="flex h-screen flex-col md:hidden">
        <MobileHeader
          doc={doc}
          onBack={() => router.push("/uploads")}
          onDownload={handleDownload}
          onShare={handleShare}
        />
        <MobileTabs activeTab={mobileTab} onChange={setMobileTab} />
        <div className="min-h-0 flex-1 overflow-hidden">
          {mobileTab === "document" && (
            <div className="flex h-full flex-col">
              <div className="min-h-0 flex-1 bg-[#08080a]">
                <PdfSurface doc={doc} fileUrl={fileUrlWithControls} compact />
              </div>
              <PdfControls
                pageNumber={pageNumber}
                maxPages={maxPages}
                zoom={zoom}
                onPrevPage={() => setPageNumber((page) => Math.max(1, page - 1))}
                onNextPage={() => setPageNumber((page) => Math.min(maxPages, page + 1))}
                onZoomOut={() => setZoom((value) => Math.max(50, value - 10))}
                onZoomIn={() => setZoom((value) => Math.min(200, value + 10))}
              />
            </div>
          )}
          {mobileTab === "summary" && (
            <SummaryPanel doc={doc} onAsk={() => setMobileTab("chat")} />
          )}
          {mobileTab === "chat" && (
            <ChatPanel
              messages={messages}
              chatLoading={chatLoading}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={handleSend}
              onQuickAction={handleQuickAction}
              bottomRef={bottomRef}
              mobile
            />
          )}
        </div>
      </section>
    </div>
  );
}

function DocumentColumn({
  doc,
  fileUrlWithControls,
  pageNumber,
  maxPages,
  zoom,
  onBack,
  onDownload,
  onShare,
  onPrevPage,
  onNextPage,
  onZoomOut,
  onZoomIn,
}: {
  doc: IDocument;
  fileUrlWithControls: string;
  pageNumber: number;
  maxPages: number;
  zoom: number;
  onBack: () => void;
  onDownload: () => void;
  onShare: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
}) {
  return (
    <div className="flex h-screen w-[55%] min-w-0 flex-col bg-[#050505]">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-[#08080a]/95 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-11 w-11 shrink-0 rounded-xl hover:bg-white/10"
          aria-label="Back to uploads"
        >
          <ArrowLeft className="h-5 w-5 text-zinc-300" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">
            {middleTruncate(doc.filename, 54)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onDownload}
          disabled={!doc.file_url}
          className="h-11 rounded-xl border-white/10 bg-white/[0.04] px-4 hover:bg-white/10"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          onClick={onShare}
          className="h-11 rounded-xl border-white/10 bg-white/[0.04] px-4 hover:bg-white/10"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </header>
      <div className="min-h-0 flex-1">
        <PdfSurface doc={doc} fileUrl={fileUrlWithControls} />
      </div>
      <PdfControls
        pageNumber={pageNumber}
        maxPages={maxPages}
        zoom={zoom}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        onZoomOut={onZoomOut}
        onZoomIn={onZoomIn}
      />
    </div>
  );
}

function PdfSurface({
  doc,
  fileUrl,
  compact = false,
}: {
  doc: IDocument;
  fileUrl: string;
  compact?: boolean;
}) {
  if (!doc.file_url) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#08080a] p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <FileText className="h-8 w-8 text-zinc-500" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-zinc-300">PDF preview not available</p>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            The document is fully indexed - use the chat to ask questions about it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full bg-[#08080a] p-4", compact && "p-0")}>
      <div className={cn("h-full overflow-hidden border border-white/10 bg-zinc-950", compact ? "border-x-0" : "rounded-2xl")}>
        <PDFViewer fileUrl={fileUrl} />
      </div>
    </div>
  );
}

function PdfControls({
  pageNumber,
  maxPages,
  zoom,
  onPrevPage,
  onNextPage,
  onZoomOut,
  onZoomIn,
}: {
  pageNumber: number;
  maxPages: number;
  zoom: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
}) {
  return (
    <div className="flex min-h-16 shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-[#08080a] px-3">
      <IconControl onClick={onPrevPage} disabled={pageNumber <= 1} label="Previous page">
        <ChevronLeft className="h-5 w-5" />
      </IconControl>
      <div className="min-w-[112px] text-center text-sm font-medium text-zinc-300">
        Page {pageNumber} of {maxPages}
      </div>
      <IconControl onClick={onNextPage} disabled={pageNumber >= maxPages} label="Next page">
        <ChevronRight className="h-5 w-5" />
      </IconControl>
      <div className="mx-2 h-7 w-px bg-white/10" />
      <IconControl onClick={onZoomOut} disabled={zoom <= 50} label="Zoom out">
        <ZoomOut className="h-5 w-5" />
      </IconControl>
      <span className="w-12 text-center text-xs text-zinc-500">{zoom}%</span>
      <IconControl onClick={onZoomIn} disabled={zoom >= 200} label="Zoom in">
        <ZoomIn className="h-5 w-5" />
      </IconControl>
    </div>
  );
}

function DesktopTabs({
  activeTab,
  onChange,
}: {
  activeTab: DesktopTab;
  onChange: (tab: DesktopTab) => void;
}) {
  return (
    <div className="flex h-16 shrink-0 items-end border-b border-white/10 px-6">
      {(["summary", "chat", "info"] as DesktopTab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "h-14 min-w-24 border-b-2 px-4 text-sm font-semibold capitalize transition-all duration-300",
            activeTab === tab
              ? "border-violet-400 text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-200"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function MobileHeader({
  doc,
  onBack,
  onDownload,
  onShare,
}: {
  doc: IDocument;
  onBack: () => void;
  onDownload: () => void;
  onShare: () => void;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 bg-[#08080a] px-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="h-11 w-11 rounded-xl hover:bg-white/10"
        aria-label="Back to uploads"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <p className="min-w-0 flex-1 text-sm font-semibold text-white">
        {middleTruncate(doc.filename, 34)}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-white/10">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-white/10 bg-[#121212]">
          <DropdownMenuItem onClick={onDownload} disabled={!doc.file_url}>
            <Download className="mr-2 h-4 w-4" /> Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function MobileTabs({
  activeTab,
  onChange,
}: {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
}) {
  return (
    <div className="grid h-12 shrink-0 grid-cols-3 border-b border-white/10 bg-[#08080a]">
      {(["document", "summary", "chat"] as MobileTab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "min-h-11 border-b-2 text-sm font-semibold capitalize transition-all duration-300",
            activeTab === tab
              ? "border-violet-400 text-white"
              : "border-transparent text-zinc-500"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function SummaryPanel({ doc, onAsk }: { doc: IDocument; onAsk: () => void }) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 p-5 md:p-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/10">
              <Sparkles className="h-5 w-5 text-violet-300" />
            </div>
            <h2 className="text-lg font-bold text-white">AI Summary</h2>
          </div>
          <p className="text-sm leading-7 text-zinc-300">
            {doc.summary || "Intelligence ingestion in progress. Summary will be available shortly."}
          </p>
        </section>

        {doc.key_topics && doc.key_topics.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300">Key topics</h3>
            <div className="flex flex-wrap gap-2">
              {doc.key_topics.map((topic, index) => (
                <Badge
                  key={`${topic}-${index}`}
                  variant="outline"
                  className={cn("rounded-full px-3 py-1.5 text-xs", topicColors[index % topicColors.length])}
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {doc.action_items && doc.action_items.length > 0 && (
          <section className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
            <div className="mb-3 flex items-center gap-2 text-amber-200">
              <ListChecks className="h-5 w-5" />
              <h3 className="font-semibold">Action items</h3>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-amber-100/80">
              {doc.action_items.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Button
          onClick={onAsk}
          className="h-12 w-full rounded-xl bg-violet-600 font-semibold text-white shadow-lg shadow-violet-950/30 hover:bg-violet-500"
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          Ask AI about this document
        </Button>
      </div>
    </ScrollArea>
  );
}

function ChatPanel({
  messages,
  chatLoading,
  inputValue,
  onInputChange,
  onSend,
  onQuickAction,
  bottomRef,
  mobile = false,
}: {
  messages: LocalMessage[];
  chatLoading: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onQuickAction: (label: string) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  mobile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 p-4 md:p-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]">
                <Brain className="h-8 w-8 text-violet-300" />
              </div>
              <p className="text-sm font-medium text-zinc-400">Ask anything about this document</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessageCard key={message.id} message={message} />
            ))
          )}
          <div ref={bottomRef} className="h-2" />
        </div>
      </ScrollArea>
      <div
        className={cn(
          "shrink-0 border-t border-white/10 bg-[#0b0b0d]/95 p-4 backdrop-blur-xl",
          mobile && "pb-[20px]"
        )}
      >
        <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => onQuickAction(action)}
              className="min-h-11 shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-zinc-300 transition-colors hover:border-violet-400/40 hover:bg-violet-400/10 hover:text-white"
            >
              {action}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#050505] p-2">
          <textarea
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="Ask about this document..."
            className="min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          <Button
            onClick={onSend}
            disabled={chatLoading || !inputValue.trim()}
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl bg-violet-600 text-white hover:bg-violet-500"
            aria-label="Send message"
          >
            {chatLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatMessageCard({ message }: { message: LocalMessage }) {
  const isUser = message.role === "user";

  if (message.isLoading) {
    return (
      <div className="flex justify-start">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-violet-300" />
          <span className="text-sm text-zinc-400">Thinking...</span>
        </div>
      </div>
    );
  }

  return (
    <article className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[88%] space-y-2", isUser ? "items-end" : "items-start")}>
        {!isUser && (
          <div className="flex flex-wrap items-center gap-2 px-1">
            <span className="text-sm font-semibold text-white">Askwiseo AI</span>
            <Badge variant="outline" className="border-violet-400/20 bg-violet-400/10 text-[10px] text-violet-200">
              Powered by Gemini
            </Badge>
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-6 shadow-xl",
            isUser
              ? "bg-violet-600 text-white"
              : "border border-white/10 bg-white/[0.04] text-zinc-200"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="chat-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.sources.map((source, index) => (
              <span
                key={`${source.document_id}-${source.chunk_index}-${index}`}
                className="inline-flex max-w-[220px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-zinc-400"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-violet-300" />
                <span className="truncate">{source.filename}</span>
                <span className="shrink-0 text-zinc-600">{formatScore(source.score)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function InfoPanel({
  doc,
  deleting,
  onDelete,
}: {
  doc: IDocument;
  deleting: boolean;
  onDelete: () => void;
}) {
  const infoRows = [
    { label: "Filename", value: doc.filename, icon: FileText },
    { label: "File size", value: formatFileSize(doc.file_size_bytes), icon: HardDrive },
    { label: "Page count", value: `${doc.page_count} pages`, icon: Layers },
    { label: "Knowledge chunks", value: `${doc.chunk_count} knowledge chunks indexed`, icon: Sparkles },
    {
      label: "Upload date",
      value: `Uploaded ${formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}`,
      icon: Calendar,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-5 md:p-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">Document info</h2>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                Ready
              </Badge>
            </div>
            <div className="space-y-4">
              {infoRows.map((row) => (
                <div key={row.label} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#050505]">
                    <row.icon className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">{row.label}</p>
                    <p className="break-words text-sm font-medium text-zinc-200">{row.value}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#050505]">
                  <Tag className="h-5 w-5 text-zinc-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Document type</p>
                  <Badge variant="outline" className="mt-1 border-violet-400/20 bg-violet-400/10 text-violet-200">
                    {doc.document_type || "PDF"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="border-t border-white/10 p-5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="h-12 w-full rounded-xl bg-red-600 text-white hover:bg-red-500">
              <Trash2 className="mr-2 h-5 w-5" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-white/10 bg-[#121212] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this document?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                This permanently removes the file, indexed chunks, and chat context for "{doc.filename}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                disabled={deleting}
                className="bg-red-600 text-white hover:bg-red-500"
              >
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete document
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function IconControl({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="h-11 w-11 rounded-xl text-zinc-300 hover:bg-white/10"
      aria-label={label}
    >
      {children}
    </Button>
  );
}

function middleTruncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const keep = Math.max(8, Math.floor((maxLength - 3) / 2));
  return `${value.slice(0, keep)}...${value.slice(-keep)}`;
}

function formatScore(score: number) {
  if (typeof score !== "number" || Number.isNaN(score)) return "";
  return `${Math.round(score * 100)}%`;
}

"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, Loader2, FileText, Calendar, 
  Layers, HardDrive, Tag, MessageSquare, Info, Sparkles
} from "lucide-react";

import { getDocument, formatFileSize, Document as IDocument } from "@/lib/api";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// Dynamically import the isolated PDF viewer to avoid SSR/initialization issues
const PDFViewer = dynamic(() => import("@/components/chat/pdf-viewer"), { 
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center h-full gap-4 bg-zinc-950/20">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground">Initializing PDF engine...</p>
    </div>
  )
});

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-[#050505]">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full" />
          <Loader2 className="w-16 h-16 animate-spin text-violet-500 relative" />
        </div>
        <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Opening Document Node...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 p-6 text-center bg-[#050505]">
        <div className="w-24 h-24 rounded-[2.5rem] bg-[#121212] border border-white/5 flex items-center justify-center shadow-premium-glow">
          <FileText className="w-10 h-10 text-zinc-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-sans">Document Offline</h1>
          <p className="text-zinc-500 max-w-sm font-inter">{error || "The requested intelligence asset could not be located."}</p>
        </div>
        <Button onClick={() => router.push("/uploads")} variant="outline" className="rounded-2xl h-12 px-8 border-white/10 bg-white/5">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Repository
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#050505] overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5" onClick={() => router.push("/uploads")}>
            <ArrowLeft className="w-4 h-4 text-zinc-400" />
          </Button>
          <div className="h-6 w-px bg-white/5" />
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
               <FileText className="w-4 h-4 text-violet-400" />
             </div>
             <h1 className="text-sm font-bold text-white font-sans truncate max-w-[400px]">
               {doc.filename}
             </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] uppercase tracking-widest text-zinc-500 px-3 py-1">
             AI INDEXED • {doc.status}
           </Badge>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: PDF Viewer */}
        <div className="flex-1 flex flex-col bg-[#050505] relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--accent-primary)_0%,_transparent_70%)]" />
          <div className="relative flex-1 m-4 rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl">
            <PDFViewer fileUrl={doc.file_url!} />
          </div>
        </div>

        {/* Right Column: Insights & Chat */}
        <div className="w-[450px] flex flex-col border-l border-white/5 bg-[#121212]/50 backdrop-blur-3xl z-10">
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-10">
              {/* Core Intel Section */}
              <section className="space-y-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em]">Primary Asset</span>
                     <div className="h-px flex-1 bg-violet-500/10" />
                   </div>
                   <h2 className="text-2xl font-bold text-white font-sans leading-tight">{doc.filename}</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Pages", value: doc.page_count, icon: Layers },
                    { label: "Volume", value: formatFileSize(doc.file_size_bytes), icon: HardDrive },
                    { label: "Indexed", value: format(new Date(doc.created_at), "MMM d, yy"), icon: Calendar },
                    { label: "Type", value: doc.document_type || "PDF", icon: Tag },
                  ].map((meta, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                      <meta.icon className="w-4 h-4 text-zinc-500" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">{meta.label}</p>
                        <p className="text-xs font-bold text-zinc-300 truncate">{meta.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* AI Strategic Summary */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans">Executive Summary</h3>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-px bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-2xl blur-sm" />
                  <div className="relative bg-[#050505]/60 border border-white/10 rounded-2xl p-5 shadow-xl">
                    <p className="text-sm leading-relaxed text-zinc-400 font-inter">
                      {doc.summary || "Intelligence ingestion in progress. Summary will be available shortly."}
                    </p>
                  </div>
                </div>
              </section>

              {/* Cognitive Themes */}
              {doc.key_topics && doc.key_topics.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest font-sans">Identified Themes</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doc.key_topics.map((topic, i) => (
                      <Badge key={i} variant="outline" className="bg-white/5 border-white/5 text-zinc-500 text-[11px] font-medium py-1 px-4 rounded-full hover:bg-white/10 hover:text-white transition-all cursor-default">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Interactive Neural Query */}
              <section className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-bold text-white font-sans">Asset Intelligence</h3>
                  </div>
                  {chatLoading && <Loader2 className="w-4 h-4 animate-spin text-violet-500" />}
                </div>
                
                <div className="space-y-6 pb-32">
                  {messages.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center px-6 rounded-3xl bg-white/[0.02] border border-dashed border-white/5">
                      <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-white/5 flex items-center justify-center mb-4">
                        <Info className="w-6 h-6 text-zinc-800" />
                      </div>
                      <p className="text-sm text-zinc-500 font-inter">
                        Question the data. Extract specific details or request deep-dives.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <MessageBubble 
                        key={m.id} 
                        message={m} 
                        onCopy={(text) => {
                          navigator.clipboard.writeText(text);
                          toast.success("Intelligence Copied");
                        }}
                        onShare={() => toast.info("Coming soon")}
                        onThumbsUp={() => {}}
                        onThumbsDown={() => {}}
                        onRegenerate={() => sendMessage(m.content)}
                      />
                    ))
                  )}
                  <div ref={bottomRef} className="h-4" />
                </div>
              </section>
            </div>
          </ScrollArea>

          {/* Persistent Neural Input */}
          <div className="p-4 border-t border-white/5 bg-[#050505]/40 backdrop-blur-xl">
            <ChatInput 
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              loading={chatLoading}
              onQuickAction={(text) => sendMessage(text)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

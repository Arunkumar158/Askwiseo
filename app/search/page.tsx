"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, BookOpen, Star, Clock, Tag, Loader2, FileText, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/upgrade-modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SearchPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const { messages, loading, sendMessage, loadHistory } = useChat(selectedDocId);
  const { documents } = useDocuments();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { plan, canAskQuestion } = usePlan();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadHistory(); }, [loadHistory, selectedDocId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;
    if (!canAskQuestion && plan) {
      setShowUpgradeModal(true);
      return;
    }
    if (!text) setInput("");
    await sendMessage(messageText);
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMessage) {
      handleSend(lastUserMessage.content);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleThumbsUp = () => {
    toast.success("Thanks for your feedback!");
  };

  const handleThumbsDown = () => {
    toast.info("We will improve this answer.");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Documents */}
        <div className="hidden lg:flex w-80 flex-col border-r border-white/5 bg-[#121212]/50 backdrop-blur-xl">
          <div className="p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 font-sans">Knowledge Base</h2>
            <div className="space-y-1">
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                  !selectedDocId 
                    ? "bg-white/[0.05] text-white border border-white/10" 
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                )}
                onClick={() => setSelectedDocId(undefined)}
              >
                <BookOpen className={cn("h-4 w-4", !selectedDocId ? "text-violet-400" : "text-zinc-500")} />
                <span className="text-sm font-medium">All Documents</span>
              </button>
              
              <div className="pt-4 pb-2">
                <div className="h-px bg-white/5 w-full" />
              </div>

              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-1 pr-3">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                        selectedDocId === doc.id 
                          ? "bg-white/[0.05] text-white border border-white/10" 
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                      )}
                      onClick={() => setSelectedDocId(doc.id)}
                    >
                      <FileText className={cn("h-4 w-4 shrink-0", selectedDocId === doc.id ? "text-violet-400" : "text-zinc-500")} />
                      <span className="text-sm font-medium truncate text-left">{doc.filename}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <div className="mt-auto p-6 border-t border-white/5">
             <Button 
               variant="outline" 
               className="w-full justify-start gap-2 border-dashed border-white/10 hover:bg-white/5"
               onClick={() => router.push("/uploads")}
             >
               <Upload className="h-4 w-4" />
               <span>Add more data</span>
             </Button>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col relative bg-[#050505]">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
              <h1 className="text-sm font-semibold text-zinc-200 font-sans truncate max-w-md">
                {selectedDocId
                  ? documents.find(d => d.id === selectedDocId)?.filename
                  : "Global Intelligence Mode"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="bg-white/5 border-white/10 text-zinc-400 text-[10px] uppercase tracking-wider">
                 v2.5 AI Model
               </Badge>
            </div>
          </header>

          {/* Messages Area */}
          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="w-20 h-20 rounded-3xl bg-[#121212] border border-white/5 flex items-center justify-center mb-6 shadow-premium-glow">
                    <FileText className="h-10 w-10 text-violet-400 opacity-50" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 font-sans">No knowledge detected</h2>
                  <p className="text-zinc-500 max-w-sm mb-8">Upload your business documents first, then I'll be ready to provide insights and answers.</p>
                  <Button 
                    onClick={() => router.push("/uploads")} 
                    className="rounded-full px-8 h-12 bg-violet-600 hover:bg-violet-500 shadow-premium-glow transition-all"
                  >
                    Get Started
                  </Button>
                </div>
              ) : messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="w-20 h-20 rounded-3xl bg-[#121212] border border-white/5 flex items-center justify-center mb-6 shadow-premium-glow animate-float">
                    <Sparkles className="h-10 w-10 text-violet-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3 font-sans tracking-tight">How can I assist you?</h2>
                  <p className="text-zinc-500 max-w-md text-lg font-inter">
                    {selectedDocId 
                      ? "I've analyzed this document. Ask me anything about its contents, data, or action items." 
                      : "I'm connected to your entire knowledge base. Ask a cross-document question or get a summary."}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-12 w-full max-w-2xl">
                    {[
                      "Summarize the key findings",
                      "Extract all important dates",
                      "What are the main risks mentioned?",
                      "Find specific financial figures"
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(suggestion)}
                        className="p-4 text-left rounded-2xl bg-[#121212] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.02] transition-all group"
                      >
                        <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{suggestion}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-8 pb-32">
                {messages.map((msg, index) => (
                  <MessageBubble 
                    key={msg.id} 
                    message={msg}
                    isLastMessage={index === messages.length - 1}
                    onCopy={handleCopy}
                    onShare={handleShare}
                    onThumbsUp={handleThumbsUp}
                    onThumbsDown={handleThumbsDown}
                    onRegenerate={handleRegenerate}
                  />
                ))}
                <div ref={bottomRef} className="h-4" />
              </div>
            </div>
          </ScrollArea>

          {/* Sticky Input Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-12 pb-6 px-4 z-20">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={() => handleSend()}
                loading={loading}
                onQuickAction={(text) => handleSend(text)}
              />
              <p className="text-center text-[10px] text-zinc-600 mt-4 font-mono">
                Askwiseo can make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="question_limit"
      />
    </div>
  );
}
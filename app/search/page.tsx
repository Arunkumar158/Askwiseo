"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, BookOpen, Star, Clock, Tag, Send, Loader2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";
import ReactMarkdown from "react-markdown";

export default function SearchPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const { messages, loading, sendMessage, loadHistory } = useChat(selectedDocId);
  const { documents } = useDocuments();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadHistory(); }, [loadHistory]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const q = input;
    setInput("");
    await sendMessage(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <Card className="h-[calc(100vh-6rem)]">
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div
                    className={`flex items-center space-x-2 text-sm cursor-pointer hover:text-primary p-2 rounded-lg ${!selectedDocId ? "bg-muted text-primary" : ""}`}
                    onClick={() => setSelectedDocId(undefined)}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>All Documents</span>
                  </div>
                  <Separator />
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center space-x-2 text-sm cursor-pointer hover:text-primary p-2 rounded-lg ${selectedDocId === doc.id ? "bg-muted text-primary" : ""}`}
                      onClick={() => setSelectedDocId(doc.id)}
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{doc.filename}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main chat area */}
          <div className="lg:col-span-9 flex flex-col h-[calc(100vh-6rem)]">
            <Card className="flex flex-col flex-1 overflow-hidden">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base">
                  {selectedDocId
                    ? `Chatting with: ${documents.find(d => d.id === selectedDocId)?.filename}`
                    : "Ask anything across all your documents"}
                </CardTitle>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                    <FileText className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-lg font-medium">No documents uploaded yet</p>
                    <p className="text-sm mt-1 mb-4">Upload PDFs first, then ask questions here</p>
                    <Button onClick={() => router.push("/uploads")}>Upload PDFs</Button>
                  </div>
                ) : messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                    <Search className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Ask anything about your documents</p>
                    <p className="text-sm mt-1">Upload PDFs from the uploads page, then ask questions here</p>
                  </div>
                )}
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}>
                        {msg.isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        ) : msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-xs text-muted-foreground font-medium mb-2">Sources:</p>
                                <div className="space-y-1">
                                  {msg.sources.map((src, i) => (
                                    <div key={i} className="text-xs text-muted-foreground bg-background rounded p-2">
                                      <span className="font-medium">{src.filename}</span>
                                      <span className="ml-2 opacity-60">score: {src.score}</span>
                                      <p className="mt-1 opacity-75 line-clamp-2">{src.excerpt}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask anything about your documents..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={loading || !input.trim()}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Press Enter to send</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns";
import { 
  Copy, 
  Check, 
  Share2, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw, 
  FileText,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { ChatSource } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  timestamp: string;
  isLoading?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onCopy: (text: string) => void;
  onShare: () => void;
  onThumbsUp: (id: string) => void;
  onThumbsDown: (id: string) => void;
  onRegenerate: () => void;
  isLastMessage?: boolean;
}

export function MessageBubble({
  message,
  onCopy,
  onShare,
  onThumbsUp,
  onThumbsDown,
  onRegenerate,
  isLastMessage
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThumbsUp = () => {
    onThumbsUp(message.id);
    setVoted("up");
  };

  const handleThumbsDown = () => {
    onThumbsDown(message.id);
    setVoted("down");
  };

  if (message.isLoading) {
    return (
      <div className="flex justify-start mb-6">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex gap-1.5 items-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce-dot" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce-dot [animation-delay:0.1s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce-dot [animation-delay:0.2s]" />
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "group relative flex flex-col max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Assistant Header */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 px-1 w-full justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
                <SparklesIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-white/90">Askwiseo AI</span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-zinc-800 border border-white/5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              Powered by Gemini
            </div>
          </div>
        )}

        {/* Message Bubble/Card */}
        <div className={cn(
          "rounded-3xl px-5 py-4 shadow-xl transition-all duration-300",
          isUser 
            ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-[0_10px_30px_rgba(139,92,246,0.2)]" 
            : "bg-[#121212]/80 backdrop-blur-xl border border-white/5 text-zinc-200"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed text-base font-inter">{message.content}</p>
          ) : (
            <div className="chat-markdown font-inter text-base">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/[0.05]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">Verified Sources</p>
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  {message.sources.map((src, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-400 hover:bg-white/[0.08] hover:text-white cursor-help transition-all">
                          <FileText className="w-3.5 h-3.5 text-violet-400" />
                          <span className="max-w-[150px] truncate font-medium">{src.filename}</span>
                          <span className="text-[9px] opacity-40 font-mono">p.{src.page_number || i+1}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-sm bg-[#121212] border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                        <p className="text-xs leading-relaxed text-zinc-300 italic">"{src.excerpt}"</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>

        {/* Footer info & Actions */}
        <div className={cn(
          "mt-2 flex items-center gap-3 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="text-[10px] text-zinc-600 font-medium">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
          
          {!isUser && (
            <div className="flex items-center gap-1">
              <ActionButton 
                icon={copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />} 
                onClick={handleCopy} 
                tooltip="Copy message"
              />
              <ActionButton 
                icon={<Share2 className="w-3.5 h-3.5" />} 
                onClick={onShare} 
                tooltip="Share chat"
              />
              <ActionButton 
                icon={<ThumbsUp className={cn("w-3.5 h-3.5", voted === "up" && "text-green-500 fill-green-500/20")} />} 
                onClick={handleThumbsUp} 
                tooltip="Helpful"
              />
              <ActionButton 
                icon={<ThumbsDown className={cn("w-3.5 h-3.5", voted === "down" && "text-red-500 fill-red-500/20")} />} 
                onClick={handleThumbsDown} 
                tooltip="Not helpful"
              />
              {isLastMessage && (
                <ActionButton 
                  icon={<RotateCcw className="w-3.5 h-3.5" />} 
                  onClick={onRegenerate} 
                  tooltip="Regenerate"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, onClick, tooltip }: { icon: React.ReactNode, onClick: () => void, tooltip: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-7 h-7 h-7 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            onClick={onClick}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[10px] py-1 px-2 bg-zinc-900 border-zinc-800">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
      <path d="M5 3l1 1" />
      <path d="M19 3l-1 1" />
      <path d="M19 19l-1-1" />
      <path d="M5 19l1-1" />
    </svg>
  );
}

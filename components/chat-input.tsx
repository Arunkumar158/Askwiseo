"use client";

import * as React from "react";
import { Send, Loader2, Paperclip, Sparkles, Wand2, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  placeholder?: string;
  onUploadClick?: () => void;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  loading,
  placeholder = "Ask anything about your documents...",
  onUploadClick,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  React.useEffect(() => {
    autoResize();
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex flex-col w-full bg-background/95 backdrop-blur-xl border-t border-white/10 transition-all duration-300 focus-within:bg-background",
          loading && "opacity-80 pointer-events-none"
        )}
      >
        {/* Input Area */}
        <div className="flex items-end gap-3 px-4 py-4 md:px-6">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-500 resize-none py-2 text-base md:text-lg min-h-[44px] max-h-[200px] outline-none transition-all"
          />
          
          <div className="pb-1">
            <Button
              onClick={onSend}
              disabled={loading || !value.trim()}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full transition-all duration-300",
                value.trim() 
                  ? "bg-gradient-to-tr from-primary to-purple-400 hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                  : "bg-zinc-800 text-zinc-500"
              )}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Send className={cn("h-5 w-5", value.trim() ? "text-white" : "text-zinc-500")} />
              )}
            </Button>
          </div>
        </div>

        {/* AI Actions Row */}
        <div className="flex items-center gap-2 px-4 pb-4 md:px-6 overflow-x-auto no-scrollbar">
          <button
            onClick={onUploadClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-zinc-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Upload
          </button>
          
          <button
            onClick={() => onChange("Summarize this document")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-zinc-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Summarize
          </button>

          <button
            onClick={() => onChange("Find key insights")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-zinc-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Key Insights
          </button>

          <button
            onClick={() => onChange("Analyze document structure")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-zinc-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
          >
            <Search className="h-3.5 w-3.5" />
            Analyze
          </button>
        </div>

        {/* Bottom Helper text */}
        <div className="px-6 py-2 bg-white/[0.02] border-t border-white/[0.05] flex justify-between items-center">
           <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
             ENTER TO SEND • SHIFT + ENTER FOR NEW LINE
           </span>
           <div className="flex items-center gap-1">
             <div className="h-1.2 w-1.2 rounded-full bg-green-500/50" />
             <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Askwiseo AI Engine</span>
           </div>
        </div>
      </div>
    </div>

  );
}

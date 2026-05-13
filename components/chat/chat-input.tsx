"use client";

import React, { useRef, useEffect, useState } from "react";
import { 
  Send, 
  Loader2, 
  Sparkles, 
  Wand2, 
  Search, 
  X,
  Keyboard,
  MousePointerClick,
  FileSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  loading?: boolean;
  onQuickAction?: (text: string) => void;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  loading,
  onQuickAction
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading && !disabled) {
        onSend();
      }
    }
  };

  const quickActions = [
    { label: "Summarize", icon: <Sparkles className="w-3 h-3" />, text: "Summarize this document" },
    { label: "Key Insights", icon: <Wand2 className="w-3 h-3" />, text: "What are the key insights?" },
    { label: "Find action items", icon: <MousePointerClick className="w-3 h-3" />, text: "Identify all action items" },
    { label: "Compare documents", icon: <FileSearch className="w-3 h-3" />, text: "Compare these documents" },
  ];

  const handleQuickAction = (text: string) => {
    if (onQuickAction) {
      onQuickAction(text);
    } else {
      onChange(text);
    }
  };

  return (
    <div className="w-full bg-[#121212]/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-2 md:p-3 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Input Container */}
        <div className={cn(
          "relative group flex items-end gap-2 px-4 py-3",
          loading && "opacity-70 pointer-events-none"
        )}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-500 resize-none py-2 text-base min-h-[44px] max-h-[180px] outline-none transition-all scrollbar-hide font-inter"
          />

          <div className="flex items-center gap-2 mb-1">
             <div className="text-[10px] text-zinc-600 font-mono hidden md:block">
               {value.length}
             </div>
             
             <Button
               onClick={onSend}
               disabled={loading || !value.trim() || disabled}
               size="icon"
               className={cn(
                 "h-10 w-10 rounded-full transition-all duration-300",
                 value.trim() 
                   ? "bg-gradient-to-tr from-violet-500 to-indigo-600 text-white shadow-premium-glow hover:scale-110 active:scale-95" 
                   : "bg-zinc-800 text-zinc-500"
               )}
             >
               {loading ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <Send className="h-4 w-4" />
               )}
             </Button>
          </div>
        </div>

        {/* Quick Actions & Hints */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleQuickAction(action.text)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-zinc-500 text-[10px] font-medium hover:bg-white/[0.08] hover:text-zinc-200 transition-all whitespace-nowrap"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
          
          <div className="hidden md:flex items-center gap-1.5 opacity-20">
            <Keyboard className="w-3 h-3 text-zinc-400" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
              Return
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

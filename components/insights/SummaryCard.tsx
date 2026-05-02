"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ChevronDown, ChevronUp, ExternalLink, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface SummaryCardProps {
  title: string
  date: string
  summary: string
  confidence: number
}

export function SummaryCard({ title, date, summary, confidence }: SummaryCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="group flex flex-col p-4 border-border/40 bg-card/40 hover:bg-card/60 transition-colors duration-200 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-base truncate pr-2">{title}</h4>
            <Badge variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-xs shrink-0 flex items-center gap-1 border-primary/20">
              <Sparkles className="h-3 w-3 text-primary" />
              {confidence}% Match
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Uploaded {date}</p>
          
          <div className={cn(
            "text-sm text-foreground/80 leading-relaxed overflow-hidden transition-all duration-300",
            expanded ? "max-h-[500px]" : "max-h-11 line-clamp-2"
          )}>
            {summary}
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <><ChevronUp className="h-3 w-3 mr-1" /> Show Less</>
              ) : (
                <><ChevronDown className="h-3 w-3 mr-1" /> Read Full Summary</>
              )}
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground border-primary/20 transition-colors">
              <ExternalLink className="h-3 w-3" />
              View Doc
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Search, 
  Upload, 
  Send, 
  Pin, 
  Download, 
  FileText, 
  ChevronRight, 
  Sparkles,
  MessageSquare,
  File,
  BookOpen,
  Plus,
  Bot,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Dummy data for PDFs
const pdfs = [
  {
    id: 1,
    title: "Q4 Financial Report 2023",
    preview: "Revenue increased by 23% compared to the previous quarter...",
    date: "2023-12-15",
    pages: 42
  },
  {
    id: 2,
    title: "Product Roadmap 2024",
    preview: "Key initiatives for the upcoming year include...",
    date: "2023-11-28",
    pages: 18
  },
  {
    id: 3,
    title: "Customer Feedback Analysis",
    preview: "Based on 500+ customer surveys, the main pain points are...",
    date: "2023-12-05",
    pages: 35
  },
  {
    id: 4,
    title: "Competitor Analysis - Tech Industry",
    preview: "Our main competitors have recently launched...",
    date: "2023-12-10",
    pages: 27
  },
  {
    id: 5,
    title: "Employee Handbook 2024",
    preview: "Updated policies regarding remote work and...",
    date: "2023-12-20",
    pages: 56
  }
]

// Dummy data for previous questions and answers
const previousInsights = [
  {
    id: 1,
    question: "What were the key revenue drivers in Q4?",
    answer: "According to the Q4 Financial Report, the key revenue drivers were increased subscription renewals (up 35%), expansion into new markets (contributing 18% of new revenue), and the launch of our premium tier which saw 42% adoption among existing customers.",
    sources: [
      {
        id: 1,
        title: "Q4 Financial Report 2023",
        page: 12,
        excerpt: "Subscription renewals increased by 35% compared to Q3, with a 92% retention rate across all customer segments."
      },
      {
        id: 1,
        title: "Q4 Financial Report 2023",
        page: 15,
        excerpt: "The premium tier launch in October contributed 42% adoption among existing customers, generating $2.3M in additional revenue."
      }
    ],
    followUpQuestions: [
      "How does this compare to Q3?",
      "What was the customer satisfaction rate for the premium tier?",
      "Which markets showed the highest growth?"
    ],
    date: "2023-12-16"
  },
  {
    id: 2,
    question: "What are the main product initiatives planned for 2024?",
    answer: "The Product Roadmap outlines three major initiatives for 2024: 1) AI-powered document analysis with real-time insights, 2) Enhanced collaboration features with version control and commenting, and 3) Integration with major CRM and project management platforms. The roadmap indicates these features will be rolled out in phases throughout the year.",
    sources: [
      {
        id: 2,
        title: "Product Roadmap 2024",
        page: 5,
        excerpt: "Q1 2024: Launch of AI-powered document analysis with real-time insights generation and smart summarization."
      },
      {
        id: 2,
        title: "Product Roadmap 2024",
        page: 8,
        excerpt: "Q2-Q3 2024: Enhanced collaboration features including version control, commenting, and real-time editing capabilities."
      }
    ],
    followUpQuestions: [
      "When will the AI features be available in beta?",
      "Which CRM platforms will be supported first?",
      "Will there be additional pricing tiers for these new features?"
    ],
    date: "2023-12-17"
  }
]

export default function InsightsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentInsight, setCurrentInsight] = useState<typeof previousInsights[0] | null>(null)
  const [showNewQuestionButton, setShowNewQuestionButton] = useState(false)
  const [viewMode, setViewMode] = useState<"chat" | "document">("chat")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const questionInputRef = useRef<HTMLTextAreaElement>(null)

  // Filter PDFs based on search query
  const filteredPdfs = pdfs.filter(pdf => 
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pdf.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle question submission
  const handleSubmitQuestion = () => {
    if (!question.trim()) return
    
    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      // For demo purposes, just use the first insight as a template
      const newInsight = {
        ...previousInsights[0],
        id: Date.now(),
        question,
        date: new Date().toISOString().split('T')[0]
      }
      
      setCurrentInsight(newInsight)
      setQuestion("")
      setIsLoading(false)
      
      // Scroll to the answer
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth"
        })
      }, 100)
    }, 2000)
  }

  // Handle key press for question submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitQuestion()
    }
  }

  // Handle scroll to show/hide new question button
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
        setShowNewQuestionButton(scrollTop > 300)
      }
    }

    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll)
      return () => chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Focus input on new question button click
  const handleNewQuestionClick = () => {
    questionInputRef.current?.focus()
    questionInputRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Handle file upload
  const handleFileUpload = () => {
    toast.success("PDF uploaded successfully!")
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Sidebar - PDF Navigator */}
      <div className="w-80 border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredPdfs.map((pdf) => (
              <div 
                key={pdf.id} 
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{pdf.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pdf.preview}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{pdf.date}</span>
                      <span>•</span>
                      <span>{pdf.pages} pages</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <Button className="w-full gap-2" onClick={handleFileUpload}>
            <Upload className="h-4 w-4" />
            Upload PDF
          </Button>
        </div>
      </div>
      
      {/* Right Main Panel - AI Insight Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === "chat" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("chat")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat View
            </Button>
            <Button 
              variant={viewMode === "document" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("document")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Document View
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              <Bot className="h-3 w-3 mr-1" />
              Powered by GPT-4
            </Badge>
          </div>
        </div>
        
        {/* Chat Area */}
        <ScrollArea ref={chatContainerRef} className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {previousInsights.map((insight) => (
              <div key={insight.id} className="space-y-4">
                {/* Question */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                    <p className="font-medium">{insight.question}</p>
                  </div>
                </div>
                
                {/* Answer */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </Avatar>
                  <div className="bg-primary/5 p-3 rounded-2xl rounded-tl-none">
                    <p>{insight.answer}</p>
                  </div>
                </div>
                
                {/* Sources */}
                <div className="ml-11 space-y-2">
                  <h4 className="text-sm font-medium">Sources:</h4>
                  <div className="space-y-2">
                    {insight.sources.map((source, index) => (
                      <div key={index} className="p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{source.title}</span>
                          <Badge variant="outline" className="ml-auto">Page {source.page}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{source.excerpt}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Follow-up Questions */}
                <div className="ml-11 space-y-2">
                  <h4 className="text-sm font-medium">Follow-up questions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {insight.followUpQuestions.map((q, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => setQuestion(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-6" />
              </div>
            ))}
            
            {/* Current Question/Answer (if any) */}
            {currentInsight && (
              <div className="space-y-4">
                {/* Question */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                    <p className="font-medium">{currentInsight.question}</p>
                  </div>
                </div>
                
                {/* Answer */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </Avatar>
                  <div className="bg-primary/5 p-3 rounded-2xl rounded-tl-none">
                    <p>{currentInsight.answer}</p>
                  </div>
                </div>
                
                {/* Sources */}
                <div className="ml-11 space-y-2">
                  <h4 className="text-sm font-medium">Sources:</h4>
                  <div className="space-y-2">
                    {currentInsight.sources.map((source, index) => (
                      <div key={index} className="p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{source.title}</span>
                          <Badge variant="outline" className="ml-auto">Page {source.page}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{source.excerpt}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Follow-up Questions */}
                <div className="ml-11 space-y-2">
                  <h4 className="text-sm font-medium">Follow-up questions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentInsight.followUpQuestions.map((q, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => setQuestion(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </Avatar>
                <div className="bg-primary/5 p-3 rounded-2xl rounded-tl-none">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>Generating answer...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Question Input */}
        <div className="p-4 border-t">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={questionInputRef}
                placeholder="Ask anything about your documents..."
                className="pr-12 min-h-[60px] resize-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <Button 
                size="icon" 
                className="absolute right-2 bottom-2"
                onClick={handleSubmitQuestion}
                disabled={!question.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating New Question Button */}
        {showNewQuestionButton && (
          <Button 
            className="fixed bottom-24 right-8 rounded-full shadow-lg gap-2"
            onClick={handleNewQuestionClick}
          >
            <Plus className="h-4 w-4" />
            New Question
          </Button>
        )}
      </div>
    </div>
  )
} 
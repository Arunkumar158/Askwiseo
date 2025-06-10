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
  Loader2,
  Menu
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
  const [selectedPdf, setSelectedPdf] = useState<typeof pdfs[0] | null>(null)
  const [chatHistory, setChatHistory] = useState<typeof previousInsights>(previousInsights)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const questionInputRef = useRef<HTMLTextAreaElement>(null)

  // Filter PDFs based on search query
  const filteredPdfs = pdfs.filter(pdf => 
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pdf.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle PDF selection
  const handlePdfSelect = (pdf: typeof pdfs[0]) => {
    setSelectedPdf(pdf)
    setViewMode("document")
  }

  // Handle follow-up question click
  const handleFollowUpClick = (followUpQuestion: string) => {
    setQuestion(followUpQuestion)
    questionInputRef.current?.focus()
  }

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
      
      setChatHistory(prev => [...prev, newInsight])
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Left Sidebar - PDF List */}
        <div className={cn(
          "fixed md:static inset-0 z-40 w-full md:w-80 border-r bg-background transform transition-transform duration-200 ease-in-out",
          !isSidebarOpen && "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PDFs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-4 space-y-4">
              {filteredPdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors",
                    selectedPdf?.id === pdf.id && "bg-accent"
                  )}
                  onClick={() => {
                    handlePdfSelect(pdf)
                    setIsSidebarOpen(false)
                  }}
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{pdf.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{pdf.preview}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {pdf.pages} pages
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {pdf.date}
                      </span>
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

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Right Main Panel - AI Insight Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant={viewMode === "chat" ? "default" : "ghost"} 
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => setViewMode("chat")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat View
              </Button>
              <Button 
                variant={viewMode === "document" ? "default" : "ghost"} 
                size="sm"
                className="flex-1 sm:flex-none"
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
          <div className="flex-1 overflow-hidden">
            {viewMode === "chat" ? (
              <div className="flex flex-col h-full">
                <ScrollArea ref={chatContainerRef} className="flex-1 p-4">
                  <div className="space-y-6">
                    {chatHistory.map((insight) => (
                      <div key={insight.id} className="space-y-4">
                        {/* Question */}
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <p className="font-medium">You</p>
                            <p className="text-sm">{insight.question}</p>
                          </div>
                        </div>
                        
                        {/* Answer */}
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/bot-avatar.png" />
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <p className="font-medium">AI Assistant</p>
                            <p className="text-sm">{insight.answer}</p>
                            
                            {/* Sources */}
                            {insight.sources && (
                              <div className="mt-4 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                                {insight.sources.map((source, index) => (
                                  <div key={index} className="text-xs bg-muted p-2 rounded">
                                    <p className="font-medium">{source.title} (Page {source.page})</p>
                                    <p className="text-muted-foreground mt-1">{source.excerpt}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Follow-up Questions */}
                            {insight.followUpQuestions && (
                              <div className="mt-4 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Follow-up Questions:</p>
                                <div className="flex flex-wrap gap-2">
                                  {insight.followUpQuestions.map((followUp, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() => handleFollowUpClick(followUp)}
                                    >
                                      {followUp}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading State */}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/bot-avatar.png" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">AI Assistant</p>
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <p className="text-sm">Thinking...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Question Input */}
                <div className="p-4 border-t">
                  <div className="relative">
                    <Textarea
                      ref={questionInputRef}
                      placeholder="Ask a question about your documents..."
                      className="pr-12 resize-none"
                      rows={3}
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
            ) : (
              <div className="p-4">
                {selectedPdf ? (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">{selectedPdf.title}</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{selectedPdf.pages} pages</Badge>
                      <span className="text-sm text-muted-foreground">{selectedPdf.date}</span>
                    </div>
                    <p className="text-muted-foreground">{selectedPdf.preview}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Select a document to view</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Choose a document from the sidebar to view its contents
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
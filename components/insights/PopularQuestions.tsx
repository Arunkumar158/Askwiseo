import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, TrendingUp, TrendingDown, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const questions = [
  {
    id: "1",
    question: "What is our Q4 revenue target?",
    searches: 124,
    trend: "up",
    docs: 3,
    answer: "Based on the Q3 Financial Summary and Q4 Projections, the revenue target for Q4 is $4.2M."
  },
  {
    id: "2",
    question: "What is the new remote work policy?",
    searches: 98,
    trend: "up",
    docs: 1,
    answer: "Employees can work remotely up to 3 days a week, pending manager approval, according to the updated 2024 Employee Handbook."
  },
  {
    id: "3",
    question: "Who is the lead on the Alpha Project?",
    searches: 45,
    trend: "down",
    docs: 2,
    answer: "Sarah Jenkins is listed as the primary lead for the Alpha Project in the Q1 Planning Document."
  }
]

export function PopularQuestions() {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          Most Searched Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {questions.map((q) => (
            <AccordionItem key={q.id} value={q.id} className="border-border/40">
              <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-2 rounded-md transition-colors text-sm text-left gap-3">
                <span className="flex-1 font-medium">{q.question}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center">
                    {q.searches}
                    {q.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 ml-1 text-rose-500" />
                    )}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pt-2 pb-4 text-sm text-muted-foreground">
                <p className="mb-3">{q.answer}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] h-5 bg-background/50">
                    <FileText className="h-3 w-3 mr-1" />
                    {q.docs} related {q.docs === 1 ? 'document' : 'documents'}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">
                    Ask AI
                  </Badge>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

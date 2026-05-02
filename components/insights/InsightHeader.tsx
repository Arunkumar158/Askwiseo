import { Button } from "@/components/ui/button"
import { Calendar, Filter, Search, Download } from "lucide-react"

export function InsightHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          AI-generated intelligence across your knowledge base
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Last 30 Days</span>
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search insights..."
            className="h-9 w-48 lg:w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          />
        </div>
        <Button size="sm" className="h-9 gap-2 bg-primary/90 hover:bg-primary text-primary-foreground">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  )
}

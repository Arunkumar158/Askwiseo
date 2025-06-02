"use client";

import { useState } from "react";
import { Search, Mic, Filter, ThumbsUp, ThumbsDown, BookOpen, Star, Clock, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Mock data for search results
const mockResults = [
  {
    id: 1,
    title: "Q4 Financial Report 2023",
    snippet: "The company achieved a 15% growth in revenue during Q4 2023, primarily driven by...",
    answer: "Based on the Q4 Financial Report, the company's revenue growth was 15% in Q4 2023.",
    tags: ["Finance", "Q4 2023"],
    date: "2023-12-31"
  },
  {
    id: 2,
    title: "Product Strategy Document",
    snippet: "Our new AI-powered features will be launched in phases, starting with...",
    answer: "The product strategy outlines a phased approach to launching AI features.",
    tags: ["Product", "Strategy"],
    date: "2024-01-15"
  },
  {
    id: 3,
    title: "Customer Feedback Analysis",
    snippet: "User satisfaction scores improved by 25% after implementing the new interface...",
    answer: "Customer satisfaction increased by 25% following the interface update.",
    tags: ["Customer", "UX"],
    date: "2024-02-01"
  }
];

// Mock data for recent searches
const recentSearches = [
  "Q4 revenue growth",
  "product launch timeline",
  "customer satisfaction metrics"
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Sidebar - Desktop only */}
          <div className="hidden lg:block lg:col-span-3">
            <Card className="h-[calc(100vh-2rem)]">
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span>All Documents</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Star className="h-4 w-4" />
                    <span>Starred</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Recent</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Tag className="h-4 w-4" />
                    <span>Tags</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main search area */}
          <div className="lg:col-span-9 space-y-4 md:space-y-6">
            {/* Search bar */}
            <div className="relative">
              <div className="flex items-center space-x-2">
                <Input
                  className="w-full h-12 text-lg pl-4 pr-12"
                  placeholder="Ask anything about your documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute right-2">
                        <Mic className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voice search (coming soon)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center justify-between mt-2">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </div>
            </div>

            {/* Search results */}
            <div className="space-y-4">
              {mockResults.map((result) => (
                <Card key={result.id}>
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold">{result.title}</h3>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{result.snippet}</p>
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.date).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Smart suggestions */}
            <div className="space-y-4">
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <Badge
                      key={search}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Summarize all results
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
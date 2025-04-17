import type React from "react"
import { cn } from "@/lib/utils"

interface WelcomeMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  username?: string
}

export function WelcomeMessage({ username = "there", className, ...props }: WelcomeMessageProps) {
  return (
    <div className={cn("rounded-2xl border bg-card p-6 shadow-sm", className)} {...props}>
      <h2 className="text-2xl font-bold">Welcome back, {username}!</h2>
      <p className="mt-2 text-muted-foreground">
        Your AI Knowledge Companion is ready to help you organize and search your documents.
      </p>
    </div>
  )
}

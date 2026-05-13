import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  className?: string
}

export function DashboardHeader({ heading, text, children, className }: DashboardHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col gap-2", className)}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">{heading}</h1>
      {text && <p className="text-lg text-zinc-500 font-inter">{text}</p>}
      {children}
    </div>
  )
}

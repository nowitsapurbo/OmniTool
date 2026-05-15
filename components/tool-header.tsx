"use client"

import { type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ToolHeaderProps {
  icon: LucideIcon
  name: string
  description: string
  suite: string
}

export function ToolHeader({ icon: Icon, name, description, suite }: ToolHeaderProps) {
  return (
    <div className="flex items-start gap-4 border-b border-border pb-4 mb-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-semibold text-foreground truncate">{name}</h1>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            {suite}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

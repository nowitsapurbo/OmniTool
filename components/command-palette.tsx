"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { suites, tools, getSuiteById } from "@/lib/tool-registry"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const handleSelect = (path: string) => {
    onOpenChange(false)
    router.push(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search tools..." />
      <CommandList>
        <CommandEmpty>No tools found.</CommandEmpty>
        {suites.map((suite) => {
          const suiteTools = tools.filter((t) => t.suite === suite.id)
          const Icon = suite.icon

          return (
            <React.Fragment key={suite.id}>
              <CommandGroup heading={suite.name}>
                {suiteTools.map((tool) => {
                  const ToolIcon = tool.icon
                  return (
                    <CommandItem
                      key={tool.id}
                      value={`${tool.name} ${tool.keywords.join(" ")}`}
                      onSelect={() => handleSelect(tool.path)}
                      className="cursor-pointer"
                    >
                      <ToolIcon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{tool.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {tool.description}
                        </span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          )
        })}
      </CommandList>
    </CommandDialog>
  )
}

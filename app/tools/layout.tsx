"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CommandPalette } from "@/components/command-palette"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [commandOpen, setCommandOpen] = React.useState(false)

  return (
    <SidebarProvider>
      <AppSidebar onSearchClick={() => setCommandOpen(true)} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <SidebarTrigger className="-ml-2" />
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>

        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}

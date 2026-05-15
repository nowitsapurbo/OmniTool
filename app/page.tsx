"use client"

import * as React from "react"
import Link from "next/link"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CommandPalette } from "@/components/command-palette"
import { suites, tools, getToolsBySuite } from "@/lib/tool-registry"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronRight, Search, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [expandedSuites, setExpandedSuites] = React.useState<Record<string, boolean>>({})

  const toggleSuite = (id: string) => {
    setExpandedSuites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

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

        <main className="flex-1 p-6 md:p-8 lg:p-10">
          {/* Hero Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Wrench className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  OmniTool
                </h1>
                <p className="text-muted-foreground">Developer Toolkit</p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed text-pretty">
              Essential developer tools. Zero browser tabs. Format, encode and secure your data locally.
            </p>
          </section>

          {/* Tool Suites */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Tool Suites</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allExpanded = suites.every((s) => expandedSuites[s.id])
                  const next: Record<string, boolean> = {}
                  suites.forEach((s) => (next[s.id] = !allExpanded))
                  setExpandedSuites(next)
                }}
              >
                {suites.every((s) => expandedSuites[s.id]) ? "Collapse all" : "Expand all"}
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {suites.map((suite) => {
                const suiteTools = getToolsBySuite(suite.id)
                const Icon = suite.icon
                const isOpen = !!expandedSuites[suite.id]

                return (
                  <Card key={suite.id} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSuite(suite.id)}
                      aria-expanded={isOpen}
                      aria-controls={`suite-${suite.id}-tools`}
                      className="w-full text-left"
                    >
                      <CardHeader
                        className={cn(
                          "flex flex-row items-center gap-3 transition-colors hover:bg-muted/40",
                          isOpen && "bg-muted/30 border-b border-border"
                        )}
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                            isOpen && "rotate-90"
                          )}
                        />
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base">{suite.name}</CardTitle>
                          <CardDescription className="truncate">
                            {suite.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-auto shrink-0">
                          {suiteTools.length} tools
                        </Badge>
                      </CardHeader>
                    </button>
                    {isOpen && (
                      <CardContent
                        id={`suite-${suite.id}-tools`}
                        className="p-4 pl-10 md:pl-14"
                      >
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {suiteTools.map((tool) => {
                            const ToolIcon = tool.icon
                            return (
                              <Link
                                key={tool.id}
                                href={tool.path}
                                className="group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:bg-muted/50 hover:border-border"
                              >
                                <ToolIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {tool.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {tool.description}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            )
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">OmniTool v1.0.0</p>
          </footer>
        </main>

        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}

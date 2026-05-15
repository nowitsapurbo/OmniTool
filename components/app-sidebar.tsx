"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Search,
  Settings,
  Wrench,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { suites, tools, getToolsBySuite, type Suite } from "@/lib/tool-registry"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface AppSidebarProps {
  onSearchClick?: () => void
}

export function AppSidebar({ onSearchClick }: AppSidebarProps) {
  const pathname = usePathname()
  const [openSuites, setOpenSuites] = React.useState<Suite[]>(["developer"])

  const toggleSuite = (suite: Suite) => {
    setOpenSuites((prev) =>
      prev.includes(suite)
        ? prev.filter((s) => s !== suite)
        : [...prev, suite]
    )
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-tight">OmniTool</span>
            <span className="text-[10px] text-muted-foreground">Developer Toolkit</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Search */}
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={onSearchClick}
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left text-sm">Search tools...</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tool Suites */}
        {suites.map((suite) => {
          const suiteTools = getToolsBySuite(suite.id)
          const isOpen = openSuites.includes(suite.id)
          const Icon = suite.icon

          return (
            <Collapsible
              key={suite.id}
              open={isOpen}
              onOpenChange={() => toggleSuite(suite.id)}
            >
              <SidebarGroup className="py-0">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center gap-2 px-2 py-2 hover:bg-sidebar-accent rounded-md transition-colors cursor-pointer">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left text-xs font-medium uppercase tracking-wider">
                      {suite.name}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    {/* Tree-style indent: vertical guide line + nested items */}
                    <div className="relative ml-[15px] pl-3 border-l border-sidebar-border/60">
                      <SidebarMenu>
                        {suiteTools.map((tool) => {
                          const ToolIcon = tool.icon
                          const isActive = pathname === tool.path

                          return (
                            <SidebarMenuItem key={tool.id}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={tool.description}
                                className="gap-2"
                              >
                                <Link href={tool.path}>
                                  <ToolIcon className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{tool.name}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )
                        })}
                      </SidebarMenu>
                    </div>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>v1.0.0</span>
          <span>{tools.length} tools</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

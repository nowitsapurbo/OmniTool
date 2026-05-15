"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"

interface InputOutputPanelProps {
  inputLabel: string
  outputLabel: string
  inputValue: string
  outputValue: string
  onInputChange: (value: string) => void
  inputPlaceholder?: string
  outputPlaceholder?: string
  inputClassName?: string
  outputClassName?: string
  error?: string | null
  className?: string
  readOnlyOutput?: boolean
}

export function InputOutputPanel({
  inputLabel,
  outputLabel,
  inputValue,
  outputValue,
  onInputChange,
  inputPlaceholder = "Enter your input...",
  outputPlaceholder = "Output will appear here...",
  inputClassName,
  outputClassName,
  error,
  className,
  readOnlyOutput = true,
}: InputOutputPanelProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{inputLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={inputPlaceholder}
            className={cn(
              "min-h-[300px] font-mono text-sm resize-none",
              inputClassName
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{outputLabel}</CardTitle>
            {outputValue && <CopyButton value={outputValue} />}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="min-h-[300px] rounded-md border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-mono">{error}</p>
            </div>
          ) : (
            <Textarea
              value={outputValue}
              readOnly={readOnlyOutput}
              placeholder={outputPlaceholder}
              className={cn(
                "min-h-[300px] font-mono text-sm resize-none",
                outputClassName
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

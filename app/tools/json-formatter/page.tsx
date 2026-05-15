"use client"

import * as React from "react"
import { Braces, Check, X } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { InputOutputPanel } from "@/components/input-output-panel"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatJSON, minifyJSON, validateJSON } from "@/lib/tools"
import { Badge } from "@/components/ui/badge"

export default function JSONFormatterPage() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [indent, setIndent] = React.useState("2")
  const [isValid, setIsValid] = React.useState<boolean | null>(null)

  const handleFormat = React.useCallback(() => {
    if (!input.trim()) {
      setOutput("")
      setError(null)
      setIsValid(null)
      return
    }

    const result = formatJSON(input, parseInt(indent))
    if (result.error) {
      setError(result.error)
      setOutput("")
      setIsValid(false)
    } else {
      setOutput(result.result)
      setError(null)
      setIsValid(true)
    }
  }, [input, indent])

  const handleMinify = () => {
    if (!input.trim()) return

    const result = minifyJSON(input)
    if (result.error) {
      setError(result.error)
      setOutput("")
      setIsValid(false)
    } else {
      setOutput(result.result)
      setError(null)
      setIsValid(true)
    }
  }

  const handleValidate = () => {
    if (!input.trim()) {
      setIsValid(null)
      return
    }

    const result = validateJSON(input)
    setIsValid(result.valid)
    if (!result.valid) {
      setError(result.error)
    } else {
      setError(null)
    }
  }

  // Auto-format on input change (debounced)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleFormat()
    }, 300)
    return () => clearTimeout(timer)
  }, [input, handleFormat])

  const handleSampleJSON = () => {
    setInput(JSON.stringify({
      name: "OmniTool",
      version: "1.0.0",
      description: "Developer Toolkit",
      features: ["JSON Formatting", "Encoding", "Cryptography"],
      config: {
        theme: "dark",
        autoFormat: true,
        indentSize: 2
      }
    }))
  }

  return (
    <div className="max-w-6xl mx-auto">
      <ToolHeader
        icon={Braces}
        name="JSON Formatter"
        description="Format, validate, and beautify JSON data with syntax highlighting"
        suite="Developer"
      />

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Label htmlFor="indent" className="text-sm">Indent:</Label>
          <Select value={indent} onValueChange={setIndent}>
            <SelectTrigger id="indent" className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 spaces</SelectItem>
              <SelectItem value="4">4 spaces</SelectItem>
              <SelectItem value="1">Tab</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleFormat}>
            Format
          </Button>
          <Button variant="secondary" size="sm" onClick={handleMinify}>
            Minify
          </Button>
          <Button variant="outline" size="sm" onClick={handleValidate}>
            Validate
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSampleJSON}>
            Load Sample
          </Button>
        </div>

        {isValid !== null && (
          <Badge variant={isValid ? "default" : "destructive"} className="gap-1">
            {isValid ? (
              <>
                <Check className="h-3 w-3" /> Valid JSON
              </>
            ) : (
              <>
                <X className="h-3 w-3" /> Invalid JSON
              </>
            )}
          </Badge>
        )}
      </div>

      <InputOutputPanel
        inputLabel="Input JSON"
        outputLabel="Formatted Output"
        inputValue={input}
        outputValue={output}
        onInputChange={setInput}
        inputPlaceholder='{"example": "Paste your JSON here..."}'
        outputPlaceholder="Formatted JSON will appear here..."
        error={error}
      />

      <div className="mt-4 text-xs text-muted-foreground">
        <p>Tip: Press Cmd/Ctrl + K to quickly search for other tools.</p>
      </div>
    </div>
  )
}

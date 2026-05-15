"use client"

import * as React from "react"
import { Link2, ArrowDown, ArrowUp } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"
import {
  encodeURLComponent,
  decodeURLComponent,
  encodeURL,
  decodeURL,
} from "@/lib/tools"

export default function URLEncoderPage() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [mode, setMode] = React.useState<"encode" | "decode">("encode")
  const [type, setType] = React.useState<"component" | "full">("component")

  const handleConvert = React.useCallback(() => {
    if (!input.trim()) {
      setOutput("")
      setError(null)
      return
    }

    if (mode === "encode") {
      if (type === "component") {
        setOutput(encodeURLComponent(input))
      } else {
        setOutput(encodeURL(input))
      }
      setError(null)
    } else {
      if (type === "component") {
        const result = decodeURLComponent(input)
        if (result.error) {
          setError(result.error)
          setOutput("")
        } else {
          setOutput(result.result)
          setError(null)
        }
      } else {
        const result = decodeURL(input)
        if (result.error) {
          setError(result.error)
          setOutput("")
        } else {
          setOutput(result.result)
          setError(null)
        }
      }
    }
  }, [input, mode, type])

  React.useEffect(() => {
    handleConvert()
  }, [handleConvert])

  const handleSwap = () => {
    const newMode = mode === "encode" ? "decode" : "encode"
    setMode(newMode)
    if (output && !error) {
      setInput(output)
    }
  }

  const loadSampleURL = () => {
    setInput("https://example.com/search?q=hello world&category=books & games")
    setMode("encode")
    setType("full")
  }

  const loadSampleComponent = () => {
    setInput("hello world & special=chars?test")
    setMode("encode")
    setType("component")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ToolHeader
        icon={Link2}
        name="URL Encoder / Decoder"
        description="Encode and decode URL components and full URLs"
        suite="Developer"
      />

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}>
          <TabsList>
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={type} onValueChange={(v) => setType(v as "component" | "full")}>
          <TabsList>
            <TabsTrigger value="component">Component</TabsTrigger>
            <TabsTrigger value="full">Full URL</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" size="sm" onClick={loadSampleURL}>
          Sample URL
        </Button>
        <Button variant="outline" size="sm" onClick={loadSampleComponent}>
          Sample Text
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {mode === "encode" ? "Plain Text" : "Encoded Text"}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {type === "component" ? "encodeURIComponent" : "encodeURI"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Enter text to encode..."
                  : "Enter encoded text to decode..."
              }
              className="min-h-[150px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={handleSwap} className="gap-2">
            {mode === "encode" ? (
              <>
                <ArrowDown className="h-4 w-4" /> Encoding
              </>
            ) : (
              <>
                <ArrowUp className="h-4 w-4" /> Decoding
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {mode === "encode" ? "Encoded Output" : "Decoded Output"}
              </CardTitle>
              {output && <CopyButton value={output} />}
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="min-h-[150px] rounded-md border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive font-mono">{error}</p>
              </div>
            ) : (
              <Textarea
                value={output}
                readOnly
                placeholder="Result will appear here..."
                className="min-h-[150px] font-mono text-sm bg-muted"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Encoding Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 text-sm">
            <div>
              <p className="font-medium mb-2">Common Encodings</p>
              <div className="space-y-1 font-mono text-muted-foreground">
                <p>Space → %20 (or +)</p>
                <p>! → %21</p>
                <p>@ → %40</p>
                <p># → %23</p>
                <p>$ → %24</p>
                <p>& → %26</p>
                <p>= → %3D</p>
                <p>? → %3F</p>
              </div>
            </div>
            <div>
              <p className="font-medium mb-2">Differences</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <code className="text-xs bg-muted px-1 rounded">encodeURIComponent</code>
                  <br />
                  <span className="text-xs">Encodes everything except: A-Z a-z 0-9 - _ . ! ~ * ( )</span>
                </li>
                <li>
                  <code className="text-xs bg-muted px-1 rounded">encodeURI</code>
                  <br />
                  <span className="text-xs">Preserves URL structure (: / ? # @ etc.)</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

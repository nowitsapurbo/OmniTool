"use client"

import * as React from "react"
import { LetterText, AlertTriangle } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { inspectString, type CharacterInfo } from "@/lib/tools"
import { cn } from "@/lib/utils"

export default function ASCIIInspectorPage() {
  const [input, setInput] = React.useState("Hello, World!")
  const [characters, setCharacters] = React.useState<CharacterInfo[]>([])

  React.useEffect(() => {
    if (input) {
      setCharacters(inspectString(input))
    } else {
      setCharacters([])
    }
  }, [input])

  const nonPrintableCount = characters.filter((c) => !c.isPrintable).length
  const printableCount = characters.filter((c) => c.isPrintable).length

  const handleSampleText = () => {
    setInput("Hello\tWorld\nLine 2\r\nSpecial: @#$%")
  }

  const handleClear = () => {
    setInput("")
  }

  return (
    <div className="max-w-6xl mx-auto">
      <ToolHeader
        icon={LetterText}
        name="ASCII / String Inspector"
        description="Inspect characters with multi-radix output (Hex, Dec, Oct, Bin)"
        suite="Data & Encoding"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,1.5fr]">
        {/* Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Input Text</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to inspect..."
                className="min-h-[200px] font-mono"
              />
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={handleSampleText}>
                  Load Sample
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Total Characters</p>
                  <p className="text-2xl font-bold">{characters.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Printable</p>
                  <p className="text-2xl font-bold text-success">{printableCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Non-Printable</p>
                  <p className="text-2xl font-bold text-warning">{nonPrintableCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bytes (UTF-8)</p>
                  <p className="text-2xl font-bold">{new TextEncoder().encode(input).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {nonPrintableCount > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Non-Printable Characters Detected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Found {nonPrintableCount} non-printable character(s) including control characters,
                      tabs, newlines, or other special characters.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Character Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Character Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-16">Char</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="font-mono">Dec</TableHead>
                    <TableHead className="font-mono">Hex</TableHead>
                    <TableHead className="font-mono">Oct</TableHead>
                    <TableHead className="font-mono">Binary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {characters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Enter text above to inspect characters
                      </TableCell>
                    </TableRow>
                  ) : (
                    characters.map((char, index) => (
                      <TableRow
                        key={index}
                        className={cn(!char.isPrintable && "bg-warning/5")}
                      >
                        <TableCell className="text-muted-foreground">{index}</TableCell>
                        <TableCell>
                          {char.isPrintable ? (
                            <span className="font-mono text-lg">{char.char}</span>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              {char.char}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {char.description}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{char.decimal}</TableCell>
                        <TableCell className="font-mono text-sm">0x{char.hex}</TableCell>
                        <TableCell className="font-mono text-sm">0{char.octal}</TableCell>
                        <TableCell className="font-mono text-xs">{char.binary}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* ASCII Reference */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">ASCII Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3 text-sm">
            <div>
              <p className="font-medium mb-2">Control Characters (0-31)</p>
              <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                <li>0 (NUL) - Null</li>
                <li>9 (HT) - Horizontal Tab</li>
                <li>10 (LF) - Line Feed</li>
                <li>13 (CR) - Carriage Return</li>
                <li>27 (ESC) - Escape</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Printable Range (32-126)</p>
              <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                <li>32 - Space</li>
                <li>48-57 - Digits (0-9)</li>
                <li>65-90 - Uppercase (A-Z)</li>
                <li>97-122 - Lowercase (a-z)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Special Characters</p>
              <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                <li>33-47 - Punctuation (!&quot;#$...)</li>
                <li>58-64 - Punctuation (:;&lt;=...)</li>
                <li>91-96 - Brackets ([\\]^...)</li>
                <li>123-126 - Punctuation (&#123;|&#125;~)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

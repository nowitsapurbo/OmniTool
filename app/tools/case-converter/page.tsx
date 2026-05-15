"use client"

import * as React from "react"
import { Type, Copy, Check } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toConstantCase,
  toTitleCase,
  toSentenceCase,
} from "@/lib/tools"

interface CaseOption {
  id: string
  name: string
  example: string
  converter: (str: string) => string
}

const caseOptions: CaseOption[] = [
  { id: "camel", name: "camelCase", example: "myVariableName", converter: toCamelCase },
  { id: "pascal", name: "PascalCase", example: "MyClassName", converter: toPascalCase },
  { id: "snake", name: "snake_case", example: "my_variable_name", converter: toSnakeCase },
  { id: "kebab", name: "kebab-case", example: "my-css-class", converter: toKebabCase },
  { id: "constant", name: "CONSTANT_CASE", example: "MY_CONSTANT", converter: toConstantCase },
  { id: "title", name: "Title Case", example: "My Title Here", converter: toTitleCase },
  { id: "sentence", name: "Sentence case", example: "My sentence here", converter: toSentenceCase },
  { id: "upper", name: "UPPERCASE", example: "ALL CAPS", converter: (s) => s.toUpperCase() },
  { id: "lower", name: "lowercase", example: "all lower", converter: (s) => s.toLowerCase() },
]

export default function CaseConverterPage() {
  const [input, setInput] = React.useState("hello world example")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleApply = (converter: (str: string) => string) => {
    setInput(converter(input))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ToolHeader
        icon={Type}
        name="String Case Converter"
        description="Transform text between camelCase, snake_case, kebab-case, and more"
        suite="Developer"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Input Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your text here..."
            className="min-h-[100px] font-mono"
          />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setInput("")}>
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("hello world example text")}
            >
              Load Sample
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {caseOptions.map((option) => {
          const converted = input ? option.converter(input) : ""
          const isCopied = copiedId === option.id

          return (
            <Card key={option.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{option.name}</CardTitle>
                  <span className="text-xs text-muted-foreground">{option.example}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md min-h-[44px]">
                  <code className="flex-1 text-sm font-mono break-all">
                    {converted || <span className="text-muted-foreground">No input</span>}
                  </code>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCopy(converted, option.id)}
                    disabled={!converted}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApply(option.converter)}
                    disabled={!input}
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Usage Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="font-medium mb-2">Programming Conventions</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><code className="text-xs bg-muted px-1 rounded">camelCase</code> - JavaScript variables, functions</li>
                <li><code className="text-xs bg-muted px-1 rounded">PascalCase</code> - Classes, React components</li>
                <li><code className="text-xs bg-muted px-1 rounded">snake_case</code> - Python, database columns</li>
                <li><code className="text-xs bg-muted px-1 rounded">CONSTANT_CASE</code> - Constants, env variables</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Web & Documentation</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><code className="text-xs bg-muted px-1 rounded">kebab-case</code> - CSS classes, URLs, file names</li>
                <li><code className="text-xs bg-muted px-1 rounded">Title Case</code> - Headlines, titles</li>
                <li><code className="text-xs bg-muted px-1 rounded">Sentence case</code> - Regular text</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

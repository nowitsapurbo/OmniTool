"use client"

import * as React from "react"
import { FileCode, Upload, FileImage, ArrowDown, ArrowUp } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"
import { encodeBase64, decodeBase64, fileToBase64 } from "@/lib/tools"

export default function Base64Page() {
  const [textInput, setTextInput] = React.useState("")
  const [textOutput, setTextOutput] = React.useState("")
  const [textError, setTextError] = React.useState<string | null>(null)
  const [textMode, setTextMode] = React.useState<"encode" | "decode">("encode")

  const [fileBase64, setFileBase64] = React.useState("")
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [filePreview, setFilePreview] = React.useState<string | null>(null)
  const [isImage, setIsImage] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Text encoding/decoding
  React.useEffect(() => {
    if (!textInput.trim()) {
      setTextOutput("")
      setTextError(null)
      return
    }

    if (textMode === "encode") {
      try {
        setTextOutput(encodeBase64(textInput))
        setTextError(null)
      } catch (e) {
        setTextError(e instanceof Error ? e.message : "Encoding failed")
        setTextOutput("")
      }
    } else {
      const result = decodeBase64(textInput)
      if (result.error) {
        setTextError(result.error)
        setTextOutput("")
      } else {
        setTextOutput(result.result)
        setTextError(null)
      }
    }
  }, [textInput, textMode])

  const handleTextSwap = () => {
    const newMode = textMode === "encode" ? "decode" : "encode"
    setTextMode(newMode)
    if (textOutput && !textError) {
      setTextInput(textOutput)
    }
  }

  // File handling
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsImage(file.type.startsWith("image/"))

    try {
      const base64 = await fileToBase64(file)
      setFileBase64(base64)

      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => setFilePreview(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    } catch (err) {
      console.error("Failed to read file:", err)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsImage(file.type.startsWith("image/"))

    try {
      const base64 = await fileToBase64(file)
      setFileBase64(base64)

      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => setFilePreview(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    } catch (err) {
      console.error("Failed to read file:", err)
    }
  }

  const handleClearFile = () => {
    setFileBase64("")
    setFileName(null)
    setFilePreview(null)
    setIsImage(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ToolHeader
        icon={FileCode}
        name="Base64 Encoder / Decoder"
        description="Encode and decode Base64 for text and files"
        suite="Data & Encoding"
      />

      <Tabs defaultValue="text" className="space-y-6">
        <TabsList>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="file">File / Image</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Tabs value={textMode} onValueChange={(v) => setTextMode(v as "encode" | "decode")}>
              <TabsList>
                <TabsTrigger value="encode">Encode</TabsTrigger>
                <TabsTrigger value="decode">Decode</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {textMode === "encode" ? "Plain Text" : "Base64 Input"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  textMode === "encode"
                    ? "Enter text to encode..."
                    : "Enter Base64 to decode..."
                }
                className="min-h-[150px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={handleTextSwap} className="gap-2">
              {textMode === "encode" ? (
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
                <CardTitle className="text-sm">
                  {textMode === "encode" ? "Base64 Output" : "Decoded Text"}
                </CardTitle>
                {textOutput && <CopyButton value={textOutput} />}
              </div>
            </CardHeader>
            <CardContent>
              {textError ? (
                <div className="min-h-[150px] rounded-md border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm text-destructive font-mono">{textError}</p>
                </div>
              ) : (
                <Textarea
                  value={textOutput}
                  readOnly
                  placeholder="Result will appear here..."
                  className="min-h-[150px] font-mono text-sm bg-muted"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload File</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop a file here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports any file type. Images will show a preview.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {fileName && (
                <div className="mt-4 flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {isImage ? (
                      <FileImage className="h-4 w-4 text-primary" />
                    ) : (
                      <FileCode className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium">{fileName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(fileBase64.length * 0.75 / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleClearFile}>
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Preview */}
          {filePreview && isImage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Image Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center p-4 bg-muted rounded-lg">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-[300px] max-w-full object-contain rounded"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Base64 Output */}
          {fileBase64 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Base64 Output</CardTitle>
                  <CopyButton value={fileBase64} />
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={fileBase64}
                  readOnly
                  className="min-h-[200px] font-mono text-xs bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {fileBase64.length.toLocaleString()} characters
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">About Base64</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-3">
            Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII 
            string format. It&apos;s commonly used for:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Embedding images in HTML/CSS (data URIs)</li>
            <li>Encoding binary data in JSON/XML</li>
            <li>Email attachments (MIME)</li>
            <li>Storing complex data in URLs or cookies</li>
          </ul>
          <p className="mt-3">
            <strong>Note:</strong> Base64 increases data size by approximately 33%.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

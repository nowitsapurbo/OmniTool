"use client";

import { useState, useCallback } from "react";
import { ToolHeader } from "@/components/tool-header";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Play, Eraser, Terminal, Code2, FileJson } from "lucide-react";

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  auth?: { type: string; value: string };
}

export default function CurlConverterPage() {
  const [curlCommand, setCurlCommand] = useState("");
  const [parsedData, setParsedData] = useState<ParsedCurl | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("javascript");

  const parseCurl = useCallback((curl: string): ParsedCurl | null => {
    try {
      // Clean up the curl command
      let cleaned = curl
        .replace(/\\\n/g, " ")  // Remove line continuations
        .replace(/\s+/g, " ")   // Normalize whitespace
        .trim();

      // Remove 'curl' prefix if present
      if (cleaned.toLowerCase().startsWith("curl ")) {
        cleaned = cleaned.substring(5).trim();
      }

      const result: ParsedCurl = {
        method: "GET",
        url: "",
        headers: {}
      };

      // Parse URL (could be quoted or unquoted)
      const urlMatch = cleaned.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/);
      if (urlMatch) {
        result.url = urlMatch[1];
      }

      // Parse method
      const methodMatch = cleaned.match(/-X\s+['"]?(\w+)['"]?/i);
      if (methodMatch) {
        result.method = methodMatch[1].toUpperCase();
      }

      // Parse headers
      const headerRegex = /-H\s+['"]([^'"]+)['"]/gi;
      let headerMatch;
      while ((headerMatch = headerRegex.exec(cleaned)) !== null) {
        const [key, ...valueParts] = headerMatch[1].split(":");
        if (key && valueParts.length > 0) {
          result.headers[key.trim()] = valueParts.join(":").trim();
        }
      }

      // Parse data/body
      const dataMatch = cleaned.match(/(?:-d|--data|--data-raw|--data-binary)\s+['"]([^'"]+)['"]/i);
      if (dataMatch) {
        result.body = dataMatch[1];
        if (result.method === "GET") {
          result.method = "POST";
        }
      }

      // Parse basic auth
      const authMatch = cleaned.match(/-u\s+['"]?([^'"\s]+)['"]?/i);
      if (authMatch) {
        result.auth = { type: "basic", value: authMatch[1] };
      }

      // Parse bearer token
      const bearerMatch = result.headers["Authorization"]?.match(/Bearer\s+(.+)/i);
      if (bearerMatch) {
        result.auth = { type: "bearer", value: bearerMatch[1] };
      }

      return result;
    } catch {
      return null;
    }
  }, []);

  const generateJavaScript = (data: ParsedCurl): string => {
    const options: string[] = [];
    options.push(`  method: '${data.method}'`);

    if (Object.keys(data.headers).length > 0) {
      const headersStr = Object.entries(data.headers)
        .map(([k, v]) => `    '${k}': '${v}'`)
        .join(",\n");
      options.push(`  headers: {\n${headersStr}\n  }`);
    }

    if (data.body) {
      try {
        JSON.parse(data.body);
        options.push(`  body: JSON.stringify(${data.body})`);
      } catch {
        options.push(`  body: '${data.body}'`);
      }
    }

    return `fetch('${data.url}', {
${options.join(",\n")}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  };

  const generatePython = (data: ParsedCurl): string => {
    const lines: string[] = ["import requests", ""];

    if (Object.keys(data.headers).length > 0) {
      lines.push("headers = {");
      Object.entries(data.headers).forEach(([k, v]) => {
        lines.push(`    '${k}': '${v}',`);
      });
      lines.push("}");
      lines.push("");
    }

    if (data.body) {
      try {
        const parsed = JSON.parse(data.body);
        lines.push(`data = ${JSON.stringify(parsed, null, 4).replace(/"/g, "'")}`);
        lines.push("");
      } catch {
        lines.push(`data = '${data.body}'`);
        lines.push("");
      }
    }

    const args: string[] = [`'${data.url}'`];
    if (Object.keys(data.headers).length > 0) args.push("headers=headers");
    if (data.body) args.push("json=data");
    if (data.auth?.type === "basic") {
      const [user, pass] = data.auth.value.split(":");
      args.push(`auth=('${user}', '${pass}')`);
    }

    lines.push(`response = requests.${data.method.toLowerCase()}(${args.join(", ")})`);
    lines.push("print(response.json())");

    return lines.join("\n");
  };

  const generatePHP = (data: ParsedCurl): string => {
    const lines: string[] = ["<?php", "", "$ch = curl_init();", ""];
    lines.push(`curl_setopt($ch, CURLOPT_URL, '${data.url}');`);
    lines.push("curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);");

    if (data.method !== "GET") {
      lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${data.method}');`);
    }

    if (Object.keys(data.headers).length > 0) {
      lines.push("");
      lines.push("$headers = [");
      Object.entries(data.headers).forEach(([k, v]) => {
        lines.push(`    '${k}: ${v}',`);
      });
      lines.push("];");
      lines.push("curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);");
    }

    if (data.body) {
      lines.push("");
      lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${data.body}');`);
    }

    lines.push("");
    lines.push("$response = curl_exec($ch);");
    lines.push("curl_close($ch);");
    lines.push("");
    lines.push("echo $response;");

    return lines.join("\n");
  };

  const generateGo = (data: ParsedCurl): string => {
    const lines: string[] = [
      "package main",
      "",
      "import (",
      '    "fmt"',
      '    "io/ioutil"',
      '    "net/http"',
    ];

    if (data.body) {
      lines.push('    "strings"');
    }

    lines.push(")", "", "func main() {");

    if (data.body) {
      lines.push(`    body := strings.NewReader(\`${data.body}\`)`);
      lines.push(`    req, err := http.NewRequest("${data.method}", "${data.url}", body)`);
    } else {
      lines.push(`    req, err := http.NewRequest("${data.method}", "${data.url}", nil)`);
    }

    lines.push("    if err != nil {");
    lines.push("        panic(err)");
    lines.push("    }");

    if (Object.keys(data.headers).length > 0) {
      lines.push("");
      Object.entries(data.headers).forEach(([k, v]) => {
        lines.push(`    req.Header.Set("${k}", "${v}")`);
      });
    }

    lines.push("");
    lines.push("    client := &http.Client{}");
    lines.push("    resp, err := client.Do(req)");
    lines.push("    if err != nil {");
    lines.push("        panic(err)");
    lines.push("    }");
    lines.push("    defer resp.Body.Close()");
    lines.push("");
    lines.push("    respBody, _ := ioutil.ReadAll(resp.Body)");
    lines.push("    fmt.Println(string(respBody))");
    lines.push("}");

    return lines.join("\n");
  };

  const handleConvert = () => {
    setError("");
    const parsed = parseCurl(curlCommand);
    if (parsed && parsed.url) {
      setParsedData(parsed);
    } else {
      setError("Invalid cURL command. Please check the syntax.");
      setParsedData(null);
    }
  };

  const handleClear = () => {
    setCurlCommand("");
    setParsedData(null);
    setError("");
  };

  const sampleCurl = `curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' \\
  -d '{"name": "John Doe", "email": "john@example.com"}'`;

  const getOutput = () => {
    if (!parsedData) return "";
    switch (activeTab) {
      case "javascript": return generateJavaScript(parsedData);
      case "python": return generatePython(parsedData);
      case "php": return generatePHP(parsedData);
      case "go": return generateGo(parsedData);
      default: return "";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        icon={Terminal}
        name="cURL Converter"
        description="Convert cURL commands to JavaScript, Python, PHP, and Go code"
        suite="Engineering"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Input */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                cURL Command
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setCurlCommand(sampleCurl)}>
                Load Example
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={curlCommand}
              onChange={(e) => setCurlCommand(e.target.value)}
              placeholder="Paste your cURL command here..."
              className="min-h-[150px] font-mono text-sm bg-background/50 resize-none"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleConvert} className="gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Convert
              </Button>
              <Button variant="outline" onClick={handleClear} className="gap-2">
                <Eraser className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Parsed Info */}
        {parsedData && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                Parsed Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Method</Label>
                  <Badge variant="secondary" className="mt-1 font-mono">{parsedData.method}</Badge>
                </div>
                <div className="lg:col-span-3">
                  <Label className="text-xs text-muted-foreground">URL</Label>
                  <p className="mt-1 font-mono text-sm truncate">{parsedData.url}</p>
                </div>
                {Object.keys(parsedData.headers).length > 0 && (
                  <div className="lg:col-span-4">
                    <Label className="text-xs text-muted-foreground">Headers</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(parsedData.headers).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="font-mono text-xs">
                          {key}: {value.length > 30 ? value.substring(0, 30) + "..." : value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {parsedData.body && (
                  <div className="lg:col-span-4">
                    <Label className="text-xs text-muted-foreground">Body</Label>
                    <pre className="mt-1 p-2 rounded bg-background/50 border border-border/50 font-mono text-xs overflow-auto">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(parsedData.body), null, 2);
                        } catch {
                          return parsedData.body;
                        }
                      })()}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Output */}
        {parsedData && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Generated Code
                </CardTitle>
                <CopyButton value={getOutput()} />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                  <TabsTrigger value="go">Go</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript">
                  <pre className="p-4 rounded-lg bg-background/50 border border-border/50 font-mono text-sm overflow-auto max-h-[400px]">
                    {generateJavaScript(parsedData)}
                  </pre>
                </TabsContent>

                <TabsContent value="python">
                  <pre className="p-4 rounded-lg bg-background/50 border border-border/50 font-mono text-sm overflow-auto max-h-[400px]">
                    {generatePython(parsedData)}
                  </pre>
                </TabsContent>

                <TabsContent value="php">
                  <pre className="p-4 rounded-lg bg-background/50 border border-border/50 font-mono text-sm overflow-auto max-h-[400px]">
                    {generatePHP(parsedData)}
                  </pre>
                </TabsContent>

                <TabsContent value="go">
                  <pre className="p-4 rounded-lg bg-background/50 border border-border/50 font-mono text-sm overflow-auto max-h-[400px]">
                    {generateGo(parsedData)}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

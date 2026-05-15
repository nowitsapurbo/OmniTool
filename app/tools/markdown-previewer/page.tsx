"use client";

import { useState, useMemo } from "react";
import { ToolHeader } from "@/components/tool-header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Code2, Download, Columns } from "lucide-react";

export default function MarkdownPreviewerPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [viewMode, setViewMode] = useState<"split" | "preview" | "source">("split");

  const parseMarkdown = (md: string): string => {
    let html = md;

    // Escape HTML
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Code blocks (must be before inline code)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-muted/50 p-4 rounded-lg overflow-x-auto my-4 border border-border/50"><code class="text-sm font-mono">${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~([^~]+)~~/g, '<del class="text-muted-foreground">$1</del>');

    // Links and images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener">$1</a>');

    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 my-4 text-muted-foreground italic">$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="my-8 border-border" />');

    // Unordered lists
    html = html.replace(/^\* (.*$)/gm, '<li class="ml-6 list-disc">$1</li>');
    html = html.replace(/^- (.*$)/gm, '<li class="ml-6 list-disc">$1</li>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-6 list-decimal">$1</li>');

    // Wrap consecutive list items
    html = html.replace(/(<li class="ml-6 list-disc">.*<\/li>\n?)+/g, (match) => `<ul class="my-4 space-y-1">${match}</ul>`);
    html = html.replace(/(<li class="ml-6 list-decimal">.*<\/li>\n?)+/g, (match) => `<ol class="my-4 space-y-1">${match}</ol>`);

    // Task lists
    html = html.replace(/\[x\]/gi, '<input type="checkbox" checked disabled class="mr-2" />');
    html = html.replace(/\[ \]/g, '<input type="checkbox" disabled class="mr-2" />');

    // Tables (basic)
    html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map((c: string) => c.trim());
      if (cells.every((c: string) => /^[-:]+$/.test(c))) {
        return ''; // Skip separator row
      }
      const cellTags = cells.map((c: string) => `<td class="border border-border/50 px-4 py-2">${c}</td>`).join('');
      return `<tr>${cellTags}</tr>`;
    });
    html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table class="w-full border-collapse my-4">${match}</table>`);

    // Paragraphs (wrap remaining text)
    html = html.split('\n\n').map(block => {
      if (block.trim() && !block.startsWith('<')) {
        return `<p class="my-4 leading-relaxed">${block}</p>`;
      }
      return block;
    }).join('\n');

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const renderedHtml = useMemo(() => parseMarkdown(markdown), [markdown]);

  const stats = useMemo(() => {
    const words = markdown.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = markdown.length;
    const lines = markdown.split('\n').length;
    const headings = (markdown.match(/^#{1,6} /gm) || []).length;
    const links = (markdown.match(/\[.*?\]\(.*?\)/g) || []).length;
    const codeBlocks = (markdown.match(/```/g) || []).length / 2;
    return { words, chars, lines, headings, links, codeBlocks: Math.floor(codeBlocks) };
  }, [markdown]);

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Markdown Export</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; font-style: italic; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ddd; padding: 0.5rem 1rem; }
  </style>
</head>
<body>
${renderedHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        icon={FileText}
        name="Markdown Previewer"
        description="Write and preview Markdown with live rendering"
        suite="Frontend"
      />

      <div className="flex-1 p-6 space-y-4 overflow-auto">
        {/* Controls */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "split" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("split")}
                  className="gap-2"
                >
                  <Columns className="h-4 w-4" />
                  Split
                </Button>
                <Button
                  variant={viewMode === "source" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("source")}
                  className="gap-2"
                >
                  <Code2 className="h-4 w-4" />
                  Source
                </Button>
                <Button
                  variant={viewMode === "preview" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("preview")}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {stats.words} words
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {stats.chars} chars
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {stats.lines} lines
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {stats.headings} headings
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {stats.links} links
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {stats.codeBlocks} code blocks
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadMarkdown} className="gap-2">
                  <Download className="h-4 w-4" />
                  .md
                </Button>
                <Button variant="outline" size="sm" onClick={downloadHtml} className="gap-2">
                  <Download className="h-4 w-4" />
                  .html
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor/Preview */}
        <div className={`grid gap-6 flex-1 ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
          {(viewMode === "split" || viewMode === "source") && (
            <Card className="border-border/50 bg-card/50 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Markdown Source
                  </CardTitle>
                  <CopyButton value={markdown} />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Write your markdown here..."
                  className="min-h-[500px] h-full font-mono text-sm bg-background/50 resize-none"
                />
              </CardContent>
            </Card>
          )}

          {(viewMode === "split" || viewMode === "preview") && (
            <Card className="border-border/50 bg-card/50 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </CardTitle>
                  <CopyButton value={renderedHtml} />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-auto">
                <div 
                  className="prose prose-invert max-w-none min-h-[500px] p-4 rounded-lg bg-background/50 border border-border/50"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const defaultMarkdown = `# Welcome to OmniTool Markdown Previewer

This is a **live preview** markdown editor. Start typing to see changes instantly!

## Features

- **Bold** and *italic* text
- ~~Strikethrough~~ support
- \`Inline code\` formatting
- [Links](https://example.com) work too

### Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

### Lists

1. First ordered item
2. Second ordered item
3. Third ordered item

- Unordered item one
- Unordered item two
- Unordered item three

### Blockquotes

> This is a blockquote. It can span multiple lines and is great for highlighting important information.

### Tables

| Feature | Status |
|---------|--------|
| Headers | Done |
| Lists | Done |
| Code | Done |
| Tables | Done |

---

*Happy writing!*
`;

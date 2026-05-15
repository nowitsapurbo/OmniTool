"use client";

import { useState, useMemo } from "react";
import { ToolHeader } from "@/components/tool-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, AlertCircle, Check, BookOpen } from "lucide-react";

interface Match {
  index: number;
  match: string;
  groups: string[];
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
  });

  const flagString = Object.entries(flags)
    .filter(([, enabled]) => enabled)
    .map(([flag]) => flag)
    .join('');

  const result = useMemo(() => {
    if (!pattern) {
      return { valid: true, error: null, matches: [], regex: null };
    }

    try {
      const regex = new RegExp(pattern, flagString);
      const matches: Match[] = [];
      
      if (flags.g) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            index: match.index,
            match: match[0],
            groups: match.slice(1),
          });
          if (!match[0]) break; // Prevent infinite loop for zero-width matches
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            index: match.index,
            match: match[0],
            groups: match.slice(1),
          });
        }
      }

      return { valid: true, error: null, matches, regex };
    } catch (e) {
      return { valid: false, error: (e as Error).message, matches: [], regex: null };
    }
  }, [pattern, testString, flagString, flags.g]);

  const highlightedText = useMemo(() => {
    if (!result.valid || result.matches.length === 0 || !testString) {
      return testString;
    }

    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    result.matches.forEach((match, i) => {
      if (match.index > lastIndex) {
        parts.push(testString.slice(lastIndex, match.index));
      }
      parts.push(
        <mark key={i} className="bg-primary/30 text-primary-foreground rounded px-0.5">
          {match.match}
        </mark>
      );
      lastIndex = match.index + match.match.length;
    });

    if (lastIndex < testString.length) {
      parts.push(testString.slice(lastIndex));
    }

    return parts;
  }, [testString, result]);

  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: 'URL', pattern: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+' },
    { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
    { name: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
    { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
    { name: 'Time (HH:MM)', pattern: '([01]?\\d|2[0-3]):[0-5]\\d' },
    { name: 'Hex Color', pattern: '#[0-9A-Fa-f]{6}\\b' },
    { name: 'Username', pattern: '[a-zA-Z][a-zA-Z0-9_]{2,15}' },
    { name: 'Password (Strong)', pattern: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}' },
    { name: 'Credit Card', pattern: '\\b(?:\\d{4}[- ]?){3}\\d{4}\\b' },
  ];

  const cheatSheet = [
    { category: 'Character Classes', items: [
      { pattern: '.', desc: 'Any character except newline' },
      { pattern: '\\d', desc: 'Digit (0-9)' },
      { pattern: '\\D', desc: 'Non-digit' },
      { pattern: '\\w', desc: 'Word character (a-z, A-Z, 0-9, _)' },
      { pattern: '\\W', desc: 'Non-word character' },
      { pattern: '\\s', desc: 'Whitespace' },
      { pattern: '\\S', desc: 'Non-whitespace' },
    ]},
    { category: 'Anchors', items: [
      { pattern: '^', desc: 'Start of string/line' },
      { pattern: '$', desc: 'End of string/line' },
      { pattern: '\\b', desc: 'Word boundary' },
      { pattern: '\\B', desc: 'Non-word boundary' },
    ]},
    { category: 'Quantifiers', items: [
      { pattern: '*', desc: '0 or more' },
      { pattern: '+', desc: '1 or more' },
      { pattern: '?', desc: '0 or 1' },
      { pattern: '{n}', desc: 'Exactly n times' },
      { pattern: '{n,}', desc: 'n or more times' },
      { pattern: '{n,m}', desc: 'Between n and m times' },
    ]},
    { category: 'Groups & Lookaround', items: [
      { pattern: '(abc)', desc: 'Capturing group' },
      { pattern: '(?:abc)', desc: 'Non-capturing group' },
      { pattern: '(?=abc)', desc: 'Positive lookahead' },
      { pattern: '(?!abc)', desc: 'Negative lookahead' },
      { pattern: '(?<=abc)', desc: 'Positive lookbehind' },
      { pattern: '(?<!abc)', desc: 'Negative lookbehind' },
    ]},
  ];

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        icon={Code2}
        name="Regex Tester"
        description="Test and debug regular expressions with real-time matching"
        suite="Developer"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Pattern Input */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Regular Expression
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-lg">/</span>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter your regex pattern..."
                className="flex-1 font-mono"
              />
              <span className="text-muted-foreground font-mono text-lg">/</span>
              <span className="font-mono text-primary">{flagString}</span>
              <CopyButton value={`/${pattern}/${flagString}`} />
            </div>

            <div className="flex flex-wrap gap-4">
              {Object.entries(flags).map(([flag, enabled]) => (
                <div key={flag} className="flex items-center gap-2">
                  <Checkbox
                    id={`flag-${flag}`}
                    checked={enabled}
                    onCheckedChange={(checked) => setFlags({ ...flags, [flag]: !!checked })}
                  />
                  <Label htmlFor={`flag-${flag}`} className="text-sm cursor-pointer font-mono">
                    {flag}
                    <span className="text-muted-foreground ml-1">
                      ({flag === 'g' ? 'global' : flag === 'i' ? 'case-insensitive' : flag === 'm' ? 'multiline' : flag === 's' ? 'dotAll' : 'unicode'})
                    </span>
                  </Label>
                </div>
              ))}
            </div>

            {!result.valid && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/50">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{result.error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test String & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Test String</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter text to test against..."
                className="min-h-[200px] font-mono text-sm bg-background/50 resize-none"
              />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Matches
                  {result.valid && result.matches.length > 0 && (
                    <Badge variant="secondary">{result.matches.length}</Badge>
                  )}
                </CardTitle>
                {result.valid && result.matches.length > 0 && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[200px] p-4 rounded-lg bg-background/50 border border-border/50 font-mono text-sm whitespace-pre-wrap break-all">
                {testString ? highlightedText : <span className="text-muted-foreground">Highlighted matches will appear here...</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Details */}
        {result.matches.length > 0 && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Match Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-auto">
                {result.matches.map((match, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-3 rounded-lg bg-background/50 border border-border/50"
                  >
                    <Badge variant="outline" className="shrink-0">#{i + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="font-mono text-sm bg-primary/20 px-2 py-0.5 rounded">
                          {match.match || '(empty)'}
                        </code>
                        <span className="text-xs text-muted-foreground">
                          at index {match.index}
                        </span>
                      </div>
                      {match.groups.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {match.groups.map((group, j) => (
                            <Badge key={j} variant="secondary" className="font-mono text-xs">
                              ${j + 1}: {group || '(empty)'}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <CopyButton value={match.match} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Common Patterns & Cheat Sheet */}
        <Tabs defaultValue="common" className="w-full">
          <TabsList>
            <TabsTrigger value="common">Common Patterns</TabsTrigger>
            <TabsTrigger value="cheatsheet">Cheat Sheet</TabsTrigger>
          </TabsList>

          <TabsContent value="common">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {commonPatterns.map((item) => (
                    <Button
                      key={item.name}
                      variant="outline"
                      className="justify-start h-auto py-2 px-3"
                      onClick={() => setPattern(item.pattern)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                          {item.pattern}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cheatsheet">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {cheatSheet.map((section) => (
                    <div key={section.category}>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {section.category}
                      </h4>
                      <div className="space-y-2">
                        {section.items.map((item) => (
                          <div key={item.pattern} className="flex items-start gap-2 text-sm">
                            <code className="font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">
                              {item.pattern}
                            </code>
                            <span className="text-muted-foreground">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

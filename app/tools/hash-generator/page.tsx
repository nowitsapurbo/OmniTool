"use client";

import { useState, useCallback, useEffect } from "react";
import { ToolHeader } from "@/components/tool-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Hash, FileText, Upload, Check, X } from "lucide-react";

interface HashResult {
  algorithm: string;
  hash: string;
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [isHashing, setIsHashing] = useState(false);
  const [compareHash, setCompareHash] = useState("");
  const [compareResult, setCompareResult] = useState<boolean | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);

  const algorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

  const computeHash = useCallback(async (data: ArrayBuffer, algorithm: string): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  const generateHashes = useCallback(async (data: ArrayBuffer) => {
    setIsHashing(true);
    const results: HashResult[] = [];

    for (const algo of algorithms) {
      const hash = await computeHash(data, algo);
      results.push({ algorithm: algo, hash });
    }

    setHashes(results);
    setIsHashing(false);
  }, [computeHash]);

  useEffect(() => {
    if (input) {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      generateHashes(data.buffer);
    } else {
      setHashes([]);
    }
  }, [input, generateHashes]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileInfo({ name: file.name, size: file.size });
    setInput("");
    
    const buffer = await file.arrayBuffer();
    generateHashes(buffer);
  };

  const handleCompare = () => {
    if (!compareHash || hashes.length === 0) {
      setCompareResult(null);
      return;
    }

    const normalizedCompare = compareHash.toLowerCase().replace(/\s/g, '');
    const match = hashes.some(h => h.hash.toLowerCase() === normalizedCompare);
    setCompareResult(match);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        icon={Hash}
        name="Hash Generator"
        description="Generate cryptographic hashes using SHA algorithms"
        suite="Security"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Input */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Input
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="file">File</TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <Textarea
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setFileInfo(null); }}
                  placeholder="Enter text to hash..."
                  className="min-h-[150px] font-mono text-sm bg-background/50 resize-none"
                />
              </TabsContent>

              <TabsContent value="file">
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-primary hover:underline">Click to upload</span>
                    <span className="text-muted-foreground"> or drag and drop</span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {fileInfo && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50">
                      <p className="font-medium">{fileInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(fileInfo.size)}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results */}
        {hashes.length > 0 && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Generated Hashes
                {isHashing && <Badge variant="secondary" className="ml-2">Computing...</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hashes.map((result) => (
                  <div
                    key={result.algorithm}
                    className="p-4 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{result.algorithm}</Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{result.hash.length * 4} bits</span>
                        <CopyButton value={result.hash} />
                      </div>
                    </div>
                    <code className="font-mono text-sm break-all select-all">{result.hash}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compare */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Verify Hash</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={compareHash}
                onChange={(e) => { setCompareHash(e.target.value); setCompareResult(null); }}
                placeholder="Paste a hash to verify..."
                className="flex-1 font-mono"
              />
              <Button onClick={handleCompare} disabled={!compareHash || hashes.length === 0}>
                Verify
              </Button>
            </div>

            {compareResult !== null && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                compareResult 
                  ? 'bg-green-500/10 border border-green-500/50' 
                  : 'bg-destructive/10 border border-destructive/50'
              }`}>
                {compareResult ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-green-500 font-medium">Hash matches!</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-destructive" />
                    <span className="text-destructive font-medium">Hash does not match any algorithm</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Algorithm Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <Badge variant="outline" className="mb-2">SHA-1</Badge>
                <p className="text-xs text-muted-foreground">160 bits / 40 hex chars. Deprecated for security-critical applications.</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <Badge variant="outline" className="mb-2">SHA-256</Badge>
                <p className="text-xs text-muted-foreground">256 bits / 64 hex chars. Most commonly used. Good balance of speed and security.</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <Badge variant="outline" className="mb-2">SHA-384</Badge>
                <p className="text-xs text-muted-foreground">384 bits / 96 hex chars. Truncated SHA-512. Higher security margin.</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <Badge variant="outline" className="mb-2">SHA-512</Badge>
                <p className="text-xs text-muted-foreground">512 bits / 128 hex chars. Highest security. Better on 64-bit systems.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

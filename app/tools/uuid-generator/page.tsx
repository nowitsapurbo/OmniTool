"use client";

import { useState, useCallback } from "react";
import { ToolHeader } from "@/components/tool-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Hash, RefreshCw, Download, Copy, Trash2 } from "lucide-react";

type UUIDVersion = 'v4' | 'v1' | 'nil' | 'ulid' | 'nanoid';

interface UUIDInfo {
  version: string;
  variant: string;
  timestamp?: string;
}

export default function UUIDGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [version, setVersion] = useState<UUIDVersion>('v4');
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [braces, setBraces] = useState(false);
  const [validateInput, setValidateInput] = useState("");
  const [validationResult, setValidationResult] = useState<UUIDInfo | null>(null);
  const [validationError, setValidationError] = useState("");

  const generateUUIDv4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateUUIDv1 = (): string => {
    // Simplified v1 UUID (time-based)
    const now = Date.now();
    const timeHex = now.toString(16).padStart(12, '0');
    const clockSeq = Math.floor(Math.random() * 0x3fff) | 0x8000;
    const node = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    
    return `${timeHex.slice(-8)}-${timeHex.slice(-12, -8)}-1${timeHex.slice(0, 3)}-${clockSeq.toString(16)}-${node}`;
  };

  const generateNilUUID = (): string => {
    return '00000000-0000-0000-0000-000000000000';
  };

  const generateULID = (): string => {
    const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    const now = Date.now();
    let str = '';
    
    // Timestamp (10 characters)
    let timestamp = now;
    for (let i = 0; i < 10; i++) {
      str = ENCODING[timestamp % 32] + str;
      timestamp = Math.floor(timestamp / 32);
    }
    
    // Random (16 characters)
    for (let i = 0; i < 16; i++) {
      str += ENCODING[Math.floor(Math.random() * 32)];
    }
    
    return str;
  };

  const generateNanoID = (size: number = 21): string => {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
    let id = '';
    for (let i = 0; i < size; i++) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return id;
  };

  const generateUUID = useCallback((): string => {
    let uuid: string;
    
    switch (version) {
      case 'v1':
        uuid = generateUUIDv1();
        break;
      case 'nil':
        uuid = generateNilUUID();
        break;
      case 'ulid':
        uuid = generateULID();
        break;
      case 'nanoid':
        uuid = generateNanoID();
        break;
      case 'v4':
      default:
        uuid = generateUUIDv4();
    }

    // Apply formatting (only for UUID formats, not ULID/NanoID)
    if (version !== 'ulid' && version !== 'nanoid') {
      if (!hyphens) {
        uuid = uuid.replace(/-/g, '');
      }
      if (uppercase) {
        uuid = uuid.toUpperCase();
      }
      if (braces) {
        uuid = `{${uuid}}`;
      }
    }

    return uuid;
  }, [version, uppercase, hyphens, braces]);

  const handleGenerate = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids(newUuids);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
  };

  const handleDownload = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${version}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateUUID = useCallback((input: string) => {
    setValidationError("");
    setValidationResult(null);

    if (!input.trim()) return;

    // Remove braces and hyphens for validation
    const cleaned = input.replace(/[{}\-]/g, '').toLowerCase();

    // Check for nil UUID
    if (cleaned === '00000000000000000000000000000000') {
      setValidationResult({ version: 'Nil UUID', variant: 'N/A' });
      return;
    }

    // Check basic format
    const uuidRegex = /^[0-9a-f]{32}$/;
    if (!uuidRegex.test(cleaned)) {
      // Check for ULID
      const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
      if (ulidRegex.test(input)) {
        setValidationResult({ version: 'ULID', variant: 'Crockford Base32' });
        return;
      }
      setValidationError("Invalid UUID format");
      return;
    }

    // Determine version
    const versionChar = cleaned[12];
    let versionStr = 'Unknown';
    switch (versionChar) {
      case '1': versionStr = 'Version 1 (Time-based)'; break;
      case '2': versionStr = 'Version 2 (DCE Security)'; break;
      case '3': versionStr = 'Version 3 (MD5 hash)'; break;
      case '4': versionStr = 'Version 4 (Random)'; break;
      case '5': versionStr = 'Version 5 (SHA-1 hash)'; break;
      case '6': versionStr = 'Version 6 (Reordered time)'; break;
      case '7': versionStr = 'Version 7 (Unix Epoch time)'; break;
      case '8': versionStr = 'Version 8 (Custom)'; break;
    }

    // Determine variant
    const variantChar = parseInt(cleaned[16], 16);
    let variant = 'Unknown';
    if ((variantChar & 0x8) === 0) {
      variant = 'NCS backward compatibility';
    } else if ((variantChar & 0xc) === 0x8) {
      variant = 'RFC 4122 (Standard)';
    } else if ((variantChar & 0xe) === 0xc) {
      variant = 'Microsoft GUID';
    } else {
      variant = 'Reserved for future use';
    }

    // Extract timestamp for v1
    let timestamp: string | undefined;
    if (versionChar === '1') {
      // v1 timestamp extraction (simplified)
      const timeLow = cleaned.slice(0, 8);
      const timeMid = cleaned.slice(8, 12);
      const timeHi = cleaned.slice(13, 16);
      const timeHex = timeHi + timeMid + timeLow;
      const time100ns = parseInt(timeHex, 16);
      const epochOffset = 122192928000000000n; // Offset from UUID epoch to Unix epoch
      const unixTime = Number((BigInt(time100ns) - epochOffset) / 10000n);
      timestamp = new Date(unixTime).toISOString();
    }

    setValidationResult({ version: versionStr, variant, timestamp });
  }, []);

  const versionDescriptions: Record<UUIDVersion, string> = {
    v4: 'Random UUID - Most common, cryptographically random',
    v1: 'Time-based UUID - Based on timestamp and MAC address',
    nil: 'Nil UUID - All zeros, used as a placeholder',
    ulid: 'ULID - Universally Unique Lexicographically Sortable Identifier',
    nanoid: 'NanoID - Compact, URL-safe unique string identifier',
  };

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        icon={Hash}
        name="UUID Generator"
        description="Generate and validate UUIDs, ULIDs, and NanoIDs"
        suite="Developer"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Generator */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Generate Identifiers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={version} onValueChange={(v) => setVersion(v as UUIDVersion)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v4">UUID v4 (Random)</SelectItem>
                    <SelectItem value="v1">UUID v1 (Time-based)</SelectItem>
                    <SelectItem value="nil">Nil UUID</SelectItem>
                    <SelectItem value="ulid">ULID</SelectItem>
                    <SelectItem value="nanoid">NanoID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Count</Label>
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={100}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleGenerate} className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{versionDescriptions[version]}</p>

            {version !== 'ulid' && version !== 'nanoid' && (
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="uppercase"
                    checked={uppercase}
                    onCheckedChange={(checked) => setUppercase(!!checked)}
                  />
                  <Label htmlFor="uppercase" className="text-sm cursor-pointer">Uppercase</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hyphens"
                    checked={hyphens}
                    onCheckedChange={(checked) => setHyphens(!!checked)}
                  />
                  <Label htmlFor="hyphens" className="text-sm cursor-pointer">Hyphens</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="braces"
                    checked={braces}
                    onCheckedChange={(checked) => setBraces(!!checked)}
                  />
                  <Label htmlFor="braces" className="text-sm cursor-pointer">Braces {'{}'}</Label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated UUIDs */}
        {uuids.length > 0 && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Generated ({uuids.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setUuids([])} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-auto">
                {uuids.map((uuid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 group"
                  >
                    <code className="font-mono text-sm select-all">{uuid}</code>
                    <CopyButton value={uuid} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validator */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Validate & Analyze UUID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={validateInput}
                onChange={(e) => {
                  setValidateInput(e.target.value);
                  validateUUID(e.target.value);
                }}
                placeholder="Enter a UUID to validate..."
                className="flex-1 font-mono"
              />
              <Button variant="outline" onClick={() => { setValidateInput(""); setValidationResult(null); setValidationError(""); }}>
                Clear
              </Button>
            </div>

            {validationError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/50">
                <p className="text-sm text-destructive">{validationError}</p>
              </div>
            )}

            {validationResult && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Version</Label>
                    <p className="font-semibold">{validationResult.version}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Variant</Label>
                    <p className="font-semibold">{validationResult.variant}</p>
                  </div>
                  {validationResult.timestamp && (
                    <div className="md:col-span-2">
                      <Label className="text-xs text-muted-foreground">Timestamp</Label>
                      <p className="font-mono text-sm">{validationResult.timestamp}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <Badge variant="secondary" className="mb-2">UUID v4</Badge>
                <p className="text-xs text-muted-foreground">Randomly generated, 128-bit, collision probability is astronomically low. Best for most use cases.</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <Badge variant="secondary" className="mb-2">UUID v1</Badge>
                <p className="text-xs text-muted-foreground">Based on timestamp and node ID. Can reveal creation time. Good for database ordering.</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <Badge variant="secondary" className="mb-2">ULID</Badge>
                <p className="text-xs text-muted-foreground">Lexicographically sortable, 26 characters. Good for databases that need time ordering.</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <Badge variant="secondary" className="mb-2">NanoID</Badge>
                <p className="text-xs text-muted-foreground">Compact, URL-safe. 21 characters by default. Good for URLs and file names.</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <Badge variant="outline" className="mb-2">Size Comparison</Badge>
                <p className="text-xs font-mono text-muted-foreground">
                  UUID: 36 chars<br />
                  ULID: 26 chars<br />
                  NanoID: 21 chars
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <Badge variant="outline" className="mb-2">Collision Risk</Badge>
                <p className="text-xs text-muted-foreground">
                  UUID v4: 1 in 2^122<br />
                  ULID: 1 in 2^80 per ms<br />
                  NanoID: 1 in 2^126
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client"

import * as React from "react"
import { Hash, Copy, Check, RefreshCw, Eye, EyeOff } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"

type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" | "MD5"

async function computeHash(message: string, algorithm: HashAlgorithm): Promise<string> {
  if (algorithm === "MD5") {
    // MD5 implementation using Web Crypto isn't directly available
    // We'll use a simple implementation for demo purposes
    return computeMD5(message)
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Simple MD5 implementation for educational purposes
function computeMD5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3]
    a = ff(a, b, c, d, k[0], 7, -680876936)
    d = ff(d, a, b, c, k[1], 12, -389564586)
    c = ff(c, d, a, b, k[2], 17, 606105819)
    b = ff(b, c, d, a, k[3], 22, -1044525330)
    a = ff(a, b, c, d, k[4], 7, -176418897)
    d = ff(d, a, b, c, k[5], 12, 1200080426)
    c = ff(c, d, a, b, k[6], 17, -1473231341)
    b = ff(b, c, d, a, k[7], 22, -45705983)
    a = ff(a, b, c, d, k[8], 7, 1770035416)
    d = ff(d, a, b, c, k[9], 12, -1958414417)
    c = ff(c, d, a, b, k[10], 17, -42063)
    b = ff(b, c, d, a, k[11], 22, -1990404162)
    a = ff(a, b, c, d, k[12], 7, 1804603682)
    d = ff(d, a, b, c, k[13], 12, -40341101)
    c = ff(c, d, a, b, k[14], 17, -1502002290)
    b = ff(b, c, d, a, k[15], 22, 1236535329)
    a = gg(a, b, c, d, k[1], 5, -165796510)
    d = gg(d, a, b, c, k[6], 9, -1069501632)
    c = gg(c, d, a, b, k[11], 14, 643717713)
    b = gg(b, c, d, a, k[0], 20, -373897302)
    a = gg(a, b, c, d, k[5], 5, -701558691)
    d = gg(d, a, b, c, k[10], 9, 38016083)
    c = gg(c, d, a, b, k[15], 14, -660478335)
    b = gg(b, c, d, a, k[4], 20, -405537848)
    a = gg(a, b, c, d, k[9], 5, 568446438)
    d = gg(d, a, b, c, k[14], 9, -1019803690)
    c = gg(c, d, a, b, k[3], 14, -187363961)
    b = gg(b, c, d, a, k[8], 20, 1163531501)
    a = gg(a, b, c, d, k[13], 5, -1444681467)
    d = gg(d, a, b, c, k[2], 9, -51403784)
    c = gg(c, d, a, b, k[7], 14, 1735328473)
    b = gg(b, c, d, a, k[12], 20, -1926607734)
    a = hh(a, b, c, d, k[5], 4, -378558)
    d = hh(d, a, b, c, k[8], 11, -2022574463)
    c = hh(c, d, a, b, k[11], 16, 1839030562)
    b = hh(b, c, d, a, k[14], 23, -35309556)
    a = hh(a, b, c, d, k[1], 4, -1530992060)
    d = hh(d, a, b, c, k[4], 11, 1272893353)
    c = hh(c, d, a, b, k[7], 16, -155497632)
    b = hh(b, c, d, a, k[10], 23, -1094730640)
    a = hh(a, b, c, d, k[13], 4, 681279174)
    d = hh(d, a, b, c, k[0], 11, -358537222)
    c = hh(c, d, a, b, k[3], 16, -722521979)
    b = hh(b, c, d, a, k[6], 23, 76029189)
    a = hh(a, b, c, d, k[9], 4, -640364487)
    d = hh(d, a, b, c, k[12], 11, -421815835)
    c = hh(c, d, a, b, k[15], 16, 530742520)
    b = hh(b, c, d, a, k[2], 23, -995338651)
    a = ii(a, b, c, d, k[0], 6, -198630844)
    d = ii(d, a, b, c, k[7], 10, 1126891415)
    c = ii(c, d, a, b, k[14], 15, -1416354905)
    b = ii(b, c, d, a, k[5], 21, -57434055)
    a = ii(a, b, c, d, k[12], 6, 1700485571)
    d = ii(d, a, b, c, k[3], 10, -1894986606)
    c = ii(c, d, a, b, k[10], 15, -1051523)
    b = ii(b, c, d, a, k[1], 21, -2054922799)
    a = ii(a, b, c, d, k[8], 6, 1873313359)
    d = ii(d, a, b, c, k[15], 10, -30611744)
    c = ii(c, d, a, b, k[6], 15, -1560198380)
    b = ii(b, c, d, a, k[13], 21, 1309151649)
    a = ii(a, b, c, d, k[4], 6, -145523070)
    d = ii(d, a, b, c, k[11], 10, -1120210379)
    c = ii(c, d, a, b, k[2], 15, 718787259)
    b = ii(b, c, d, a, k[9], 21, -343485551)
    x[0] = add32(a, x[0])
    x[1] = add32(b, x[1])
    x[2] = add32(c, x[2])
    x[3] = add32(d, x[3])
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t))
    return add32((a << s) | (a >>> (32 - s)), b)
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t)
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t)
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t)
  }
  function md51(s: string) {
    const n = s.length
    const state = [1732584193, -271733879, -1732584194, 271733878]
    let i
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)))
    }
    s = s.substring(i - 64)
    const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3)
    }
    tail[i >> 2] |= 0x80 << (i % 4 << 3)
    if (i > 55) {
      md5cycle(state, tail)
      for (i = 0; i < 16; i++) tail[i] = 0
    }
    tail[14] = n * 8
    md5cycle(state, tail)
    return state
  }
  function md5blk(s: string) {
    const md5blks = []
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] =
        s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24)
    }
    return md5blks
  }
  function rhex(n: number) {
    const hex_chr = "0123456789abcdef"
    let s = ""
    for (let j = 0; j < 4; j++) {
      s += hex_chr.charAt((n >> (j * 8 + 4)) & 0x0f) + hex_chr.charAt((n >> (j * 8)) & 0x0f)
    }
    return s
  }
  function hex(x: number[]) {
    return x.map(rhex).join("")
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff
  }
  return hex(md51(string))
}

export default function CryptoSandboxPage() {
  const [hashInput, setHashInput] = React.useState("Hello, World!")
  const [hashResults, setHashResults] = React.useState<Record<HashAlgorithm, string>>({
    MD5: "",
    "SHA-1": "",
    "SHA-256": "",
    "SHA-384": "",
    "SHA-512": "",
  })
  const [isHashing, setIsHashing] = React.useState(false)

  const [aesKey, setAesKey] = React.useState("")
  const [aesInput, setAesInput] = React.useState("")
  const [aesOutput, setAesOutput] = React.useState("")
  const [aesMode, setAesMode] = React.useState<"encrypt" | "decrypt">("encrypt")
  const [showKey, setShowKey] = React.useState(false)
  const [aesError, setAesError] = React.useState<string | null>(null)

  // Compute all hashes
  React.useEffect(() => {
    const computeAllHashes = async () => {
      if (!hashInput) {
        setHashResults({
          MD5: "",
          "SHA-1": "",
          "SHA-256": "",
          "SHA-384": "",
          "SHA-512": "",
        })
        return
      }

      setIsHashing(true)
      try {
        const algorithms: HashAlgorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"]
        const results: Record<string, string> = {}
        
        for (const algo of algorithms) {
          results[algo] = await computeHash(hashInput, algo)
        }
        
        setHashResults(results as Record<HashAlgorithm, string>)
      } catch (err) {
        console.error("Hash error:", err)
      }
      setIsHashing(false)
    }

    const timer = setTimeout(computeAllHashes, 200)
    return () => clearTimeout(timer)
  }, [hashInput])

  // Generate random key
  const generateKey = () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    setAesKey(Array.from(array).map(b => b.toString(16).padStart(2, "0")).join(""))
  }

  // AES encryption/decryption
  const handleAES = async () => {
    if (!aesKey || !aesInput) {
      setAesError("Please enter both a key and input text")
      return
    }

    if (aesKey.length !== 64) {
      setAesError("Key must be 64 hex characters (256 bits)")
      return
    }

    try {
      const keyBytes = new Uint8Array(aesKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
      )

      if (aesMode === "encrypt") {
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const encoder = new TextEncoder()
        const encrypted = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          cryptoKey,
          encoder.encode(aesInput)
        )
        const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length)
        combined.set(iv)
        combined.set(new Uint8Array(encrypted), iv.length)
        setAesOutput(btoa(String.fromCharCode(...combined)))
        setAesError(null)
      } else {
        const combined = Uint8Array.from(atob(aesInput), c => c.charCodeAt(0))
        const iv = combined.slice(0, 12)
        const data = combined.slice(12)
        const decrypted = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv },
          cryptoKey,
          data
        )
        const decoder = new TextDecoder()
        setAesOutput(decoder.decode(decrypted))
        setAesError(null)
      }
    } catch (err) {
      setAesError(err instanceof Error ? err.message : "Encryption/decryption failed")
      setAesOutput("")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ToolHeader
        icon={Hash}
        name="Cryptography Sandbox"
        description="Generate hashes (MD5, SHA-256, etc.) and test AES encryption"
        suite="Security"
      />

      <Tabs defaultValue="hashing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hashing">Hash Generation</TabsTrigger>
          <TabsTrigger value="aes">AES Encryption</TabsTrigger>
        </TabsList>

        <TabsContent value="hashing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Input Text</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Enter text to hash..."
                className="min-h-[100px] font-mono"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Hash Results</CardTitle>
                {isHashing && (
                  <Badge variant="secondary" className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Computing...
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as HashAlgorithm[]).map((algo) => (
                <div key={algo} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">{algo}</Label>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        {algo === "MD5" ? 128 : algo === "SHA-1" ? 160 : algo === "SHA-256" ? 256 : algo === "SHA-384" ? 384 : 512} bits
                      </Badge>
                      {hashResults[algo] && <CopyButton value={hashResults[algo]} />}
                    </div>
                  </div>
                  <div className="p-2 bg-muted rounded-md font-mono text-xs break-all">
                    {hashResults[algo] || <span className="text-muted-foreground">No input</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hash Algorithm Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">MD5:</strong> 128-bit, considered broken for security. Use only for checksums.</p>
                <p><strong className="text-foreground">SHA-1:</strong> 160-bit, deprecated. Not recommended for security applications.</p>
                <p><strong className="text-foreground">SHA-256:</strong> 256-bit, widely used and secure. Good default choice.</p>
                <p><strong className="text-foreground">SHA-384/512:</strong> Longer output, slightly more secure, better for high-security applications.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AES-256-GCM Encryption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Encryption Key (256-bit hex)</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={generateKey}>
                      Generate Key
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Input
                  type={showKey ? "text" : "password"}
                  value={aesKey}
                  onChange={(e) => setAesKey(e.target.value.replace(/[^0-9a-fA-F]/g, "").toLowerCase())}
                  placeholder="64 hex characters (e.g., a1b2c3d4...)"
                  className="font-mono"
                  maxLength={64}
                />
                <p className="text-xs text-muted-foreground">
                  {aesKey.length}/64 characters
                </p>
              </div>

              <Tabs value={aesMode} onValueChange={(v) => setAesMode(v as "encrypt" | "decrypt")}>
                <TabsList className="w-full">
                  <TabsTrigger value="encrypt" className="flex-1">Encrypt</TabsTrigger>
                  <TabsTrigger value="decrypt" className="flex-1">Decrypt</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label>{aesMode === "encrypt" ? "Plaintext" : "Ciphertext (Base64)"}</Label>
                <Textarea
                  value={aesInput}
                  onChange={(e) => setAesInput(e.target.value)}
                  placeholder={aesMode === "encrypt" ? "Enter text to encrypt..." : "Enter Base64 ciphertext..."}
                  className="min-h-[100px] font-mono"
                />
              </div>

              <Button onClick={handleAES} className="w-full">
                {aesMode === "encrypt" ? "Encrypt" : "Decrypt"}
              </Button>

              {aesError && (
                <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md">
                  <p className="text-sm text-destructive">{aesError}</p>
                </div>
              )}

              {aesOutput && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{aesMode === "encrypt" ? "Ciphertext (Base64)" : "Decrypted Text"}</Label>
                    <CopyButton value={aesOutput} />
                  </div>
                  <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                    {aesOutput}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">About AES-GCM</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-2">
                AES-GCM (Galois/Counter Mode) is an authenticated encryption algorithm that provides
                both confidentiality and integrity protection.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>256-bit key provides strong security</li>
                <li>Random IV (nonce) is generated for each encryption</li>
                <li>Authentication tag ensures data has not been tampered with</li>
                <li>Used in TLS 1.3, SSH, and many modern protocols</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

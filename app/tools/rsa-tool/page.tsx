"use client"

import * as React from "react"
import { KeyRound, RefreshCw, Lock, Unlock } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"

type KeySize = 1024 | 2048 | 4096

interface RSAKeyPair {
  publicKey: string
  privateKey: string
  keySize: KeySize
  generatedAt: Date
}

async function generateRSAKeyPair(keySize: KeySize): Promise<RSAKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  )

  const publicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey)
  const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey)

  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)))
  const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)))

  const formatPEM = (base64: string, type: "PUBLIC" | "PRIVATE") => {
    const lines = base64.match(/.{1,64}/g) || []
    return `-----BEGIN ${type} KEY-----\n${lines.join("\n")}\n-----END ${type} KEY-----`
  }

  return {
    publicKey: formatPEM(publicKeyBase64, "PUBLIC"),
    privateKey: formatPEM(privateKeyBase64, "PRIVATE"),
    keySize,
    generatedAt: new Date(),
  }
}

async function encryptWithPublicKey(publicKeyPEM: string, plaintext: string): Promise<string> {
  // Extract base64 from PEM
  const base64 = publicKeyPEM
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s/g, "")

  const keyBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  
  const publicKey = await crypto.subtle.importKey(
    "spki",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  )

  const encoder = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encoder.encode(plaintext)
  )

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
}

async function decryptWithPrivateKey(privateKeyPEM: string, ciphertext: string): Promise<string> {
  // Extract base64 from PEM
  const base64 = privateKeyPEM
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "")

  const keyBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  )

  const encryptedBuffer = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedBuffer
  )

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

export default function RSAToolPage() {
  const [keySize, setKeySize] = React.useState<KeySize>(2048)
  const [keyPair, setKeyPair] = React.useState<RSAKeyPair | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)

  const [encryptInput, setEncryptInput] = React.useState("")
  const [encryptOutput, setEncryptOutput] = React.useState("")
  const [encryptError, setEncryptError] = React.useState<string | null>(null)

  const [decryptInput, setDecryptInput] = React.useState("")
  const [decryptOutput, setDecryptOutput] = React.useState("")
  const [decryptError, setDecryptError] = React.useState<string | null>(null)

  const handleGenerateKeys = async () => {
    setIsGenerating(true)
    try {
      const newKeyPair = await generateRSAKeyPair(keySize)
      setKeyPair(newKeyPair)
    } catch (err) {
      console.error("Key generation failed:", err)
    }
    setIsGenerating(false)
  }

  const handleEncrypt = async () => {
    if (!keyPair || !encryptInput.trim()) {
      setEncryptError("Please generate keys and enter text to encrypt")
      return
    }

    try {
      const encrypted = await encryptWithPublicKey(keyPair.publicKey, encryptInput)
      setEncryptOutput(encrypted)
      setEncryptError(null)
    } catch (err) {
      setEncryptError(err instanceof Error ? err.message : "Encryption failed")
      setEncryptOutput("")
    }
  }

  const handleDecrypt = async () => {
    if (!keyPair || !decryptInput.trim()) {
      setDecryptError("Please generate keys and enter ciphertext to decrypt")
      return
    }

    try {
      const decrypted = await decryptWithPrivateKey(keyPair.privateKey, decryptInput)
      setDecryptOutput(decrypted)
      setDecryptError(null)
    } catch (err) {
      setDecryptError(err instanceof Error ? err.message : "Decryption failed")
      setDecryptOutput("")
    }
  }

  // Max plaintext size for RSA-OAEP with SHA-256
  const maxPlaintextSize = keySize / 8 - 66

  return (
    <div className="max-w-4xl mx-auto">
      <ToolHeader
        icon={KeyRound}
        name="RSA Key Pair Tool"
        description="Generate RSA key pairs and test asymmetric encryption"
        suite="Security"
      />

      <div className="space-y-6">
        {/* Key Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Generate RSA Key Pair</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Key Size:</Label>
                <Select value={String(keySize)} onValueChange={(v) => setKeySize(Number(v) as KeySize)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024">1024 bits</SelectItem>
                    <SelectItem value="2048">2048 bits</SelectItem>
                    <SelectItem value="4096">4096 bits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateKeys} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Keys
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Recommendation: Use 2048-bit for general use, 4096-bit for high security.</p>
              <p>1024-bit is considered weak and should only be used for educational purposes.</p>
            </div>
          </CardContent>
        </Card>

        {keyPair && (
          <>
            {/* Generated Keys */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Unlock className="h-4 w-4 text-success" />
                      Public Key
                    </CardTitle>
                    <CopyButton value={keyPair.publicKey} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={keyPair.publicKey}
                    readOnly
                    className="min-h-[200px] font-mono text-[10px] bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Share this key with others to receive encrypted messages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lock className="h-4 w-4 text-destructive" />
                      Private Key
                    </CardTitle>
                    <CopyButton value={keyPair.privateKey} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={keyPair.privateKey}
                    readOnly
                    className="min-h-[200px] font-mono text-[10px] bg-muted"
                  />
                  <p className="text-xs text-destructive mt-2">
                    Keep this key secret! Never share your private key.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Key Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Key Size:</span>
                    <Badge variant="secondary">{keyPair.keySize} bits</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Algorithm:</span>
                    <Badge variant="secondary">RSA-OAEP</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Hash:</span>
                    <Badge variant="secondary">SHA-256</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Max Plaintext:</span>
                    <Badge variant="outline">{maxPlaintextSize} bytes</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Encrypt/Decrypt */}
            <Tabs defaultValue="encrypt" className="space-y-4">
              <TabsList>
                <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
                <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
              </TabsList>

              <TabsContent value="encrypt" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Encrypt with Public Key</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Plaintext (max {maxPlaintextSize} bytes)</Label>
                      <Textarea
                        value={encryptInput}
                        onChange={(e) => setEncryptInput(e.target.value)}
                        placeholder="Enter text to encrypt..."
                        className="min-h-[100px] font-mono"
                        maxLength={maxPlaintextSize}
                      />
                      <p className="text-xs text-muted-foreground">
                        {encryptInput.length}/{maxPlaintextSize} characters
                      </p>
                    </div>

                    <Button onClick={handleEncrypt} className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Encrypt
                    </Button>

                    {encryptError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md">
                        <p className="text-sm text-destructive">{encryptError}</p>
                      </div>
                    )}

                    {encryptOutput && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Ciphertext (Base64)</Label>
                          <CopyButton value={encryptOutput} />
                        </div>
                        <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                          {encryptOutput}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="decrypt" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Decrypt with Private Key</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Ciphertext (Base64)</Label>
                      <Textarea
                        value={decryptInput}
                        onChange={(e) => setDecryptInput(e.target.value)}
                        placeholder="Enter Base64 ciphertext to decrypt..."
                        className="min-h-[100px] font-mono"
                      />
                    </div>

                    <Button onClick={handleDecrypt} className="w-full">
                      <Unlock className="h-4 w-4 mr-2" />
                      Decrypt
                    </Button>

                    {decryptError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md">
                        <p className="text-sm text-destructive">{decryptError}</p>
                      </div>
                    )}

                    {decryptOutput && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Decrypted Text</Label>
                          <CopyButton value={decryptOutput} />
                        </div>
                        <div className="p-3 bg-muted rounded-md font-mono text-sm">
                          {decryptOutput}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* About RSA */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">About RSA Encryption</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              RSA (Rivest-Shamir-Adleman) is an asymmetric cryptographic algorithm that uses a pair 
              of mathematically related keys:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Public Key</strong> - Used to encrypt messages. Can be shared freely.</li>
              <li><strong>Private Key</strong> - Used to decrypt messages. Must be kept secret.</li>
            </ul>
            <p>
              RSA security is based on the mathematical difficulty of factoring the product of two 
              large prime numbers. The larger the key size, the harder it is to break.
            </p>
            <div className="p-3 bg-warning/10 border border-warning/50 rounded-md mt-4">
              <p className="text-warning-foreground">
                <strong>Note:</strong> RSA is typically used to encrypt small amounts of data 
                (like symmetric keys) due to its size limitations and computational cost. For 
                encrypting large data, use hybrid encryption (RSA + AES).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

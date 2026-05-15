"use client"

import * as React from "react"
import { Key, AlertCircle, CheckCircle, Clock, Lock, Unlock, Sparkles } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface JWTPayload {
  [key: string]: unknown
  iat?: number
  exp?: number
  nbf?: number
  iss?: string
  sub?: string
  aud?: string | string[]
}

interface DecodedJWT {
  header: Record<string, unknown>
  payload: JWTPayload
  signature: string
  isExpired: boolean
  expiresAt?: Date
  issuedAt?: Date
  notBefore?: Date
}

/* -------------------------- Base64URL helpers -------------------------- */

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str))
}

function base64UrlDecodeToString(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/")
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4))
  return atob(padded + pad)
}

/* ----------------------------- Decode logic ---------------------------- */

function decodeJWT(token: string): DecodedJWT | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const header = JSON.parse(base64UrlDecodeToString(parts[0]))
    const payload = JSON.parse(base64UrlDecodeToString(parts[1]))
    const signature = parts[2]

    const now = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp ? payload.exp < now : false

    return {
      header,
      payload,
      signature,
      isExpired,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined,
      issuedAt: payload.iat ? new Date(payload.iat * 1000) : undefined,
      notBefore: payload.nbf ? new Date(payload.nbf * 1000) : undefined,
    }
  } catch {
    return null
  }
}

/* ----------------------------- Encode logic ---------------------------- */

const ALG_TO_HASH: Record<string, string> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
}

async function signJWT(
  headerJson: string,
  payloadJson: string,
  secret: string,
  algorithm: string
): Promise<string> {
  const headerObj = JSON.parse(headerJson)
  const payloadObj = JSON.parse(payloadJson)
  headerObj.alg = algorithm
  if (!headerObj.typ) headerObj.typ = "JWT"

  const encodedHeader = base64UrlEncodeString(JSON.stringify(headerObj))
  const encodedPayload = base64UrlEncodeString(JSON.stringify(payloadObj))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const hash = ALG_TO_HASH[algorithm]
  if (!hash) throw new Error(`Unsupported algorithm: ${algorithm}`)

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash },
    false,
    ["sign"]
  )
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput)
  )
  const signature = base64UrlEncode(new Uint8Array(sigBuffer))
  return `${signingInput}.${signature}`
}

/* --------------------------------- UI ---------------------------------- */

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzY4OTkyMDAsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

const CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: "Issuer - identifies the principal that issued the JWT",
  sub: "Subject - identifies the principal that is the subject of the JWT",
  aud: "Audience - identifies the recipients the JWT is intended for",
  exp: "Expiration Time - identifies the time after which the JWT must not be accepted",
  nbf: "Not Before - identifies the time before which the JWT must not be accepted",
  iat: "Issued At - identifies the time at which the JWT was issued",
  jti: "JWT ID - provides a unique identifier for the JWT",
}

const DEFAULT_HEADER = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2)
const DEFAULT_PAYLOAD = JSON.stringify(
  {
    sub: "1234567890",
    name: "John Doe",
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  },
  null,
  2
)

export default function JWTToolPage() {
  /* ----- Decoder state ----- */
  const [input, setInput] = React.useState("")
  const [decoded, setDecoded] = React.useState<DecodedJWT | null>(null)
  const [decodeError, setDecodeError] = React.useState<string | null>(null)

  /* ----- Encoder state ----- */
  const [algorithm, setAlgorithm] = React.useState("HS256")
  const [headerJson, setHeaderJson] = React.useState(DEFAULT_HEADER)
  const [payloadJson, setPayloadJson] = React.useState(DEFAULT_PAYLOAD)
  const [secret, setSecret] = React.useState("your-256-bit-secret")
  const [encodedToken, setEncodedToken] = React.useState("")
  const [encodeError, setEncodeError] = React.useState<string | null>(null)

  /* ----- Decoder effect ----- */
  React.useEffect(() => {
    if (!input.trim()) {
      setDecoded(null)
      setDecodeError(null)
      return
    }
    const result = decodeJWT(input.trim())
    if (result) {
      setDecoded(result)
      setDecodeError(null)
    } else {
      setDecoded(null)
      setDecodeError(
        "Invalid JWT format. Make sure you have a valid token with three parts separated by dots."
      )
    }
  }, [input])

  /* ----- Encoder effect ----- */
  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        if (!headerJson.trim() || !payloadJson.trim()) {
          setEncodedToken("")
          setEncodeError(null)
          return
        }
        // Validate JSON eagerly so we get nice errors.
        JSON.parse(headerJson)
        JSON.parse(payloadJson)
        const token = await signJWT(headerJson, payloadJson, secret, algorithm)
        if (!cancelled) {
          setEncodedToken(token)
          setEncodeError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setEncodedToken("")
          setEncodeError(err instanceof Error ? err.message : "Failed to sign token")
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [headerJson, payloadJson, secret, algorithm])

  const handleLoadSample = () => setInput(SAMPLE_JWT)
  const handleUseInDecoder = () => setInput(encodedToken)
  const handleResetEncoder = () => {
    setAlgorithm("HS256")
    setHeaderJson(DEFAULT_HEADER)
    setPayloadJson(
      JSON.stringify(
        {
          sub: "1234567890",
          name: "John Doe",
          role: "admin",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        },
        null,
        2
      )
    )
    setSecret("your-256-bit-secret")
  }

  const formatDate = (date: Date) => date.toLocaleString()

  const getTimeRemaining = (expDate: Date) => {
    const now = new Date()
    const diff = expDate.getTime() - now.getTime()
    if (diff < 0) {
      const elapsed = Math.abs(diff)
      const days = Math.floor(elapsed / (1000 * 60 * 60 * 24))
      const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      return `Expired ${days > 0 ? `${days}d ` : ""}${hours}h ago`
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  /* --------------------------- Render --------------------------- */

  return (
    <div className="max-w-4xl mx-auto">
      <ToolHeader
        icon={Key}
        name="JWT Encoder & Decoder"
        description="Encode and sign tokens, then inspect their headers, payloads, and expiration"
        suite="Security"
      />

      <Tabs defaultValue="decode" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="decode" className="gap-2">
            <Unlock className="h-4 w-4" />
            Decode
          </TabsTrigger>
          <TabsTrigger value="encode" className="gap-2">
            <Lock className="h-4 w-4" />
            Encode
          </TabsTrigger>
        </TabsList>

        {/* =============================== DECODE =============================== */}
        <TabsContent value="decode" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">JWT Token</CardTitle>
                <Button variant="outline" size="sm" onClick={handleLoadSample}>
                  Load Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your JWT token here..."
                className="min-h-[100px] font-mono text-sm break-all"
              />
            </CardContent>
          </Card>

          {decodeError && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">Invalid Token</p>
                    <p className="text-sm text-muted-foreground mt-1">{decodeError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {decoded && (
            <>
              {/* Status Banner */}
              <Card
                className={cn(
                  "border",
                  decoded.isExpired
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-success/50 bg-success/5"
                )}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {decoded.isExpired ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          decoded.isExpired ? "text-destructive" : "text-success"
                        )}
                      >
                        {decoded.isExpired ? "Token Expired" : "Token Valid"}
                      </span>
                    </div>
                    {decoded.expiresAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {getTimeRemaining(decoded.expiresAt)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="decoded" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="decoded">Decoded</TabsTrigger>
                  <TabsTrigger value="header">Header</TabsTrigger>
                  <TabsTrigger value="payload">Payload</TabsTrigger>
                </TabsList>

                <TabsContent value="decoded" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Header</CardTitle>
                        <Badge variant="secondary">
                          {(decoded.header.alg as string) || "Unknown Algorithm"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Algorithm</span>
                          <span className="font-mono">
                            {(decoded.header.alg as string) || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-mono">
                            {(decoded.header.typ as string) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Registered Claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {decoded.issuedAt && (
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-sm font-medium">Issued At (iat)</p>
                              <p className="text-xs text-muted-foreground">
                                {CLAIM_DESCRIPTIONS.iat}
                              </p>
                            </div>
                            <span className="text-sm font-mono text-right">
                              {formatDate(decoded.issuedAt)}
                            </span>
                          </div>
                        )}
                        {decoded.expiresAt && (
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-sm font-medium">Expires At (exp)</p>
                              <p className="text-xs text-muted-foreground">
                                {CLAIM_DESCRIPTIONS.exp}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "text-sm font-mono text-right",
                                decoded.isExpired && "text-destructive"
                              )}
                            >
                              {formatDate(decoded.expiresAt)}
                            </span>
                          </div>
                        )}
                        {decoded.notBefore && (
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-sm font-medium">Not Before (nbf)</p>
                              <p className="text-xs text-muted-foreground">
                                {CLAIM_DESCRIPTIONS.nbf}
                              </p>
                            </div>
                            <span className="text-sm font-mono text-right">
                              {formatDate(decoded.notBefore)}
                            </span>
                          </div>
                        )}
                        {decoded.payload.iss && (
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-sm font-medium">Issuer (iss)</p>
                              <p className="text-xs text-muted-foreground">
                                {CLAIM_DESCRIPTIONS.iss}
                              </p>
                            </div>
                            <span className="text-sm font-mono text-right">
                              {decoded.payload.iss}
                            </span>
                          </div>
                        )}
                        {decoded.payload.sub && (
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-sm font-medium">Subject (sub)</p>
                              <p className="text-xs text-muted-foreground">
                                {CLAIM_DESCRIPTIONS.sub}
                              </p>
                            </div>
                            <span className="text-sm font-mono text-right">
                              {decoded.payload.sub}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Custom Claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(decoded.payload)
                          .filter(
                            ([key]) =>
                              !["iat", "exp", "nbf", "iss", "sub", "aud", "jti"].includes(key)
                          )
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between gap-4">
                              <span className="text-sm text-muted-foreground">{key}</span>
                              <span className="text-sm font-mono text-right break-all">
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="header">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Header (JSON)</CardTitle>
                        <CopyButton value={JSON.stringify(decoded.header, null, 2)} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="p-4 bg-muted rounded-md font-mono text-sm overflow-x-auto">
                        {JSON.stringify(decoded.header, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payload">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Payload (JSON)</CardTitle>
                        <CopyButton value={JSON.stringify(decoded.payload, null, 2)} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="p-4 bg-muted rounded-md font-mono text-sm overflow-x-auto">
                        {JSON.stringify(decoded.payload, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Signature</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Verification requires secret key
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                    {decoded.signature}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Signature verification requires the secret key used to sign the token.
                    This tool only decodes the token without verification.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* =============================== ENCODE =============================== */}
        <TabsContent value="encode" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-sm">Token Configuration</CardTitle>
                <Button variant="outline" size="sm" onClick={handleResetEncoder}>
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jwt-algorithm">Algorithm</Label>
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger id="jwt-algorithm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HS256">HS256 (HMAC-SHA256)</SelectItem>
                      <SelectItem value="HS384">HS384 (HMAC-SHA384)</SelectItem>
                      <SelectItem value="HS512">HS512 (HMAC-SHA512)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jwt-secret">Secret Key</Label>
                  <Textarea
                    id="jwt-secret"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="your-256-bit-secret"
                    className="min-h-[40px] font-mono text-sm resize-none"
                    rows={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Header</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    alg overridden by selection
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={headerJson}
                  onChange={(e) => setHeaderJson(e.target.value)}
                  className="min-h-[160px] font-mono text-sm"
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Payload</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={payloadJson}
                  onChange={(e) => setPayloadJson(e.target.value)}
                  className="min-h-[160px] font-mono text-sm"
                  spellCheck={false}
                />
              </CardContent>
            </Card>
          </div>

          {encodeError && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">Encoding Error</p>
                    <p className="text-sm text-muted-foreground mt-1 break-words">
                      {encodeError}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Signed JWT</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {encodedToken && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUseInDecoder}
                      className="gap-2"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      Open in Decoder
                    </Button>
                  )}
                  <CopyButton value={encodedToken} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {encodedToken ? (
                <div className="p-3 bg-muted rounded-md font-mono text-xs break-all leading-relaxed">
                  {(() => {
                    const [h, p, s] = encodedToken.split(".")
                    return (
                      <>
                        <span className="text-[color:var(--chart-1)]">{h}</span>
                        <span className="text-muted-foreground">.</span>
                        <span className="text-[color:var(--chart-2)]">{p}</span>
                        <span className="text-muted-foreground">.</span>
                        <span className="text-[color:var(--chart-3)]">{s}</span>
                      </>
                    )
                  })()}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Provide a valid header and payload to generate a token.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                The token is signed with HMAC using your secret. All signing happens locally
                in your browser via the Web Crypto API — your secret never leaves this page.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">About JWTs</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-3">
            JSON Web Tokens (JWTs) are a compact, URL-safe means of representing claims
            between two parties. A JWT consists of three parts separated by dots:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Header</strong> — Contains the token type and signing algorithm
            </li>
            <li>
              <strong>Payload</strong> — Contains the claims (statements about the user)
            </li>
            <li>
              <strong>Signature</strong> — Verifies the token was not tampered with
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

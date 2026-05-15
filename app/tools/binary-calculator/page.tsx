"use client"

import * as React from "react"
import { Calculator, RotateCcw } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"

type BitWidth = 8 | 16 | 32 | 64

function BitVisualizer({ 
  value, 
  bits, 
  onBitClick 
}: { 
  value: bigint
  bits: BitWidth
  onBitClick?: (index: number) => void 
}) {
  const bitArray = []
  for (let i = bits - 1; i >= 0; i--) {
    bitArray.push((value >> BigInt(i)) & 1n)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-0.5">
        {bitArray.map((bit, index) => {
          const bitIndex = bits - 1 - index
          const isGroupStart = (bits - index) % 8 === 0 && index !== 0
          
          return (
            <React.Fragment key={index}>
              {isGroupStart && <div className="w-2" />}
              <button
                onClick={() => onBitClick?.(bitIndex)}
                className={cn(
                  "w-6 h-8 text-xs font-mono rounded border transition-colors",
                  bit === 1n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {bit.toString()}
              </button>
            </React.Fragment>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-0.5 text-[10px] text-muted-foreground font-mono">
        {bitArray.map((_, index) => {
          const bitIndex = bits - 1 - index
          const isGroupStart = (bits - index) % 8 === 0 && index !== 0
          
          return (
            <React.Fragment key={index}>
              {isGroupStart && <div className="w-2" />}
              <div className="w-6 text-center">{bitIndex}</div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default function BinaryCalculatorPage() {
  const [decimal, setDecimal] = React.useState("42")
  const [binary, setBinary] = React.useState("")
  const [hex, setHex] = React.useState("")
  const [octal, setOctal] = React.useState("")
  const [bits, setBits] = React.useState<BitWidth>(8)
  const [signed, setSigned] = React.useState(false)
  const [activeInput, setActiveInput] = React.useState<"decimal" | "binary" | "hex" | "octal">("decimal")

  const maxValue = React.useMemo(() => {
    if (signed) {
      return (1n << BigInt(bits - 1)) - 1n
    }
    return (1n << BigInt(bits)) - 1n
  }, [bits, signed])

  const minValue = React.useMemo(() => {
    if (signed) {
      return -(1n << BigInt(bits - 1))
    }
    return 0n
  }, [bits, signed])

  const currentValue = React.useMemo(() => {
    try {
      let val = 0n
      switch (activeInput) {
        case "decimal":
          val = BigInt(decimal || "0")
          break
        case "binary":
          val = BigInt("0b" + (binary || "0"))
          break
        case "hex":
          val = BigInt("0x" + (hex || "0"))
          break
        case "octal":
          val = BigInt("0o" + (octal || "0"))
          break
      }
      
      // Handle signed conversion for display
      if (signed && val > maxValue) {
        val = val - (1n << BigInt(bits))
      }
      
      return val
    } catch {
      return 0n
    }
  }, [decimal, binary, hex, octal, activeInput, bits, signed, maxValue])

  const unsignedValue = React.useMemo(() => {
    if (currentValue < 0n) {
      return currentValue + (1n << BigInt(bits))
    }
    return currentValue & ((1n << BigInt(bits)) - 1n)
  }, [currentValue, bits])

  // Update all fields when value changes
  React.useEffect(() => {
    const mask = (1n << BigInt(bits)) - 1n
    const displayValue = unsignedValue & mask
    
    if (activeInput !== "decimal") {
      setDecimal(signed ? currentValue.toString() : displayValue.toString())
    }
    if (activeInput !== "binary") {
      setBinary(displayValue.toString(2).padStart(bits, "0"))
    }
    if (activeInput !== "hex") {
      setHex(displayValue.toString(16).toUpperCase().padStart(bits / 4, "0"))
    }
    if (activeInput !== "octal") {
      setOctal(displayValue.toString(8))
    }
  }, [currentValue, unsignedValue, bits, activeInput, signed])

  const handleBitClick = (index: number) => {
    const newValue = unsignedValue ^ (1n << BigInt(index))
    setDecimal(newValue.toString())
    setActiveInput("decimal")
  }

  const handleReset = () => {
    setDecimal("0")
    setBinary("0")
    setHex("0")
    setOctal("0")
    setActiveInput("decimal")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ToolHeader
        icon={Calculator}
        name="Binary Calculator"
        description="Advanced binary operations with bit visualization and two's complement support"
        suite="Data & Encoding"
      />

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Label>Bit Width:</Label>
          <Select value={String(bits)} onValueChange={(v) => setBits(Number(v) as BitWidth)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8-bit</SelectItem>
              <SelectItem value="16">16-bit</SelectItem>
              <SelectItem value="32">32-bit</SelectItem>
              <SelectItem value="64">64-bit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={signed ? "signed" : "unsigned"} onValueChange={(v) => setSigned(v === "signed")}>
          <TabsList>
            <TabsTrigger value="unsigned">Unsigned</TabsTrigger>
            <TabsTrigger value="signed">Signed</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" /> Reset
        </Button>
      </div>

      {/* Bit Visualizer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Bit Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <BitVisualizer 
            value={unsignedValue} 
            bits={bits} 
            onBitClick={handleBitClick}
          />
          <p className="text-xs text-muted-foreground mt-3">
            Click on individual bits to toggle them. Most significant bit (MSB) is on the left.
          </p>
        </CardContent>
      </Card>

      {/* Conversion Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Decimal (Base 10)</CardTitle>
              <CopyButton value={decimal} />
            </div>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              value={decimal}
              onChange={(e) => {
                setDecimal(e.target.value)
                setActiveInput("decimal")
              }}
              onFocus={() => setActiveInput("decimal")}
              placeholder="Enter decimal number"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Range: {minValue.toString()} to {maxValue.toString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Binary (Base 2)</CardTitle>
              <CopyButton value={binary} />
            </div>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              value={binary}
              onChange={(e) => {
                setBinary(e.target.value.replace(/[^01]/g, ""))
                setActiveInput("binary")
              }}
              onFocus={() => setActiveInput("binary")}
              placeholder="Enter binary number"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {bits} bits = {bits} binary digits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Hexadecimal (Base 16)</CardTitle>
              <CopyButton value={hex} />
            </div>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              value={hex}
              onChange={(e) => {
                setHex(e.target.value.replace(/[^0-9a-fA-F]/g, "").toUpperCase())
                setActiveInput("hex")
              }}
              onFocus={() => setActiveInput("hex")}
              placeholder="Enter hex number"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {bits} bits = {bits / 4} hex digits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Octal (Base 8)</CardTitle>
              <CopyButton value={octal} />
            </div>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              value={octal}
              onChange={(e) => {
                setOctal(e.target.value.replace(/[^0-7]/g, ""))
                setActiveInput("octal")
              }}
              onFocus={() => setActiveInput("octal")}
              placeholder="Enter octal number"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Digits 0-7 only
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two's Complement Info */}
      {signed && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Two&apos;s Complement</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              In two&apos;s complement representation, the most significant bit (MSB) indicates the sign:
              0 for positive, 1 for negative. Negative numbers are stored as the two&apos;s complement
              of their absolute value.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="font-medium text-foreground">Current Value</p>
                <p className="font-mono">{currentValue.toString()} (signed)</p>
                <p className="font-mono">{unsignedValue.toString()} (unsigned)</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Sign Bit</p>
                <p className="font-mono">
                  {(unsignedValue >> BigInt(bits - 1)) === 1n ? "1 (negative)" : "0 (positive)"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

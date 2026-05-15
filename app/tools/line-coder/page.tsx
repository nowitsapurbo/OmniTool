"use client"

import * as React from "react"
import { Waves } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type EncodingType = "nrz-l" | "nrz-i" | "manchester" | "differential-manchester"

interface Segment {
  x1: number
  x2: number
  y: number
}

interface Transition {
  x: number
  fromY: number
  toY: number
}

function generateSignal(
  bits: string,
  encoding: EncodingType,
  width: number,
  highY: number,
  lowY: number
): { segments: Segment[]; transitions: Transition[] } {
  const bitArray = bits.split("").filter((b) => b === "0" || b === "1")
  if (bitArray.length === 0) {
    return { segments: [], transitions: [] }
  }

  const bitWidth = width / bitArray.length
  const segments: Segment[] = []
  const transitions: Transition[] = []
  let currentLevel = lowY

  const addSegment = (x1: number, x2: number, y: number) => {
    segments.push({ x1, x2, y })
  }

  const addTransition = (x: number, fromY: number, toY: number) => {
    if (fromY !== toY) {
      transitions.push({ x, fromY, toY })
    }
  }

  bitArray.forEach((bit, index) => {
    const startX = index * bitWidth
    const midX = startX + bitWidth / 2
    const endX = startX + bitWidth

    switch (encoding) {
      case "nrz-l": {
        // NRZ-L: 1 = high, 0 = low. No transition within bit.
        const targetY = bit === "1" ? highY : lowY
        if (index === 0) {
          currentLevel = targetY
        } else {
          addTransition(startX, currentLevel, targetY)
          currentLevel = targetY
        }
        addSegment(startX, endX, targetY)
        break
      }

      case "nrz-i": {
        // NRZ-I: Transition at start of bit for 1, no transition for 0.
        if (index === 0) {
          currentLevel = bit === "1" ? highY : lowY
        } else if (bit === "1") {
          const newLevel = currentLevel === highY ? lowY : highY
          addTransition(startX, currentLevel, newLevel)
          currentLevel = newLevel
        }
        addSegment(startX, endX, currentLevel)
        break
      }

      case "manchester": {
        // Manchester (IEEE 802.3): 1 = low-to-high at mid, 0 = high-to-low at mid.
        const firstHalf = bit === "1" ? lowY : highY
        const secondHalf = bit === "1" ? highY : lowY

        if (index > 0) {
          addTransition(startX, currentLevel, firstHalf)
        }
        addSegment(startX, midX, firstHalf)
        addTransition(midX, firstHalf, secondHalf)
        addSegment(midX, endX, secondHalf)
        currentLevel = secondHalf
        break
      }

      case "differential-manchester": {
        // Differential Manchester: Always transition at mid.
        // Transition at start for 0, no transition at start for 1.
        let firstHalf: number
        if (index === 0) {
          firstHalf = lowY
        } else if (bit === "0") {
          firstHalf = currentLevel === highY ? lowY : highY
          addTransition(startX, currentLevel, firstHalf)
        } else {
          firstHalf = currentLevel
        }
        const secondHalf = firstHalf === highY ? lowY : highY

        addSegment(startX, midX, firstHalf)
        addTransition(midX, firstHalf, secondHalf)
        addSegment(midX, endX, secondHalf)
        currentLevel = secondHalf
        break
      }
    }
  })

  return { segments, transitions }
}

export default function LineCoderPage() {
  const [input, setInput] = React.useState("10110010")
  const [encoding, setEncoding] = React.useState<EncodingType>("nrz-l")

  // Larger SVG canvas for clearer visualization
  const svgWidth = 800
  const signalHeight = 200
  const topPadding = 30
  const bottomPadding = 60
  const leftPadding = 50
  const rightPadding = 20
  const totalWidth = svgWidth + leftPadding + rightPadding
  const totalHeight = signalHeight + topPadding + bottomPadding

  const highY = topPadding + signalHeight * 0.2
  const lowY = topPadding + signalHeight * 0.8
  const zeroY = topPadding + signalHeight * 0.5

  const bitArray = input.split("").filter((b) => b === "0" || b === "1")
  const bitWidth = bitArray.length > 0 ? svgWidth / bitArray.length : svgWidth

  const { segments, transitions } = React.useMemo(
    () => generateSignal(input, encoding, svgWidth, highY, lowY),
    [input, encoding, highY, lowY]
  )

  const encodingInfo: Record<EncodingType, { name: string; description: string }> = {
    "nrz-l": {
      name: "NRZ-L (Non-Return to Zero Level)",
      description:
        "Binary 1 is represented by high voltage (+V), binary 0 by low voltage (-V). No transition occurs during the bit interval.",
    },
    "nrz-i": {
      name: "NRZ-I (Non-Return to Zero Inverted)",
      description:
        "Binary 1 causes a transition at the beginning of the bit interval. Binary 0 causes no transition. Provides better synchronization than NRZ-L.",
    },
    manchester: {
      name: "Manchester (IEEE 802.3)",
      description:
        "Binary 1 is represented by a low-to-high transition at the middle of the bit. Binary 0 is a high-to-low transition. Self-clocking code used in Ethernet.",
    },
    "differential-manchester": {
      name: "Differential Manchester",
      description:
        "Always has a transition at the middle of the bit. Binary 0 has a transition at the beginning; binary 1 has no transition at the beginning. Used in Token Ring.",
    },
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ToolHeader
        icon={Waves}
        name="Digital Signal Line Coder"
        description="Visualize NRZ-L, NRZ-I, Manchester, and Differential Manchester encoding schemes"
        suite="Data & Encoding"
      />

      <div className="space-y-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Binary Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="binary-input">Enter binary string (0s and 1s only)</Label>
                <Input
                  id="binary-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value.replace(/[^01]/g, ""))}
                  placeholder="e.g., 10110010"
                  className="font-mono text-lg tracking-widest"
                  maxLength={16}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setInput("10110010")}>
                  Sample 1
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInput("11001010")}>
                  Sample 2
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInput("01010101")}>
                  Alternating
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encoding Selection */}
        <Tabs value={encoding} onValueChange={(v) => setEncoding(v as EncodingType)}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="nrz-l">NRZ-L</TabsTrigger>
            <TabsTrigger value="nrz-i">NRZ-I</TabsTrigger>
            <TabsTrigger value="manchester">Manchester</TabsTrigger>
            <TabsTrigger value="differential-manchester">Diff. Manchester</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Signal Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{encodingInfo[encoding].name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/40 rounded-lg p-4 sm:p-6 overflow-x-auto border border-border">
              <svg
                viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                className="w-full"
                style={{ minWidth: "600px", height: "auto" }}
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Voltage level reference lines */}
                {/* +V dashed line */}
                <line
                  x1={leftPadding}
                  y1={highY}
                  x2={leftPadding + svgWidth}
                  y2={highY}
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeDasharray="6 4"
                  strokeWidth="1"
                />
                <text
                  x={leftPadding - 10}
                  y={highY + 4}
                  fill="currentColor"
                  className="fill-muted-foreground"
                  fontSize="13"
                  fontWeight="600"
                  textAnchor="end"
                >
                  +V
                </text>

                {/* Zero line */}
                <line
                  x1={leftPadding}
                  y1={zeroY}
                  x2={leftPadding + svgWidth}
                  y2={zeroY}
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeWidth="1"
                />
                <text
                  x={leftPadding - 10}
                  y={zeroY + 4}
                  fill="currentColor"
                  className="fill-muted-foreground"
                  fontSize="12"
                  textAnchor="end"
                >
                  0
                </text>

                {/* -V dashed line */}
                <line
                  x1={leftPadding}
                  y1={lowY}
                  x2={leftPadding + svgWidth}
                  y2={lowY}
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeDasharray="6 4"
                  strokeWidth="1"
                />
                <text
                  x={leftPadding - 10}
                  y={lowY + 4}
                  fill="currentColor"
                  className="fill-muted-foreground"
                  fontSize="13"
                  fontWeight="600"
                  textAnchor="end"
                >
                  -V
                </text>

                {/* Bit interval boundaries (vertical lines) */}
                {bitArray.map((_, index) => (
                  <line
                    key={`boundary-${index}`}
                    x1={leftPadding + index * bitWidth}
                    y1={topPadding}
                    x2={leftPadding + index * bitWidth}
                    y2={topPadding + signalHeight}
                    stroke="currentColor"
                    strokeOpacity="0.15"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                ))}
                {/* Closing boundary */}
                <line
                  x1={leftPadding + svgWidth}
                  y1={topPadding}
                  x2={leftPadding + svgWidth}
                  y2={topPadding + signalHeight}
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                />

                {/* Mid-bit markers (for Manchester encoding clarity) */}
                {(encoding === "manchester" || encoding === "differential-manchester") &&
                  bitArray.map((_, index) => (
                    <line
                      key={`mid-${index}`}
                      x1={leftPadding + index * bitWidth + bitWidth / 2}
                      y1={topPadding + 5}
                      x2={leftPadding + index * bitWidth + bitWidth / 2}
                      y2={topPadding + signalHeight - 5}
                      stroke="currentColor"
                      strokeOpacity="0.08"
                      strokeWidth="1"
                    />
                  ))}

                {/* Signal segments (horizontal lines) */}
                {segments.map((seg, index) => (
                  <line
                    key={`seg-${index}`}
                    x1={leftPadding + seg.x1}
                    y1={seg.y}
                    x2={leftPadding + seg.x2}
                    y2={seg.y}
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="square"
                  />
                ))}

                {/* Vertical transitions */}
                {transitions.map((t, index) => (
                  <line
                    key={`trans-${index}`}
                    x1={leftPadding + t.x}
                    y1={t.fromY}
                    x2={leftPadding + t.x}
                    y2={t.toY}
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="square"
                  />
                ))}

                {/* Transition dots for emphasis */}
                {transitions.map((t, index) => (
                  <g key={`dot-${index}`}>
                    <circle
                      cx={leftPadding + t.x}
                      cy={t.fromY}
                      r="3"
                      fill="#22c55e"
                    />
                    <circle
                      cx={leftPadding + t.x}
                      cy={t.toY}
                      r="3"
                      fill="#22c55e"
                    />
                  </g>
                ))}

                {/* Bit labels above signal */}
                {bitArray.map((bit, index) => (
                  <g key={`label-${index}`}>
                    <rect
                      x={leftPadding + index * bitWidth + bitWidth / 2 - 14}
                      y={topPadding - 26}
                      width="28"
                      height="22"
                      rx="4"
                      fill={bit === "1" ? "#22c55e" : "currentColor"}
                      fillOpacity={bit === "1" ? "1" : "0.12"}
                      stroke="currentColor"
                      strokeOpacity="0.3"
                      strokeWidth="1"
                    />
                    <text
                      x={leftPadding + index * bitWidth + bitWidth / 2}
                      y={topPadding - 10}
                      fill={bit === "1" ? "#ffffff" : "currentColor"}
                      className={bit === "1" ? "" : "fill-foreground"}
                      fontSize="14"
                      fontFamily="ui-monospace, monospace"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {bit}
                    </text>
                  </g>
                ))}

                {/* Time axis label */}
                {bitArray.map((_, index) => (
                  <text
                    key={`time-${index}`}
                    x={leftPadding + index * bitWidth + bitWidth / 2}
                    y={topPadding + signalHeight + 22}
                    fill="currentColor"
                    className="fill-muted-foreground"
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    textAnchor="middle"
                  >
                    t{index + 1}
                  </text>
                ))}

                {/* Time axis arrow */}
                <line
                  x1={leftPadding}
                  y1={topPadding + signalHeight + 38}
                  x2={leftPadding + svgWidth}
                  y2={topPadding + signalHeight + 38}
                  stroke="currentColor"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                />
                <polygon
                  points={`${leftPadding + svgWidth},${topPadding + signalHeight + 38} ${
                    leftPadding + svgWidth - 8
                  },${topPadding + signalHeight + 34} ${leftPadding + svgWidth - 8},${
                    topPadding + signalHeight + 42
                  }`}
                  fill="currentColor"
                  fillOpacity="0.4"
                />
                <text
                  x={leftPadding + svgWidth + 4}
                  y={topPadding + signalHeight + 42}
                  fill="currentColor"
                  className="fill-muted-foreground"
                  fontSize="11"
                  fontStyle="italic"
                >
                  time
                </text>
              </svg>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5" style={{ backgroundColor: "#22c55e" }} />
                <span>Signal</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-0.5"
                  style={{
                    background:
                      "repeating-linear-gradient(to right, currentColor 0 4px, transparent 4px 8px)",
                  }}
                />
                <span>Voltage reference</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                <span>Transition point</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              {encodingInfo[encoding].description}
            </p>
          </CardContent>
        </Card>

        {/* Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Encoding Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Encoding</th>
                    <th className="text-left py-2 pr-4">Self-Clocking</th>
                    <th className="text-left py-2 pr-4">DC Component</th>
                    <th className="text-left py-2">Common Use</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium text-foreground">NRZ-L</td>
                    <td className="py-2 pr-4">No</td>
                    <td className="py-2 pr-4">Yes</td>
                    <td className="py-2">Basic digital transmission</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium text-foreground">NRZ-I</td>
                    <td className="py-2 pr-4">Partial</td>
                    <td className="py-2 pr-4">Yes</td>
                    <td className="py-2">USB (with bit stuffing)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium text-foreground">Manchester</td>
                    <td className="py-2 pr-4">Yes</td>
                    <td className="py-2 pr-4">No</td>
                    <td className="py-2">Ethernet (10BASE-T)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium text-foreground">Diff. Manchester</td>
                    <td className="py-2 pr-4">Yes</td>
                    <td className="py-2 pr-4">No</td>
                    <td className="py-2">Token Ring</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

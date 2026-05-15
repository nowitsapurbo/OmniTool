"use client"

import * as React from "react"
import { Ruler, ArrowLeftRight } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  convertStorage,
  convertCSS,
  convertLength,
  convertWeight,
  type StorageUnit,
  type CSSUnit,
  type LengthUnit,
  type WeightUnit,
} from "@/lib/tools"

function ConverterCard<T extends string>({
  title,
  value,
  setValue,
  fromUnit,
  setFromUnit,
  toUnit,
  setToUnit,
  units,
  convertFn,
  precision = 4,
}: {
  title: string
  value: string
  setValue: (v: string) => void
  fromUnit: T
  setFromUnit: (u: T) => void
  toUnit: T
  setToUnit: (u: T) => void
  units: { value: T; label: string }[]
  convertFn: (value: number, from: T, to: T) => number
  precision?: number
}) {
  const result = React.useMemo(() => {
    const num = parseFloat(value)
    if (isNaN(num)) return ""
    const converted = convertFn(num, fromUnit, toUnit)
    return converted.toFixed(precision).replace(/\.?0+$/, "")
  }, [value, fromUnit, toUnit, convertFn, precision])

  const handleSwap = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
    if (result) {
      setValue(result)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr,auto,1fr]">
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="font-mono"
              />
              <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as T)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-end justify-center pb-2">
            <Button variant="ghost" size="icon" onClick={handleSwap}>
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={result}
                readOnly
                placeholder="Result"
                className="font-mono bg-muted"
              />
              <Select value={toUnit} onValueChange={(v) => setToUnit(v as T)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function UnitConverterPage() {
  // Storage state
  const [storageValue, setStorageValue] = React.useState("1024")
  const [storageFrom, setStorageFrom] = React.useState<StorageUnit>("KB")
  const [storageTo, setStorageTo] = React.useState<StorageUnit>("MB")

  // CSS state
  const [cssValue, setCssValue] = React.useState("16")
  const [cssFrom, setCssFrom] = React.useState<CSSUnit>("px")
  const [cssTo, setCssTo] = React.useState<CSSUnit>("rem")

  // Length state
  const [lengthValue, setLengthValue] = React.useState("1")
  const [lengthFrom, setLengthFrom] = React.useState<LengthUnit>("m")
  const [lengthTo, setLengthTo] = React.useState<LengthUnit>("ft")

  // Weight state
  const [weightValue, setWeightValue] = React.useState("1")
  const [weightFrom, setWeightFrom] = React.useState<WeightUnit>("kg")
  const [weightTo, setWeightTo] = React.useState<WeightUnit>("lb")

  const storageUnits: { value: StorageUnit; label: string }[] = [
    { value: "B", label: "B" },
    { value: "KB", label: "KB" },
    { value: "MB", label: "MB" },
    { value: "GB", label: "GB" },
    { value: "TB", label: "TB" },
  ]

  const cssUnits: { value: CSSUnit; label: string }[] = [
    { value: "px", label: "px" },
    { value: "rem", label: "rem" },
    { value: "em", label: "em" },
  ]

  const lengthUnits: { value: LengthUnit; label: string }[] = [
    { value: "m", label: "m" },
    { value: "ft", label: "ft" },
    { value: "in", label: "in" },
    { value: "cm", label: "cm" },
    { value: "mm", label: "mm" },
    { value: "km", label: "km" },
    { value: "mi", label: "mi" },
  ]

  const weightUnits: { value: WeightUnit; label: string }[] = [
    { value: "kg", label: "kg" },
    { value: "lb", label: "lb" },
    { value: "oz", label: "oz" },
    { value: "g", label: "g" },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <ToolHeader
        icon={Ruler}
        name="Unit Converter"
        description="Convert digital storage, CSS units, length, and weight measurements"
        suite="Developer"
      />

      <Tabs defaultValue="storage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="css">CSS Units</TabsTrigger>
          <TabsTrigger value="length">Length</TabsTrigger>
          <TabsTrigger value="weight">Weight</TabsTrigger>
        </TabsList>

        <TabsContent value="storage">
          <ConverterCard
            title="Digital Storage"
            value={storageValue}
            setValue={setStorageValue}
            fromUnit={storageFrom}
            setFromUnit={setStorageFrom}
            toUnit={storageTo}
            setToUnit={setStorageTo}
            units={storageUnits}
            convertFn={convertStorage}
            precision={6}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Note: Uses binary conversion (1 KB = 1024 bytes)</p>
          </div>
        </TabsContent>

        <TabsContent value="css">
          <ConverterCard
            title="CSS Units"
            value={cssValue}
            setValue={setCssValue}
            fromUnit={cssFrom}
            setFromUnit={setCssFrom}
            toUnit={cssTo}
            setToUnit={setCssTo}
            units={cssUnits}
            convertFn={convertCSS}
            precision={4}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Note: Assumes base font size of 16px for rem/em calculations</p>
          </div>
        </TabsContent>

        <TabsContent value="length">
          <ConverterCard
            title="Length"
            value={lengthValue}
            setValue={setLengthValue}
            fromUnit={lengthFrom}
            setFromUnit={setLengthFrom}
            toUnit={lengthTo}
            setToUnit={setLengthTo}
            units={lengthUnits}
            convertFn={convertLength}
            precision={6}
          />
        </TabsContent>

        <TabsContent value="weight">
          <ConverterCard
            title="Weight"
            value={weightValue}
            setValue={setWeightValue}
            fromUnit={weightFrom}
            setFromUnit={setWeightFrom}
            toUnit={weightTo}
            setToUnit={setWeightTo}
            units={weightUnits}
            convertFn={convertWeight}
            precision={6}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Reference Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 text-sm">
            <div>
              <p className="font-medium mb-2">Digital Storage</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>1 KB = 1,024 bytes</li>
                <li>1 MB = 1,024 KB</li>
                <li>1 GB = 1,024 MB</li>
                <li>1 TB = 1,024 GB</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">CSS Units</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>1 rem = 16px (default)</li>
                <li>1 em = parent font-size</li>
                <li>1 px = 1/96 inch</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

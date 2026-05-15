"use client"

import * as React from "react"
import { Clock, Copy, RefreshCw } from "lucide-react"
import { ToolHeader } from "@/components/tool-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/copy-button"
import {
  unixToDate,
  dateToUnix,
  formatDateISO,
  formatDateLocal,
  formatDateUTC,
  getRelativeTime,
} from "@/lib/tools"

export default function TimeConverterPage() {
  const [unixInput, setUnixInput] = React.useState("")
  const [dateInput, setDateInput] = React.useState("")
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date())
  const [convertedDate, setConvertedDate] = React.useState<Date | null>(null)
  const [convertedUnix, setConvertedUnix] = React.useState<number | null>(null)

  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Convert Unix timestamp to date
  React.useEffect(() => {
    if (!unixInput.trim()) {
      setConvertedDate(null)
      return
    }

    const timestamp = parseInt(unixInput)
    if (isNaN(timestamp)) {
      setConvertedDate(null)
      return
    }

    try {
      const date = unixToDate(timestamp)
      setConvertedDate(date)
    } catch {
      setConvertedDate(null)
    }
  }, [unixInput])

  // Convert date to Unix timestamp
  React.useEffect(() => {
    if (!dateInput.trim()) {
      setConvertedUnix(null)
      return
    }

    try {
      const date = new Date(dateInput)
      if (isNaN(date.getTime())) {
        setConvertedUnix(null)
        return
      }
      setConvertedUnix(dateToUnix(date))
    } catch {
      setConvertedUnix(null)
    }
  }, [dateInput])

  const handleNow = () => {
    setUnixInput(String(dateToUnix(new Date())))
  }

  const handleNowDate = () => {
    setDateInput(new Date().toISOString().slice(0, 16))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ToolHeader
        icon={Clock}
        name="Time & Epoch Converter"
        description="Convert between Unix timestamps and human-readable dates"
        suite="Developer"
      />

      {/* Current Time Display */}
      <Card className="mb-6 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Time</p>
              <p className="text-2xl font-mono font-semibold">
                {dateToUnix(currentTime)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDateLocal(currentTime)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <CopyButton value={String(dateToUnix(currentTime))} />
              <p className="text-xs text-muted-foreground">
                {formatDateISO(currentTime)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Unix to Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unix Timestamp to Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unix-input">Unix Timestamp</Label>
              <div className="flex gap-2">
                <Input
                  id="unix-input"
                  value={unixInput}
                  onChange={(e) => setUnixInput(e.target.value)}
                  placeholder="e.g., 1609459200"
                  className="font-mono"
                />
                <Button variant="outline" size="icon" onClick={handleNow} title="Use current time">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {convertedDate && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Local:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{formatDateLocal(convertedDate)}</span>
                    <CopyButton value={formatDateLocal(convertedDate)} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">UTC:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{formatDateUTC(convertedDate)}</span>
                    <CopyButton value={formatDateUTC(convertedDate)} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ISO 8601:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{formatDateISO(convertedDate)}</span>
                    <CopyButton value={formatDateISO(convertedDate)} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Relative:</span>
                  <span className="text-sm">{getRelativeTime(convertedDate)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date to Unix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Date to Unix Timestamp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date-input">Date & Time</Label>
              <div className="flex gap-2">
                <Input
                  id="date-input"
                  type="datetime-local"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="font-mono"
                />
                <Button variant="outline" size="icon" onClick={handleNowDate} title="Use current time">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {convertedUnix !== null && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Seconds:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-semibold">{convertedUnix}</span>
                    <CopyButton value={String(convertedUnix)} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Milliseconds:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{convertedUnix * 1000}</span>
                    <CopyButton value={String(convertedUnix * 1000)} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Reference */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Unix Epoch</p>
              <p className="font-mono">0 = Jan 1, 1970 00:00:00 UTC</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">32-bit Limit</p>
              <p className="font-mono">2147483647 = Jan 19, 2038</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Milliseconds</p>
              <p className="font-mono">Divide by 1000 for seconds</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

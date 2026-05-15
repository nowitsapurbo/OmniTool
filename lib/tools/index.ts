// ============================================
// JSON UTILITIES
// ============================================

export function formatJSON(input: string, indent: number = 2): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(input)
    return { result: JSON.stringify(parsed, null, indent), error: null }
  } catch (e) {
    return { result: "", error: e instanceof Error ? e.message : "Invalid JSON" }
  }
}

export function minifyJSON(input: string): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(input)
    return { result: JSON.stringify(parsed), error: null }
  } catch (e) {
    return { result: "", error: e instanceof Error ? e.message : "Invalid JSON" }
  }
}

export function validateJSON(input: string): { valid: boolean; error: string | null } {
  try {
    JSON.parse(input)
    return { valid: true, error: null }
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : "Invalid JSON" }
  }
}

// ============================================
// TIME CONVERSION UTILITIES
// ============================================

export function unixToDate(timestamp: number): Date {
  // Handle both seconds and milliseconds
  if (timestamp < 10000000000) {
    return new Date(timestamp * 1000)
  }
  return new Date(timestamp)
}

export function dateToUnix(date: Date, inMilliseconds: boolean = false): number {
  return inMilliseconds ? date.getTime() : Math.floor(date.getTime() / 1000)
}

export function formatDateISO(date: Date): string {
  return date.toISOString()
}

export function formatDateLocal(date: Date): string {
  return date.toLocaleString()
}

export function formatDateUTC(date: Date): string {
  return date.toUTCString()
}

export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffYear = Math.floor(diffDay / 365)

  if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`
  if (diffSec > 0) return `${diffSec} second${diffSec > 1 ? "s" : ""} ago`
  return "just now"
}

// ============================================
// CASE CONVERSION UTILITIES
// ============================================

export function toCamelCase(str: string): string {
  return str
    .replace(/[_\-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
}

export function toPascalCase(str: string): string {
  return str
    .replace(/[_\-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^[a-z]/, (c) => c.toUpperCase())
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .replace(/[\s\-]+/g, "_")
    .replace(/^_/, "")
    .toLowerCase()
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "-$1")
    .replace(/[\s_]+/g, "-")
    .replace(/^-/, "")
    .toLowerCase()
}

export function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase()
}

export function toTitleCase(str: string): string {
  return str
    .replace(/[_\-]+/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export function toSentenceCase(str: string): string {
  const sentence = str
    .replace(/[_\-]+/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase()
  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}

// ============================================
// URL ENCODING UTILITIES
// ============================================

export function encodeURLComponent(str: string): string {
  return encodeURIComponent(str)
}

export function decodeURLComponent(str: string): { result: string; error: string | null } {
  try {
    return { result: decodeURIComponent(str), error: null }
  } catch (e) {
    return { result: "", error: e instanceof Error ? e.message : "Invalid URL encoding" }
  }
}

export function encodeURL(str: string): string {
  return encodeURI(str)
}

export function decodeURL(str: string): { result: string; error: string | null } {
  try {
    return { result: decodeURI(str), error: null }
  } catch (e) {
    return { result: "", error: e instanceof Error ? e.message : "Invalid URL" }
  }
}

// ============================================
// BINARY & NUMBER CONVERSION UTILITIES
// ============================================

export function decimalToBinary(num: number, bits: number = 32): string {
  if (num >= 0) {
    return num.toString(2).padStart(bits, "0")
  }
  // Two's complement for negative numbers
  return (num >>> 0).toString(2).slice(-bits)
}

export function binaryToDecimal(binary: string, signed: boolean = false): number {
  if (signed && binary[0] === "1") {
    // Two's complement
    const inverted = binary.split("").map((b) => (b === "0" ? "1" : "0")).join("")
    return -(parseInt(inverted, 2) + 1)
  }
  return parseInt(binary, 2)
}

export function decimalToHex(num: number): string {
  return (num >>> 0).toString(16).toUpperCase()
}

export function hexToDecimal(hex: string): number {
  return parseInt(hex, 16)
}

export function decimalToOctal(num: number): string {
  return (num >>> 0).toString(8)
}

export function octalToDecimal(octal: string): number {
  return parseInt(octal, 8)
}

// ============================================
// ASCII UTILITIES
// ============================================

export interface CharacterInfo {
  char: string
  decimal: number
  hex: string
  octal: string
  binary: string
  description: string
  isPrintable: boolean
}

const ASCII_DESCRIPTIONS: Record<number, string> = {
  0: "NUL (Null)",
  1: "SOH (Start of Header)",
  2: "STX (Start of Text)",
  3: "ETX (End of Text)",
  4: "EOT (End of Transmission)",
  5: "ENQ (Enquiry)",
  6: "ACK (Acknowledge)",
  7: "BEL (Bell)",
  8: "BS (Backspace)",
  9: "HT (Horizontal Tab)",
  10: "LF (Line Feed)",
  11: "VT (Vertical Tab)",
  12: "FF (Form Feed)",
  13: "CR (Carriage Return)",
  14: "SO (Shift Out)",
  15: "SI (Shift In)",
  16: "DLE (Data Link Escape)",
  17: "DC1 (Device Control 1)",
  18: "DC2 (Device Control 2)",
  19: "DC3 (Device Control 3)",
  20: "DC4 (Device Control 4)",
  21: "NAK (Negative Acknowledge)",
  22: "SYN (Synchronous Idle)",
  23: "ETB (End of Transmission Block)",
  24: "CAN (Cancel)",
  25: "EM (End of Medium)",
  26: "SUB (Substitute)",
  27: "ESC (Escape)",
  28: "FS (File Separator)",
  29: "GS (Group Separator)",
  30: "RS (Record Separator)",
  31: "US (Unit Separator)",
  32: "Space",
  127: "DEL (Delete)",
}

export function getCharacterInfo(char: string): CharacterInfo {
  const code = char.charCodeAt(0)
  return {
    char: code < 32 || code === 127 ? "N/A" : char,
    decimal: code,
    hex: code.toString(16).toUpperCase().padStart(2, "0"),
    octal: code.toString(8).padStart(3, "0"),
    binary: code.toString(2).padStart(8, "0"),
    description: ASCII_DESCRIPTIONS[code] || (code >= 32 && code < 127 ? `Printable: ${char}` : `Extended ASCII: ${code}`),
    isPrintable: code >= 32 && code < 127,
  }
}

export function inspectString(str: string): CharacterInfo[] {
  return str.split("").map(getCharacterInfo)
}

// ============================================
// BASE64 UTILITIES
// ============================================

export function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

export function decodeBase64(str: string): { result: string; error: string | null } {
  try {
    return { result: decodeURIComponent(escape(atob(str))), error: null }
  } catch (e) {
    return { result: "", error: e instanceof Error ? e.message : "Invalid Base64" }
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1] || result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ============================================
// UNIT CONVERSION UTILITIES
// ============================================

export type StorageUnit = "B" | "KB" | "MB" | "GB" | "TB"
export type CSSUnit = "px" | "rem" | "em"
export type LengthUnit = "m" | "ft" | "in" | "cm" | "mm" | "km" | "mi"
export type WeightUnit = "kg" | "lb" | "oz" | "g"

const STORAGE_MULTIPLIERS: Record<StorageUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
}

export function convertStorage(value: number, from: StorageUnit, to: StorageUnit): number {
  const bytes = value * STORAGE_MULTIPLIERS[from]
  return bytes / STORAGE_MULTIPLIERS[to]
}

const LENGTH_TO_METERS: Record<LengthUnit, number> = {
  m: 1,
  ft: 0.3048,
  in: 0.0254,
  cm: 0.01,
  mm: 0.001,
  km: 1000,
  mi: 1609.344,
}

export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  const meters = value * LENGTH_TO_METERS[from]
  return meters / LENGTH_TO_METERS[to]
}

const WEIGHT_TO_KG: Record<WeightUnit, number> = {
  kg: 1,
  lb: 0.453592,
  oz: 0.0283495,
  g: 0.001,
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  const kg = value * WEIGHT_TO_KG[from]
  return kg / WEIGHT_TO_KG[to]
}

export function convertCSS(value: number, from: CSSUnit, to: CSSUnit, baseFontSize: number = 16): number {
  // Convert to pixels first
  let px: number
  switch (from) {
    case "px":
      px = value
      break
    case "rem":
      px = value * baseFontSize
      break
    case "em":
      px = value * baseFontSize
      break
  }

  // Convert from pixels to target
  switch (to) {
    case "px":
      return px
    case "rem":
      return px / baseFontSize
    case "em":
      return px / baseFontSize
  }
}

// ============================================
// COLOR UTILITIES
// ============================================

export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase()
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360
  s /= 100
  l /= 100
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function getContrastRatio(rgb1: RGB, rgb2: RGB): number {
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function getWCAGRating(ratio: number): { level: string; passes: { aa: boolean; aaLarge: boolean; aaa: boolean; aaaLarge: boolean } } {
  return {
    level: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail",
    passes: {
      aa: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaa: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    },
  }
}

// ============================================
// CIDR / SUBNET UTILITIES
// ============================================

export interface SubnetInfo {
  network: string
  broadcast: string
  firstHost: string
  lastHost: string
  totalHosts: number
  usableHosts: number
  subnetMask: string
  wildcardMask: string
}

export function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

export function longToIp(long: number): string {
  return [(long >>> 24) & 255, (long >>> 16) & 255, (long >>> 8) & 255, long & 255].join(".")
}

export function calculateSubnet(ip: string, cidr: number): SubnetInfo | null {
  if (cidr < 0 || cidr > 32) return null

  const ipLong = ipToLong(ip)
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0
  const wildcard = ~mask >>> 0

  const network = (ipLong & mask) >>> 0
  const broadcast = (network | wildcard) >>> 0
  const firstHost = cidr === 32 ? network : network + 1
  const lastHost = cidr === 32 ? broadcast : broadcast - 1
  const totalHosts = Math.pow(2, 32 - cidr)
  const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2

  return {
    network: longToIp(network),
    broadcast: longToIp(broadcast),
    firstHost: longToIp(firstHost),
    lastHost: longToIp(lastHost),
    totalHosts,
    usableHosts: Math.max(0, usableHosts),
    subnetMask: longToIp(mask),
    wildcardMask: longToIp(wildcard),
  }
}

// ============================================
// MOCK DATA GENERATOR UTILITIES
// ============================================

const FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
const DOMAINS = ["example.com", "test.org", "demo.net", "sample.io", "mock.dev"]
const STREETS = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St", "Park Ave", "Lake Blvd", "River Rd", "Hill St"]
const CITIES = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin"]

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateMockUser(): Record<string, unknown> {
  const firstName = randomElement(FIRST_NAMES)
  const lastName = randomElement(LAST_NAMES)
  return {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(DOMAINS)}`,
    phone: `+1 ${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
    createdAt: new Date(Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000)).toISOString(),
  }
}

export function generateMockAddress(): Record<string, unknown> {
  return {
    street: `${randomInt(100, 9999)} ${randomElement(STREETS)}`,
    city: randomElement(CITIES),
    state: ["NY", "CA", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI"][randomInt(0, 9)],
    zipCode: String(randomInt(10000, 99999)),
    country: "USA",
  }
}

export function generateMockProduct(): Record<string, unknown> {
  const categories = ["Electronics", "Clothing", "Books", "Home", "Sports"]
  const adjectives = ["Premium", "Classic", "Modern", "Vintage", "Elite"]
  const nouns = ["Widget", "Gadget", "Device", "Tool", "Item"]
  return {
    id: crypto.randomUUID(),
    name: `${randomElement(adjectives)} ${randomElement(nouns)}`,
    category: randomElement(categories),
    price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
    inStock: Math.random() > 0.3,
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
  }
}

export function generateMockData(type: "user" | "address" | "product", count: number): Record<string, unknown>[] {
  const generators = {
    user: generateMockUser,
    address: generateMockAddress,
    product: generateMockProduct,
  }
  return Array.from({ length: count }, generators[type])
}

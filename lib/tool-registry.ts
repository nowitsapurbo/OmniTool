import {
  Binary,
  Braces,
  Calculator,
  Clock,
  Code2,
  Database,
  FileCode,
  FileJson,
  Globe,
  Hash,
  Key,
  KeyRound,
  LetterText,
  Link2,
  Palette,
  Network,
  Shield,
  Terminal,
  Type,
  Ruler,
  FileText,
  Waves,
  Users,
  Fingerprint,
  Regex,
  type LucideIcon,
} from "lucide-react"

export type Suite =
  | "data-encoding"
  | "developer"
  | "security"
  | "engineering"
  | "frontend"

export interface ToolDefinition {
  id: string
  name: string
  description: string
  suite: Suite
  icon: LucideIcon
  keywords: string[]
  path: string
}

export interface SuiteDefinition {
  id: Suite
  name: string
  description: string
  icon: LucideIcon
}

export const suites: SuiteDefinition[] = [
  {
    id: "developer",
    name: "Core Developer",
    description: "Essential tools for everyday development",
    icon: Code2,
  },
  {
    id: "data-encoding",
    name: "Data & Encoding",
    description: "Binary, ASCII, and encoding utilities",
    icon: Binary,
  },
  {
    id: "security",
    name: "Security & InfoSec",
    description: "Cryptography and security tools",
    icon: Shield,
  },
  {
    id: "engineering",
    name: "Engineering & Database",
    description: "SQL, networking, and infrastructure",
    icon: Database,
  },
  {
    id: "frontend",
    name: "Frontend & Docs",
    description: "Color, markdown, and mock data",
    icon: Palette,
  },
]

export const tools: ToolDefinition[] = [
  // Core Developer Suite
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and beautify JSON data",
    suite: "developer",
    icon: Braces,
    keywords: ["json", "format", "validate", "pretty", "beautify", "minify"],
    path: "/tools/json-formatter",
  },
  {
    id: "time-converter",
    name: "Time & Epoch Converter",
    description: "Convert between Unix timestamps and dates",
    suite: "developer",
    icon: Clock,
    keywords: ["time", "epoch", "unix", "timestamp", "date", "convert"],
    path: "/tools/time-converter",
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert digital storage, CSS units, and measurements",
    suite: "developer",
    icon: Ruler,
    keywords: ["unit", "convert", "bytes", "pixels", "rem", "em", "length", "weight", "storage"],
    path: "/tools/unit-converter",
  },
  {
    id: "case-converter",
    name: "String Case Converter",
    description: "Transform text between camelCase, snake_case, and more",
    suite: "developer",
    icon: Type,
    keywords: ["case", "camel", "snake", "kebab", "pascal", "uppercase", "lowercase", "string"],
    path: "/tools/case-converter",
  },
  {
    id: "url-encoder",
    name: "URL Encoder / Decoder",
    description: "Encode and decode URL components",
    suite: "developer",
    icon: Link2,
    keywords: ["url", "encode", "decode", "uri", "percent", "escape"],
    path: "/tools/url-encoder",
  },
  // Data & Signal Encoding Suite
  {
    id: "binary-calculator",
    name: "Binary Calculator",
    description: "Advanced binary operations with bit visualization",
    suite: "data-encoding",
    icon: Calculator,
    keywords: ["binary", "hex", "decimal", "octal", "bits", "twos complement", "ieee754"],
    path: "/tools/binary-calculator",
  },
  {
    id: "ascii-inspector",
    name: "ASCII / String Inspector",
    description: "Inspect characters with multi-radix output",
    suite: "data-encoding",
    icon: LetterText,
    keywords: ["ascii", "character", "hex", "decimal", "binary", "unicode", "inspect"],
    path: "/tools/ascii-inspector",
  },
  {
    id: "base64",
    name: "Base64 Encoder / Decoder",
    description: "Encode and decode Base64 for text and files",
    suite: "data-encoding",
    icon: FileCode,
    keywords: ["base64", "encode", "decode", "binary", "text", "image"],
    path: "/tools/base64",
  },
  {
    id: "line-coder",
    name: "Digital Signal Line Coder",
    description: "Visualize NRZ-L, NRZ-I, and Manchester encoding",
    suite: "data-encoding",
    icon: Waves,
    keywords: ["signal", "nrz", "manchester", "encoding", "digital", "line"],
    path: "/tools/line-coder",
  },
  // Security & InfoSec Suite
  {
    id: "crypto-sandbox",
    name: "Cryptography Sandbox",
    description: "Generate hashes and test encryption",
    suite: "security",
    icon: Hash,
    keywords: ["hash", "md5", "sha256", "sha512", "bcrypt", "aes", "encrypt", "decrypt"],
    path: "/tools/crypto-sandbox",
  },
  {
    id: "jwt-decoder",
    name: "JWT Encoder & Decoder",
    description: "Encode, sign, decode and inspect JSON Web Tokens",
    suite: "security",
    icon: Key,
    keywords: ["jwt", "token", "encode", "sign", "decode", "header", "payload", "signature", "verify", "hmac"],
    path: "/tools/jwt-decoder",
  },
  {
    id: "rsa-tool",
    name: "RSA Key Pair Tool",
    description: "Generate and visualize RSA key pairs",
    suite: "security",
    icon: KeyRound,
    keywords: ["rsa", "key", "public", "private", "generate", "encrypt"],
    path: "/tools/rsa-tool",
  },
  // Engineering & Database Suite
  {
    id: "sql-formatter",
    name: "SQL Query Formatter",
    description: "Beautify SQL queries for various dialects",
    suite: "engineering",
    icon: Database,
    keywords: ["sql", "format", "mysql", "postgresql", "sqlite", "query", "beautify"],
    path: "/tools/sql-formatter",
  },
  {
    id: "cidr-calculator",
    name: "CIDR / Subnet Calculator",
    description: "Calculate network boundaries and IP ranges",
    suite: "engineering",
    icon: Network,
    keywords: ["cidr", "subnet", "ip", "network", "mask", "broadcast", "range"],
    path: "/tools/cidr-calculator",
  },
  {
    id: "curl-converter",
    name: "cURL Converter",
    description: "Convert cURL commands to fetch or axios",
    suite: "engineering",
    icon: Terminal,
    keywords: ["curl", "fetch", "axios", "http", "request", "convert", "api"],
    path: "/tools/curl-converter",
  },
  // Frontend & Documentation Suite
  {
    id: "markdown-previewer",
    name: "Markdown Previewer",
    description: "Live Markdown editor with Mermaid diagrams",
    suite: "frontend",
    icon: FileText,
    keywords: ["markdown", "preview", "mermaid", "diagram", "dfd", "documentation"],
    path: "/tools/markdown-previewer",
  },
  {
    id: "color-tool",
    name: "Color & Accessibility Tool",
    description: "Color conversion with WCAG contrast checking",
    suite: "frontend",
    icon: Palette,
    keywords: ["color", "hex", "rgb", "hsl", "wcag", "contrast", "accessibility", "a11y"],
    path: "/tools/color-tool",
  },
  {
    id: "mock-generator",
    name: "Mock Data Generator",
    description: "Generate dummy JSON data for testing",
    suite: "frontend",
    icon: Users,
    keywords: ["mock", "fake", "data", "json", "user", "address", "seed", "faker"],
    path: "/tools/mock-generator",
  },
  {
    id: "uuid-generator",
    name: "UUID / ULID Generator",
    description: "Generate and validate UUIDs, ULIDs, and NanoIDs",
    suite: "developer",
    icon: Fingerprint,
    keywords: ["uuid", "ulid", "nanoid", "guid", "unique", "identifier", "generate"],
    path: "/tools/uuid-generator",
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Generate cryptographic hashes with SHA algorithms",
    suite: "security",
    icon: Hash,
    keywords: ["hash", "sha1", "sha256", "sha384", "sha512", "checksum", "verify"],
    path: "/tools/hash-generator",
  },

  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test and debug regular expressions",
    suite: "developer",
    icon: Regex,
    keywords: ["regex", "regular", "expression", "pattern", "match", "test", "validate"],
    path: "/tools/regex-tester",
  },
]

export function getToolsBySuite(suiteId: Suite): ToolDefinition[] {
  return tools.filter((tool) => tool.suite === suiteId)
}

export function getToolById(id: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.id === id)
}

export function searchTools(query: string): ToolDefinition[] {
  const lowerQuery = query.toLowerCase()
  return tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.keywords.some((keyword) => keyword.includes(lowerQuery))
  )
}

export function getSuiteById(id: Suite): SuiteDefinition | undefined {
  return suites.find((suite) => suite.id === id)
}

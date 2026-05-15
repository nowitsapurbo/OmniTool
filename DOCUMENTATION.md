# OmniTool — Software Project Documentation

**Course:** Software Development Management  
**Project Type:** Cross-Platform Developer Toolkit (Web / Desktop)  
**Version:** 1.0.0  
**Document Status:** Final

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Introduction](#2-introduction)
3. [Software Development Life Cycle (SDLC)](#3-software-development-life-cycle-sdlc)
4. [Software Requirements Specification (SRS)](#4-software-requirements-specification-srs)
5. [System Architecture and Design](#5-system-architecture-and-design)
6. [Technology Stack](#6-technology-stack)
7. [Module-Wise Feature Specification](#7-module-wise-feature-specification)
8. [Implementation Details](#8-implementation-details)
9. [Testing Strategy](#9-testing-strategy)
10. [Risk Management](#10-risk-management)
11. [Deployment and Distribution](#11-deployment-and-distribution)
12. [Project Management Artifacts](#12-project-management-artifacts)
13. [Conclusion and Future Work](#13-conclusion-and-future-work)
14. [References](#14-references)

---

## 1. Executive Summary

**OmniTool** is a comprehensive offline-first developer utility suite consolidating 21 commonly-used engineering tools into a single, unified interface. Inspired by the open-source **DevToys** project, OmniTool is engineered as a modern web application built with Next.js 16 and React 19, designed with a plugin-based modular architecture that ensures extensibility, maintainability, and high cohesion within each tool module.

The project demonstrates the practical application of Agile Scrum methodology, modular software architecture, and modern web technologies. All computations are executed client-side, ensuring zero data transmission to external servers — a critical non-functional requirement for security-conscious developer workflows.

**Key Metrics:**

| Metric | Value |
|--------|-------|
| Total Tools Implemented | 21 |
| Functional Suites | 5 |
| Lines of Code (approx.) | 9,000+ |
| Primary Language | TypeScript |
| Architecture Pattern | Plugin-based Modular |
| Data Privacy | 100% Client-Side Execution |

---

## 2. Introduction

### 2.1 Project Background

Modern software developers frequently rely on a fragmented ecosystem of online tools — JSON formatters, Base64 encoders, JWT decoders, regex testers — each hosted on different websites with varying levels of trustworthiness. Pasting sensitive data (such as production JWTs or private API responses) into untrusted web utilities represents a significant security risk.

OmniTool addresses this concern by consolidating these utilities into one cohesive, locally-executed application, eliminating both context-switching overhead and data exposure.

### 2.2 Problem Statement

Developers face three recurring inefficiencies:

1. **Tool Fragmentation** — Engineers maintain dozens of bookmarks across heterogeneous tool websites.
2. **Security Exposure** — Pasting sensitive payloads into third-party utilities risks data leakage.
3. **Context Switching Overhead** — Repeated tab-switching reduces productive flow state.

### 2.3 Objectives

- Build a unified developer toolkit supporting common encoding, conversion, security, and engineering tasks.
- Ensure all data processing occurs locally within the user's browser runtime.
- Implement a scalable architecture that allows new tools to be added with minimal changes to the core system.
- Follow industry-standard SDLC practices to produce maintainable, well-documented software.

### 2.4 Scope

**In Scope:**
- 21 client-side developer utilities across 5 categories
- Responsive web interface usable on desktop browsers
- Offline functionality (after first load)
- Light/dark theme support
- Keyboard-driven command palette
- Cross-platform desktop wrapper compatibility (Electron-ready)

**Out of Scope (Future Releases):**
- Server-side data persistence
- Multi-user collaboration features
- Cloud-synced settings
- Native mobile applications

---

## 3. Software Development Life Cycle (SDLC)

### 3.1 Chosen Methodology: Agile Scrum

Agile Scrum was selected over Waterfall and Kanban for the following reasons:

| Factor | Justification |
|--------|---------------|
| Iterative Delivery | Each tool is a self-contained increment, ideal for sprint-based delivery |
| Changing Requirements | Tools can be reprioritized between sprints based on user feedback |
| Risk Mitigation | Early sprints surface architectural issues before scaling to all tools |
| Course Alignment | Scrum's ceremonies (planning, review, retrospective) produce gradable artifacts |

### 3.2 Sprint Plan

The project was executed across **6 sprints** of 2 weeks each:

| Sprint | Theme | Deliverables |
|--------|-------|--------------|
| Sprint 0 | Foundation | Architecture, tech stack selection, repository setup, sidebar shell, routing system, tool registry |
| Sprint 1 | Core Developer Suite | JSON Formatter, Time Converter, Unit Converter, Case Converter, URL Encoder, UUID Generator, Regex Tester |
| Sprint 2 | Data Encoding Suite | Binary Calculator, ASCII Inspector, Base64, Digital Signal Line Coder |
| Sprint 3 | Security Suite | Crypto Sandbox, JWT Encoder/Decoder, RSA Key Tool, Hash Generator |
| Sprint 4 | Engineering Suite | SQL Formatter, CIDR Calculator, cURL Converter |
| Sprint 5 | Frontend & Documentation Suite | Markdown Previewer, Color Tool, Mock Data Generator |
| Sprint 6 | Polish & Documentation | Theme toggle, dashboard reorganization, visualization improvements, project documentation |

### 3.3 Scrum Ceremonies

- **Sprint Planning** — Backlog refinement and sprint goal definition at the start of each sprint.
- **Daily Standup** — Short progress check (asynchronous via project board).
- **Sprint Review** — Demonstration of completed tools at sprint end.
- **Sprint Retrospective** — Reflection on process improvements.

### 3.4 Definition of Done (DoD)

A user story is considered "Done" when:

1. The tool's UI is implemented and matches the design system.
2. Pure-function business logic is separated from UI components.
3. Edge cases (empty inputs, invalid data) are handled gracefully.
4. The tool is registered in `lib/tool-registry.ts` and accessible from the sidebar.
5. The tool appears in the command palette search.
6. Accessibility attributes (ARIA labels, semantic HTML) are present.
7. The code follows TypeScript strict mode without warnings.

---

## 4. Software Requirements Specification (SRS)

### 4.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | The system shall provide a sidebar navigation listing all available tools grouped by suite. |
| FR-02 | The system shall support a keyboard-activated command palette (Ctrl+K / Cmd+K) for tool search. |
| FR-03 | Each tool shall execute all computations in the client browser without server calls. |
| FR-04 | The system shall support light and dark theme modes with user preference persistence. |
| FR-05 | The JSON Formatter shall validate, format, and minify JSON input with error reporting. |
| FR-06 | The Binary Calculator shall support bitwise operations on 8/16/32/64-bit operands. |
| FR-07 | The JWT tool shall both encode (sign with HMAC) and decode (parse and inspect) JWT tokens. |
| FR-08 | The Crypto Sandbox shall provide AES encryption/decryption with multiple modes. |
| FR-09 | The Color Tool shall convert between RGB, HSL, HEX, and CMYK and compute WCAG contrast ratios. |
| FR-10 | The Digital Signal Line Coder shall render NRZ-L, NRZ-I, and Manchester encodings as SVG waveforms. |
| FR-11 | Suite categories in the dashboard shall be collapsible with nested tool listings. |
| FR-12 | All tool outputs shall be copyable to the system clipboard with a single click. |

### 4.2 Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Security | No user input shall be transmitted to remote servers. |
| NFR-02 | Performance | Initial page load shall complete in under 2 seconds on broadband connections. |
| NFR-03 | Usability | The interface shall be operable via keyboard alone. |
| NFR-04 | Accessibility | The application shall meet WCAG 2.1 AA contrast requirements. |
| NFR-05 | Portability | The application shall function in Chrome, Firefox, Edge, and Safari (latest two versions). |
| NFR-06 | Maintainability | New tools shall be addable in under 50 lines of registration code. |
| NFR-07 | Scalability | The architecture shall support 100+ tools without structural changes. |

### 4.3 Use Cases

**UC-01: Format a JSON Payload**
- **Actor:** Developer
- **Precondition:** Application is loaded.
- **Main Flow:**
  1. User selects "JSON Formatter" from the sidebar or command palette.
  2. User pastes raw JSON into the input panel.
  3. System validates and formats the JSON in real-time.
  4. User clicks "Copy" to copy formatted output.
- **Alternate Flow:** If JSON is invalid, the system displays a syntax error inline.

**UC-02: Encode and Decode a JWT**
- **Actor:** Backend Developer
- **Precondition:** User has a payload and secret key.
- **Main Flow:**
  1. User opens "JWT Encoder & Decoder."
  2. User selects "Encode" tab, enters header and payload JSON, and provides a secret.
  3. System generates a signed JWT using the selected HMAC algorithm.
  4. User clicks "Open in Decoder" to verify the resulting token.

---

## 5. System Architecture and Design

### 5.1 Architectural Pattern: Plugin-Based Modular Architecture

OmniTool follows a **registry-driven plugin pattern** where each tool is a self-contained module that registers itself with a central catalog. This pattern is identical in philosophy to VSCode's extension API and the original DevToys plugin system.

```
┌─────────────────────────────────────────────────────────────┐
│                  Application Shell (RootLayout)             │
│  ┌──────────────────────┬─────────────────────────────────┐ │
│  │   Sidebar (Nav)      │      Tool Viewport (Page)       │ │
│  │   - Suite 1          │                                 │ │
│  │     - Tool A         │   Dynamically routed tool       │ │
│  │     - Tool B         │   component renders here        │ │
│  │   - Suite 2          │                                 │ │
│  │     - Tool C         │                                 │ │
│  └──────────────────────┴─────────────────────────────────┘ │
│           │                              │                  │
│           ▼                              ▼                  │
│   ┌──────────────────────────────────────────────────┐      │
│   │           Tool Registry (lib/tool-registry.ts)   │      │
│   └──────────────────────────────────────────────────┘      │
│           ▲                              ▲                  │
│           │                              │                  │
│   ┌────────────────────┐    ┌─────────────────────────┐     │
│   │  Command Palette   │    │  Shared Utility Library │     │
│   │  (Cmd+K Search)    │    │  (lib/tools/index.ts)   │     │
│   └────────────────────┘    └─────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Layered Design

| Layer | Responsibility | Example Files |
|-------|----------------|---------------|
| **Presentation** | UI components, theming, layout | `app/`, `components/` |
| **Application** | Tool registry, routing, command palette | `lib/tool-registry.ts`, `components/command-palette.tsx` |
| **Domain Logic** | Pure functions for conversions, formatting, cryptography | `lib/tools/index.ts` |
| **Infrastructure** | Browser APIs (Web Crypto, Clipboard, Local Storage) | Via dedicated hooks |

### 5.3 Design Principles Applied

- **Separation of Concerns** — UI components are decoupled from business logic.
- **Single Responsibility Principle (SRP)** — Each tool module handles exactly one task domain.
- **Open/Closed Principle (OCP)** — The registry is open for extension (new tools) but closed for modification.
- **DRY (Don't Repeat Yourself)** — Shared components like `InputOutputPanel`, `CopyButton`, and `ToolHeader` are reused across all tools.
- **Composition Over Inheritance** — React component composition is favored over class-based inheritance.

### 5.4 Component Hierarchy

```
RootLayout
├── ThemeProvider
└── SidebarProvider
    ├── AppSidebar
    │   ├── SidebarHeader (Logo + App Name)
    │   ├── SidebarContent
    │   │   └── [For each Suite]
    │   │       ├── Collapsible Suite Header
    │   │       └── Nested Tool List (indented)
    │   └── SidebarFooter
    ├── Header
    │   ├── SidebarTrigger
    │   ├── Breadcrumb
    │   ├── Command Palette Button
    │   └── Theme Toggle
    └── Main Content
        └── [Tool Page Component]
            ├── ToolHeader
            └── Tool-Specific UI (Input/Output panels, Tabs, etc.)
```

### 5.5 Data Flow

Each tool follows a unidirectional data flow:

```
User Input → React State → Pure Transformation Function → Output Display
                                     │
                                     ▼
                              Clipboard / Download
```

No global state management library is required because tool state is local and ephemeral. This simplifies the mental model and improves performance.

---

## 6. Technology Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Framework | Next.js (App Router) | 16.x | Modern React framework with SSR, routing, and excellent DX |
| UI Library | React | 19.x | Component-based architecture, Concurrent Features |
| Language | TypeScript | 5.x | Compile-time type safety, improved refactoring |
| Styling | Tailwind CSS | 4.x | Utility-first, design-token based, fast iteration |
| Component Library | shadcn/ui | latest | Accessible, composable, fully customizable primitives |
| Icons | Lucide React | latest | Consistent, tree-shakeable icon set |
| Theme | next-themes | latest | System-aware dark/light mode handling |
| Cryptography | Web Crypto API | native | Browser-native, secure cryptographic primitives |
| Package Manager | pnpm | 9.x | Fast, disk-efficient, strict dependency resolution |

### 6.1 Why Web Technologies for a Desktop-Style Tool?

The original DevToys was built using WinUI and WPF, restricting it to Windows. By choosing web technologies, OmniTool achieves:

- **Cross-platform compatibility** — Runs on Windows, macOS, Linux without code changes.
- **Easier distribution** — Can be deployed as a hosted web app or wrapped with Electron/Tauri.
- **Modern tooling** — Hot module reloading, rich ecosystem, mature testing frameworks.
- **Lower barrier to contribution** — Web developers can extend the project without learning a desktop-specific framework.

---

## 7. Module-Wise Feature Specification

### 7.1 Core Developer Suite

| Tool | Purpose | Key Implementation |
|------|---------|---------------------|
| JSON Formatter | Format, validate, minify JSON | Native `JSON.parse` with error position reporting |
| Time & Epoch Converter | Convert between Unix timestamps and human dates | `Date` API with timezone awareness |
| Unit Converter | Convert bytes, length, weight, temperature, CSS units | Lookup tables with multiplicative factors |
| String Case Converter | Transform between camelCase, snake_case, etc. | Regex-based tokenization |
| URL Encoder / Decoder | Percent-encode and decode URLs | Native `encodeURIComponent` / `decodeURIComponent` |
| UUID / ULID Generator | Generate unique identifiers (v4, ULID, NanoID) | `crypto.randomUUID()` + custom ULID implementation |
| Regex Tester | Test patterns against input with live matching | Native `RegExp` with safe execution |

### 7.2 Data & Signal Encoding Suite

| Tool | Purpose | Key Implementation |
|------|---------|---------------------|
| Binary Calculator | Bitwise operations, two's complement, IEEE 754 | `BigInt` arithmetic for 64-bit precision |
| ASCII Inspector | Per-character analysis (DEC, HEX, BIN, OCT) | `charCodeAt` with multi-radix formatting |
| Base64 Encoder / Decoder | Encode text and files to Base64 | `btoa` / `atob` with UTF-8 safety |
| Digital Signal Line Coder | Render NRZ-L, NRZ-I, Manchester waveforms | SVG with discrete segment rendering |

### 7.3 Security & InfoSec Suite

| Tool | Purpose | Key Implementation |
|------|---------|---------------------|
| Cryptography Sandbox | AES-GCM encrypt/decrypt, multi-algorithm hashing | Web Crypto API (`SubtleCrypto`) |
| JWT Encoder & Decoder | Encode HMAC-signed tokens, decode and inspect | Web Crypto HMAC + Base64URL encoding |
| RSA Key Pair Tool | Generate, visualize, and use RSA keys | Web Crypto `generateKey` with PEM export |
| Hash Generator | Generate SHA-1/256/384/512 hashes | Web Crypto `digest` API |

### 7.4 Engineering & Database Suite

| Tool | Purpose | Key Implementation |
|------|---------|---------------------|
| SQL Formatter | Beautify SQL across multiple dialects | Token-based formatter with keyword detection |
| CIDR Calculator | Subnet math, IP range analysis | Bitwise operations on IPv4 octets |
| cURL Converter | Convert cURL commands to JS / Python / PHP / Go | Tokenization + code template generation |

### 7.5 Frontend & Documentation Suite

| Tool | Purpose | Key Implementation |
|------|---------|---------------------|
| Markdown Previewer | Render Markdown to HTML live | Lightweight Markdown-to-HTML converter |
| Color Tool | Convert color formats, check WCAG contrast | Color space math + luminance calculation |
| Mock Data Generator | Generate fake JSON/CSV/SQL test data | Seeded pseudo-random data templates |

---

## 8. Implementation Details

### 8.1 Tool Registration Pattern

Every tool registers a single entry in `lib/tool-registry.ts`:

```typescript
{
  id: "json-formatter",
  name: "JSON Formatter",
  description: "Format and validate JSON data",
  suite: "developer",
  icon: Braces,
  keywords: ["json", "format", "validate", "pretty"],
  path: "/tools/json-formatter",
}
```

This single source of truth drives:
- Sidebar navigation rendering
- Command palette search results
- Breadcrumb generation
- Dashboard suite grouping

### 8.2 Routing Convention

Next.js App Router file-based routing maps to the registry path:

```
app/tools/json-formatter/page.tsx → /tools/json-formatter
app/tools/binary-calculator/page.tsx → /tools/binary-calculator
```

### 8.3 Shared Components

| Component | Purpose |
|-----------|---------|
| `ToolHeader` | Consistent header with icon, name, description, suite badge |
| `InputOutputPanel` | Side-by-side input/output layout reused across most tools |
| `CopyButton` | Clipboard utility with visual confirmation feedback |
| `CommandPalette` | Cmd+K search dialog listing all registered tools |
| `ThemeToggle` | Light/dark mode switch (next-themes integration) |

### 8.4 Theming Strategy

All colors are declared as CSS variables in `app/globals.css`, with separate `:root` and `.dark` selector blocks. Components reference variables via Tailwind's `bg-background`, `text-foreground`, `bg-primary`, etc. — never hardcoded color values. This ensures theme switching is instantaneous and consistent.

---

## 9. Testing Strategy

### 9.1 Testing Pyramid

```
        ╱ ╲
       ╱ E ╲      End-to-End (Manual exploratory)
      ╱─────╲
     ╱       ╲
    ╱  Integ. ╲   Component Integration (planned)
   ╱───────────╲
  ╱             ╲
 ╱   Unit Tests  ╲  Pure functions (planned)
╱─────────────────╲
```

### 9.2 Test Categories

| Type | Approach | Coverage Target |
|------|----------|-----------------|
| Unit | Test pure functions in `lib/tools/` with Vitest | 80%+ of utility functions |
| Component | Test React components with React Testing Library | Critical user paths |
| End-to-End | Manual exploratory testing per sprint review | All happy-path workflows |
| Accessibility | Automated audits with axe-core | Zero critical violations |

### 9.3 Sample Test Cases

| Test ID | Description | Expected Outcome |
|---------|-------------|------------------|
| TC-01 | Format valid JSON `{"a":1}` | Returns indented JSON string |
| TC-02 | Format invalid JSON `{"a"` | Returns syntax error with position |
| TC-03 | Convert epoch `0` | Returns "1970-01-01 00:00:00 UTC" |
| TC-04 | Encode "hello" as Base64 | Returns "aGVsbG8=" |
| TC-05 | Decode JWT with three parts | Returns header, payload, signature |
| TC-06 | Encode JWT with HS256 | Generates valid signed token |

---

## 10. Risk Management

### 10.1 Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R-01 | Scope creep — too many tools planned | High | High | MoSCoW prioritization; strict sprint boundaries |
| R-02 | Complex crypto implementations introducing vulnerabilities | Medium | High | Rely on Web Crypto API; avoid custom cryptographic primitives |
| R-03 | Cross-browser inconsistencies | Medium | Medium | Test on Chrome, Firefox, Safari each sprint |
| R-04 | Performance degradation with large inputs | Low | Medium | Debounce inputs; lazy-load Monaco Editor if introduced |
| R-05 | UI consistency drift across many tools | High | Low | Centralize shared components (`ToolHeader`, `InputOutputPanel`) |
| R-06 | Team member unavailability | Medium | Medium | Pair programming; comprehensive documentation |

### 10.2 MoSCoW Prioritization

| Priority | Tools |
|----------|-------|
| Must Have | JSON Formatter, Time Converter, Base64, Hash Generator |
| Should Have | JWT Encoder/Decoder, Crypto Sandbox, Binary Calculator, Color Tool |
| Could Have | CIDR Calculator, Mock Generator, Line Coder, cURL Converter |
| Won't Have (v1) | Real-time collaboration, plugin marketplace |

---

## 11. Deployment and Distribution

### 11.1 Web Deployment

The application is built as a static Next.js export and can be deployed to any static hosting platform:

```bash
pnpm build
pnpm start
```

Recommended platforms:
- **Vercel** — Native Next.js hosting with zero config
- **Netlify** — Static site hosting
- **GitHub Pages** — Free hosting for open-source projects

### 11.2 Desktop Distribution via Electron

OmniTool can be wrapped as a native desktop application using Electron, producing platform-specific installers:

- **Windows:** `.exe` via NSIS installer
- **macOS:** `.dmg` disk image
- **Linux:** `.AppImage` or `.deb` package

This approach matches the distribution model used by VSCode, Discord, and Slack. Alternative: **Tauri**, which produces smaller binaries (~10 MB) by leveraging native OS webviews.

### 11.3 Build Pipeline

```
Source Code → pnpm install → TypeScript Compilation → Next.js Build
                                                            │
                                                            ▼
                                                  Static Export (`out/`)
                                                            │
                                              ┌─────────────┴─────────────┐
                                              ▼                           ▼
                                       Web Deployment           Electron Packaging
                                                                          │
                                                                          ▼
                                                               Platform Installers
```

---

## 12. Project Management Artifacts

### 12.1 Product Backlog (Sample)

| ID | User Story | Story Points | Sprint |
|----|------------|--------------|--------|
| US-01 | As a developer, I want to format JSON so I can read API responses easily | 3 | Sprint 1 |
| US-02 | As a developer, I want to convert epoch timestamps so I can debug logs | 2 | Sprint 1 |
| US-03 | As a developer, I want to decode JWT tokens so I can inspect auth flows | 5 | Sprint 3 |
| US-04 | As a developer, I want to encode JWT tokens so I can generate test fixtures | 5 | Sprint 6 |
| US-05 | As a developer, I want a dark theme so I can work comfortably at night | 2 | Sprint 6 |
| US-06 | As a developer, I want a keyboard shortcut to search tools so I can navigate quickly | 3 | Sprint 0 |

### 12.2 Burndown Chart (Conceptual)

```
Story Points Remaining
   60 │●
      │ ●
   45 │  ●
      │   ●
   30 │    ●
      │     ●
   15 │      ●
      │       ●
    0 │────────●
      └──┬──┬──┬──┬──┬──┬──
         S0 S1 S2 S3 S4 S5 S6
                 Sprint
```

### 12.3 Sprint Retrospective Template

For each sprint, document:
- **What went well?**
- **What did not go well?**
- **What will we change next sprint?**

---

## 13. Conclusion and Future Work

### 13.1 Project Outcomes

OmniTool successfully demonstrates the application of structured software engineering principles to a real-world problem. The project delivered:

- A working production-quality web application with 21 functional tools.
- A scalable plugin-based architecture supporting future extension.
- Comprehensive SDLC documentation suitable for academic and industry review.
- A modern technology stack reflecting current industry best practices.

### 13.2 Lessons Learned

1. **Centralizing shared components early** dramatically reduces effort when adding new tools.
2. **Pure-function separation** makes business logic trivially testable and reusable.
3. **A single source of truth (registry)** eliminates synchronization bugs between navigation, search, and routing.
4. **Design tokens (CSS variables)** make theme switching effortless when applied consistently.

### 13.3 Future Work

| Feature | Description |
|---------|-------------|
| Plugin System | Allow third-party tools to be loaded dynamically |
| Workspace Persistence | Save tool state to LocalStorage / IndexedDB |
| Electron / Tauri Build | Ship as a true cross-platform desktop application |
| Internationalization | Translate UI into multiple languages |
| Tool Pipelines | Chain tool outputs (e.g., Base64 decode → JSON format → JWT inspect) |
| Cloud Sync (Opt-in) | Sync preferences and recent tools across devices |
| Mobile Optimization | Responsive layouts for tablet and mobile use |

---

## 14. References

1. DevToys Open-Source Project. [https://devtoys.app](https://devtoys.app)
2. Next.js Documentation. [https://nextjs.org/docs](https://nextjs.org/docs)
3. React Documentation. [https://react.dev](https://react.dev)
4. shadcn/ui Component Library. [https://ui.shadcn.com](https://ui.shadcn.com)
5. MDN Web Crypto API. [https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
6. Schwaber, K. & Sutherland, J. *The Scrum Guide* (2020).
7. Sommerville, I. *Software Engineering* (10th Edition). Pearson, 2015.
8. Pressman, R. *Software Engineering: A Practitioner's Approach* (8th Edition). McGraw-Hill, 2014.
9. RFC 7519 — JSON Web Token (JWT). [https://datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519)
10. WCAG 2.1 Accessibility Guidelines. [https://www.w3.org/TR/WCAG21/](https://www.w3.org/TR/WCAG21/)

---

**Document End**

*Prepared by the OmniTool development team for the Software Development Management course.*

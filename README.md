# Anonymous Ephemeral Chat LLM Clone (Vue 3 + Express + TypeScript)

An anonymous, temporary ChatGPT-like conversational web application built as a modular monolith pairing a Vue 3 client with a stateless Express backend, utilizing TypeScript and npm workspaces.

## Architecture Highlights

- **Stateless Modular Monolith**: Express backend persists zero chat turns or session data in memory or storage. Scalable, completely ephemeral, and privacy-conscious.
- **Client-Held Chat History**: The Vue client maintains conversational turn history in ephemeral reactive memory, submitting prior turns alongside prompts for contextual conversations.
- **LLM Provider Seam**: Clean decoupled domain abstraction (`LLMProvider`) implementing a simulated boilerplate response, structurally ready for Google Gemini API (`@google/genai`) integration.
- **Perimeter Validation**: All incoming HTTP payloads are validated at the transport boundary with Zod schemas (`chatRequestSchema`) before reaching services.
- **Shared Contracts (`@repo/shared`)**: Single source of truth for Zod validation schemas and TypeScript types shared across client and server.
- **Transport Independence**: Domain services and providers are decoupled from HTTP primitives.
- **Standardized API Envelope**: Uniform response structures (`{ success: true, data }` / `{ success: false, error }`) mounted under `/api/v1`.
- **Modern Vue 3 Interface**: Pinia state management, Vue Router, Tailwind CSS, multiline textarea (Enter to send, Shift+Enter for newline), auto-scrolling feed, and inline error banner.
- **Full Test Suite**: Vitest integration tests for API endpoints using Supertest and Vue Test Utils for UI behavior.

---

## Project Structure

```
.
├── apps/
│   ├── api/                       # Express Backend
│   │   ├── src/
│   │   │   ├── core/              # Config, error hierarchy, error handler middleware, router
│   │   │   ├── modules/
│   │   │   │   ├── health/        # Health check (/api/v1/health)
│   │   │   │   └── chat/          # Chat module (controller, service, LLMProvider seam, routes)
│   │   │   ├── app.ts             # Express app setup with Helmet, CORS, and router
│   │   │   └── server.ts          # Server listener & graceful shutdown handlers
│   │   └── tests/                 # Supertest integration tests
│   │
│   └── web/                       # Vue 3 Frontend
│       ├── src/
│       │   ├── api/               # Axios client & chat API methods
│       │   ├── components/        # Navbar
│       │   ├── router/            # Vue Router (ChatView)
│       │   ├── stores/            # Pinia store for ephemeral chat state
│       │   └── views/             # ChatView with feed, input, and empty state
│       └── tests/                 # Vitest component tests
│
├── packages/
│   └── shared/                    # Shared Zod schemas & TypeScript types (@repo/shared)
│       └── src/
│           ├── schemas/           # Zod schemas (Chat, API envelopes)
│           └── types/             # Inferred TS types
│
├── docs/
│   ├── adr/                       # Architecture Decision Records
│   └── standards/                 # Frontend & backend coding standards
├── GLOSSARY.md                    # Project domain & architectural vocabulary
├── CODING_STANDARDS.md            # Coding standards index
├── SPEC-CHAT-CLONE.md             # Functional specification
└── tsconfig.base.json             # Root TypeScript base configuration
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10

### Installation

```bash
npm install
```

### Development

Run both the Express API (port 3001) and Vue Client (port 5173 with proxy) concurrently:

```bash
npm run dev
```

Or run them individually:

```bash
npm run dev:api   # Starts API with tsx hot-reload on http://localhost:3001
npm run dev:web   # Starts Vite dev server on http://localhost:5173
```

### Production Build

```bash
npm run build
```

This compiles `@repo/shared`, compiles Express to `apps/api/dist/`, and bundles Vue with Vite to `apps/web/dist/`.

To run the built API in production:
```bash
npm run start --workspace=apps/api
```

### Testing

Run tests across all workspaces:

```bash
npm run test
```

### Type Checking

```bash
npm run typecheck
```

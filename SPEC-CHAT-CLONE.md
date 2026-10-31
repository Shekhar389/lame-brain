# Specification: Anonymous Ephemeral Chat LLM Clone

## Problem Statement

The current repository is a generic modular monolith starter kit centered on sample CRUD `items`, carrying unnecessary boilerplate (items views, items repository, items store, items forms). A developer or user who wants a simple, temporary ChatGPT-like conversational web application for anonymous users without logins or persistent database storage has to navigate irrelevant sample code. Furthermore, there is no existing conversational domain slice, perimeter validation contract, or LLM provider seam to facilitate clean integration with Gemini.

## Solution

Remove all unnecessary starter artifacts (`items` vertical module, schemas, stores, views, and components). Rebuild the repository into an anonymous, temporary Chat LLM application inspired by ChatGPT. The solution provides:
- A completely stateless Express backend that persists zero chats or session states in memory or storage.
- An ephemeral, client-held conversation history where the browser sends prior chat turns alongside each prompt.
- An LLM provider seam implementing an immediate boilerplate mock response, structurally prepared for Google Gemini integration.
- Standard JSON API envelopes adhering to perimeter validation schemas defined in `@repo/shared`.
- A clean Vue 3 + Pinia + Tailwind CSS chat interface with a message feed, "New Chat" clearing capability, multiline prompt input (Enter to send, Shift+Enter for newline), auto-scrolling, and inline error feedback.

## User Stories

1. As an anonymous user, I want to access the chat application without logging in or registering, so that I can start conversing immediately.
2. As an anonymous user, I want to type a prompt into a multiline input box, so that I can draft detailed multi-sentence questions.
3. As an anonymous user, I want to press `Enter` to send my prompt, so that I have a fast and natural keyboard-driven chat workflow.
4. As an anonymous user, I want to press `Shift+Enter` to insert a newline in the input field, so that I can structure multi-paragraph queries without accidentally sending.
5. As an anonymous user, I want to click a dedicated Send button, so that I can submit my prompt using mouse or touch navigation.
6. As an anonymous user, I want the input field and send button to be disabled while a response is being generated, so that I cannot trigger duplicate or conflicting submissions.
7. As an anonymous user, I want to see my sent prompt immediately appear in the chat feed as a user turn, so that I have immediate visual feedback.
8. As an anonymous user, I want to see the assistant's reply rendered with preserved whitespace and line breaks, so that formatted text or lists remain readable.
9. As an anonymous user, I want the conversation view to automatically scroll to the bottom when a new response arrives, so that I always see the latest output without manual scrolling.
10. As an anonymous user, I want the assistant to receive prior conversation turns with my prompt, so that I can ask contextual follow-up questions.
11. As an anonymous user, I want to click a "New Chat" button in the navigation header, so that I can immediately wipe the conversation history and start over.
12. As a privacy-conscious user, I want no record of my chat session saved to any server-side database or cache, so that my conversations remain completely ephemeral and confidential.
13. As an anonymous user, I want refreshing the browser to completely reset my conversation, so that no residual messages persist in the browser after leaving the page.
14. As an anonymous user, I want to see a non-intrusive error banner if my request fails or if the network drops, so that I understand what went wrong without losing the prompt I typed.
15. As an anonymous user, I want empty or whitespace-only messages to be prevented from sending, so that I do not trigger empty requests.
16. As a backend developer, I want all incoming chat requests to undergo strict perimeter validation at the transport boundary, so that invalid payloads are rejected before reaching domain services.
17. As a backend developer, I want chat responses to follow the standardized API envelope (`{ success: true, data }` / `{ success: false, error }`), so that client error and response handling remains consistent.
18. As a backend developer, I want a decoupled LLM provider seam with a local boilerplate implementation, so that I can test the application without depending on an active Gemini API key.
19. As a backend developer, I want clear structural seams and comments for Gemini API credentials and SDK calls, so that connecting a live Gemini model later requires minimal refactoring.
20. As a frontend developer, I want a centralized Pinia chat store managing ephemeral state, so that message state and loading flags remain cleanly separated from component rendering logic.

## Implementation Decisions

### 1. Pruning Starter Boilerplate
- Remove the entire `items` vertical slice from the backend (controller, service, repository, routes, index).
- Remove `items` Zod schemas from the shared contract package.
- Remove `items` API client, store, views, components, and tests from the frontend.

### 2. Stateless Backend Architecture & Perimeter Validation
- The backend stores no conversation state, sessions, or user tokens.
- Expose `POST /api/v1/chat` on the Express API.
- Validate all incoming payloads against `chatRequestSchema` before passing data to the chat service.
- Return responses wrapped in the standard `ApiResponse<ChatResponseData>` envelope.

### 3. Shared Contract (`@repo/shared`)
- Define the following types and schemas in `@repo/shared`:
  - `ChatRole`: `'user' | 'model'`
  - `ChatTurn`: `{ role: ChatRole, content: string }`
  - `ChatRequest`: `{ message: string (trimmed, 1-4000 characters), history?: ChatTurn[] (optional unbounded array) }`
  - `ChatResponseData`: `{ message: ChatTurn }`

### 4. Decoupled LLM Provider Seam
- Create a domain service interface `LLMProvider` defining `generateResponse(prompt: string, history: ChatTurn[]): Promise<ChatTurn>`.
- Implement a default `GeminiChatService` boilerplate class implementing `LLMProvider` that returns an instant mock response with structural placeholders and documentation for `@google/genai` integration.

### 5. Frontend Architecture & Pinia Store
- Configure Vue Router with a single root route (`/`) pointing to `ChatView`.
- Create a `chat.store.ts` Pinia store holding:
  - `messages`: reactive array of `ChatTurn`
  - `loading`: boolean flag indicating pending generation
  - `error`: string or null for error messages
  - `sendPrompt(text: string)`: action sending current message and history to the backend
  - `clearChat()`: action resetting messages, loading, and error states to initial values
- State is held strictly in Vue reactive memory; neither `localStorage` nor `sessionStorage` is used.

### 6. User Interface & Interactions
- **Navbar**: Display application title and a "New Chat" button linked to `clearChat()`.
- **Chat Feed**: Render user and model messages in distinct chat bubbles. Model text uses CSS `whitespace-pre-wrap` for clean formatting.
- **Empty State**: Show a friendly greeting and prompt suggestions when the conversation history is empty.
- **Auto-scroll**: Automatically scroll to the bottom of the message container when a turn completes.
- **Input Area**: Multiline `<textarea>` positioned at the bottom of the screen. Pressing `Enter` (without Shift) triggers submission; `Shift+Enter` inserts a line break.
- **Error Presentation**: Inline banner displayed above the input box on error; user's typed input is retained in the input box so it can be resent.

## Testing Decisions

### What Makes a Good Test
- Tests must verify external boundary behaviors rather than internal implementation details.
- No mocking of internal Express routers, middlewares, or Pinia private state.

### Modules Tested
1. **API Transport Boundary (`apps/api/tests/chat.test.ts`)**:
   - Supertest sending `POST /api/v1/chat` with valid prompt and history returns `200 OK` and conforming `ApiResponse<ChatResponseData>`.
   - Sending an empty or whitespace-only message returns `400 Bad Request` with perimeter validation error details in the envelope.
   - Sending malformed history (e.g. invalid roles or non-string content) returns `400 Bad Request`.
2. **Frontend UI Boundary (`apps/web/tests/ChatView.test.ts`)**:
   - Renders empty chat welcome message and input area.
   - Submitting a prompt displays the user turn, disables inputs during loading, and displays the received assistant turn upon completion.
   - Clicking "New Chat" resets the visible conversation to the empty state.
   - Handling an API error displays the error banner without wiping the user's input buffer.

### Prior Art
- Backend tests follow the Supertest pattern established in `apps/api/tests/health.test.ts`.
- Frontend tests follow the Vitest and Vue Test Utils patterns in `apps/web/tests/App.test.ts`.

## Out of Scope

- Database persistence, ORMs, or disk storage for chats.
- User accounts, registration, login, JWTs, or session cookies.
- Token streaming via Server-Sent Events (SSE) or WebSockets.
- Markdown rendering libraries, syntax highlighters, or LaTeX support.
- Model selection dropdowns or temperature/parameter configuration controls.
- Live Gemini API billing or API key management UI.

## Further Notes

- Aligns with [GLOSSARY.md](GLOSSARY.md) vocabulary (`Chat Turn`, `Chat History`, `LLM Provider Seam`, `Perimeter Validation`, `API Envelope`).
- Complies with [ADR-0001](docs/adr/0001-modular-monolith-architecture.md), [ADR-0002](docs/adr/0002-api-response-envelope.md), and [ADR-0004](docs/adr/0004-stateless-ephemeral-chat.md).

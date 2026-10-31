# Glossary

Canonical domain and architectural vocabulary for this project.

## Architecture

**Module**:
An isolated vertical slice representing a single domain boundary within the backend, encapsulating routes, controller, service, repository, and schemas, exposing only a public interface.
_Avoid_: Layer folder, horizontal slice

**Shared Contract**:
A centralized package (`packages/shared`) defining canonical Zod schemas and inferred TypeScript types shared between client and server.
_Avoid_: Backend-dependent DTOs, duplicated interfaces

**Perimeter Validation**:
The practice of validating and parsing all incoming payloads at the transport boundary before passing data to domain functions.
_Avoid_: Internal defensive type checks

**API Envelope**:
The standardized top-level JSON structure (`{ success: true, data: T }` or `{ success: false, error: ... }`) applied across all HTTP responses.
_Avoid_: Raw un-enveloped JSON payloads, polymorphic status schemas

**Repository Interface**:
An asynchronous abstraction separating domain operations from the underlying persistence mechanism (e.g. in-memory or database).
_Avoid_: Direct database queries inside controllers or transport layers

## Chat Domain

**Chat Turn**:
A single conversational exchange composed of an author role (`user` or `model`) and its textual content.
_Avoid_: Dialogue pair, prompt-reply cycle

**Chat History**:
The ordered array of prior chat turns held strictly in client-side ephemeral memory during the active session and transmitted with each completion request.
_Avoid_: Server session cache, persisted thread, database message history

**LLM Provider Seam**:
The abstraction interface separating chat orchestration from the actual generative AI engine, initialized with a simulated boilerplate implementation for local development and ready for Gemini API integration.
_Avoid_: Direct vendor SDK coupling in routes or controllers

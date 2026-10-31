# Backend Coding Standards

Judgement calls for backend, API, and worker code (`apps/api/`, `packages/server/`, database layers). Mechanical rules (linting, formatting) belong in tooling.

## Architecture & Boundary Validation
- **Validate at the Perimeter:** Validate and parse all incoming payloads, route parameters, and query strings at the transport boundary (controllers/adapters) before passing data to domain functions. Domain layers must only receive typed, validated domain models.
- **Transport Independence:** Business logic and domain services must not import or depend on HTTP-specific primitives (e.g. Express/Fastify `req`, `res`, HTTP status codes, or headers).
- **Deep Modules:** Prefer deep modules with simple, clear interfaces that hide internal implementation complexity. Avoid paper-thin pass-through layers (e.g. a controller that simply calls a service that simply calls a repository with no transformation).

## Data Access & Concurrency
- **Transaction Integrity:** Operations that write or modify multiple entities must occur within explicit database transactions or define clear compensation logic.
- **No N+1 Queries in Loops:** Do not execute database queries or remote RPC calls inside `forEach` or `for` loops. Batch operations or join data at the query seam.
- **Side Effect Ordering:** Trigger irreversible external side effects (sending emails, publishing event notifications, charging payments) only after database transactions have successfully committed.

## Error Handling & Reliability
- **Typed Domain Errors:** Distinguish expected business failures (e.g. `InsufficientFundsError`, `NotFoundError`) from unexpected infrastructure crashes. Map domain errors to appropriate transport codes only at the outer boundary.
- **Idempotency:** Any mutation endpoint or queue handler that processes external requests or retries must be idempotent or guard against duplicate processing.

# Coding Standards

Judgement calls enforced during `/code-review`. Mechanical rules (formatting, linting, imports) belong in linter/compiler configs, not here.

> [!NOTE]
> **Context Protection:** Review agents should read only the sub-standards relevant to the files touched in the diff. Do not load frontend standards for backend-only changes, or vice versa.

## Monorepo Standards Index
- **Frontend / Client Apps** (`apps/web/`, `packages/ui/`, UI components):
  See [`docs/standards/frontend.md`](file:///home/ryuk/project/lame-brain/docs/standards/frontend.md).
- **Backend / Services** (`apps/api/`, `packages/server/`, database, background jobs):
  See [`docs/standards/backend.md`](file:///home/ryuk/project/lame-brain/docs/standards/backend.md).

---

## Universal Standards (Applies across all packages)

### 1. Simplicity & Scope
- **No Speculative Generality:** Build strictly what the spec or ticket asks for. Do not introduce abstractions, configuration switches, or generic layers for hypothetical future use cases.
- **Deep Interfaces:** Expose small, clean interfaces with extensive behavior behind them. Don't export internal helper functions unless required by multiple packages.

### 2. Testing
- **Test Seams at the Highest Level:** Prefer one high-level seam that exercises real logic over mocking intermediate layers.
- **Behavior Over Implementation:** Test what the system does from the outside, not how internal classes or functions are structured.

### 3. Fail Fast
- Validate early at the boundary; assume internal code receives clean, well-formed types.

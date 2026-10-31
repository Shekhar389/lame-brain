# Frontend Coding Standards

Judgement calls for frontend and UI code (`apps/web/`, `packages/ui/`, client components). Mechanical rules (formatting, linting) belong in tooling.

## State Management & Reactivity
- **State Locality:** Keep state as close as possible to the component that consumes it. Never promote state to global stores or URL params unless multiple disconnected views genuinely require it.
- **Derive, Don't Synchronize:** Derive values on the fly during render. Avoid synchronization hooks or watchers (e.g. syncing state via `useEffect`) to update secondary state.
- **Explicit Data-Loading States:** Every view fetching data must explicitly handle Loading, Error, Empty, and Success states. Avoid unhandled `undefined` flashes.

## Architecture & Component Design
- **Separate Presentation from Data Fetching:** Pure presentational components should accept typed props and callbacks. Data fetching, pagination, and caching belong in dedicated hooks or container components.
- **Semantic HTML First:** Use native HTML elements (`<button>`, `<nav>`, `<form>`) rather than `div` tags with click handlers. Avoid unnecessary ARIA wrappers when standard elements suffice.
- **Defensive Rendering:** Handle missing or partial API responses gracefully without crashing the component tree; use Error Boundaries at route and widget seams.

## Testing
- **Test User Behavior, Not Implementation:** Query by user-visible text, accessible roles, or labels (e.g., Testing Library queries), not component internal state, class names, or test IDs unless strictly necessary.
- **Mock at the Network Boundary:** Mock HTTP requests (e.g., via MSW) rather than mocking custom hooks or internal component functions.

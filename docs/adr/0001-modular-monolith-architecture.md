# Modular Monolith with npm Workspaces and Shared Contract Package

We decided to structure the repository as an npm workspace monorepo (`apps/web`, `apps/api`, `packages/shared`), with the Express backend organized into vertical feature-first modules exposing strict public interfaces. This provides end-to-end type safety and validation sharing via Zod without backend leakage, maintaining strong domain encapsulation while avoiding the operational complexity of microservices.

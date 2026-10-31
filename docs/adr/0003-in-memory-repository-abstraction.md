# Repository Abstraction for Domain Persistence

Backend modules will access persistence through asynchronous repository interfaces, using an in-memory implementation for the starter skeleton. This allows immediate local execution without external database infrastructure while keeping domain services decoupled from storage technologies, enabling seamless migration to Prisma or Drizzle later.

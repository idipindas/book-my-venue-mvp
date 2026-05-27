---
  What's included

  Infrastructure
  - docker-compose.yml — PostgreSQL 16 + Redis 7
  - apps/api/package.json — all deps (Express, TypeORM, BullMQ, ioredis, Razorpay, Cloudinary, etc.)
  - tsconfig.json with decorator support

  Config (src/config/)
  - env.ts — typed env with required/optional guards
  - database.ts — TypeORM DataSource
  - redis.ts — ioredis client
  - queue.ts — BullMQ setup + auto-cancel worker (fires 15 min after pending booking)

  Entities — all 6 with @Index on FKs and query columns

  Middleware — auth (JWT guard), role (RBAC), validate (class-validator), upload (Multer/Cloudinary), error handler

  Modules — all 9 fully implemented:

  ┌───────────────┬─────────────────────────────────────────────────────────────────────────┐
  │    Module     │                               Highlights                                │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ auth          │ Register, login, Google OAuth, JWT rotate, email verify, password reset │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ users         │ Profile + password change                                               │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ venues        │ Haversine nearby, full-text search, filtered/paginated list             │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ bookings      │ Redis distributed lock on slot, BullMQ auto-cancel, refund policy       │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ payments      │ Razorpay order creation, webhook with signature verify, refunds         │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ owner         │ Full venue CRUD, availability management, booking accept/decline        │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ admin         │ Venue approval, user management, platform analytics                     │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ media         │ Cloudinary streaming upload                                             │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ notifications │ Paginated, mark-read                                                    │
  └───────────────┴─────────────────────────────────────────────────────────────────────────┘

  Seeds — 12 Kerala venues across 7 cities with 14 days of slot availability

  ---
  To get started

  # 1. Start services
  docker-compose up -d

  # 2. Copy env
  cd apps/api && cp .env.example .env  # fill in JWT secrets at minimum

  # 3. Generate + run migration
  Entities — all 6 with @Index on FKs and query columns

  Middleware — auth (JWT guard), role (RBAC), validate (class-validator), upload (Multer/Cloudinary), error handler

  Modules — all 9 fully implemented:

  ┌───────────────┬─────────────────────────────────────────────────────────────────────────┐
  │    Module     │                               Highlights                                │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ auth          │ Register, login, Google OAuth, JWT rotate, email verify, password reset │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ users         │ Profile + password change                                               │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ venues        │ Haversine nearby, full-text search, filtered/paginated list             │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ bookings      │ Redis distributed lock on slot, BullMQ auto-cancel, refund policy       │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ payments      │ Razorpay order creation, webhook with signature verify, refunds         │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ owner         │ Full venue CRUD, availability management, booking accept/decline        │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ admin         │ Venue approval, user management, platform analytics                     │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ media         │ Cloudinary streaming upload                                             │
  ├───────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ notifications │ Paginated, mark-read                                                    │
  └───────────────┴─────────────────────────────────────────────────────────────────────────┘

  Seeds — 12 Kerala venues across 7 cities with 14 days of slot availability

  ---
  To get started

  # 1. Start services
  docker-compose up -d

  # 2. Copy env
  cd apps/api && cp .env.example .env  # fill in JWT secrets at minimum

  # 3. Generate + run migration
  npm run migration:gen --name=InitialSchema --workspace=apps/api
  npm run migration:run --workspace=apps/api

  # 4. Seed
  npm run seed --workspace=apps/api

  # 5. Dev server
  npm run dev:api
# Architecture

`open-commerce` is a public, simple e-commerce reference project — a from-scratch rebuild of a private project ("papelnerd"). It's an Nx/pnpm monorepo made of independently deployable services, each owning its own Postgres database, plus two frontend apps.

Read this first before starting any feature work.

## System map

| Service | Path | Stack | Owns | Status |
|---|---|---|---|---|
| **catalog** | `services/catalog` | NestJS 11 + Prisma 7 | Products, brands, categories, colors, kinds, offers | Built (canonical pattern — see below) |
| **accounts** | `services/accounts` | NestJS + Prisma | Customers, auth identities, addresses | Not yet built |
| **payments** | `services/payments` | Express + Inngest | Payment intents, charges, refunds, provider webhooks | Not yet built |
| **oms** | `services/oms` | NestJS + Inngest | Orders, order lines, fulfillment status, order lifecycle workflows | Not yet built |
| **tms** | `services/tms` | Express + Hono | Shipping quotes, carriers, tracking | Not yet built |

| Frontend | Path | Stack | Audience |
|---|---|---|---|
| **storefront** | `apps/storefront` | Astro | Public customers — product browsing, SEO-heavy, content-first, minimal client JS |
| **admin** | `apps/admin` | Next.js (App Router) | Internal staff — managing catalog, orders, payments, shipping |

`packages/*` is reserved for code shared across services/apps (e.g. a shared TS types package, an API client, lint config). Nothing lives there yet — don't create a shared package speculatively; extract one only when a second consumer actually needs it.

## Data ownership

Each service owns exactly one Postgres database and never queries another service's database directly. Cross-service data needs go through that service's HTTP API (or, for async workflows, through Inngest events). `docker-compose.yaml` provisions one database per service on a shared local Postgres instance:

```
opencommerce_catalog
opencommerce_accounts
opencommerce_payments
```

(`oms` and `tms` databases will be added to the compose file's `POSTGRES_MULTIPLE_DATABASES` list when those services are scaffolded.)

## Per-service layering

### NestJS + Prisma services (catalog, accounts)

`services/catalog` is the canonical example — follow its structure for `accounts`. One module per domain entity, all currently `@Global()` (every provider is app-wide since there's no cross-domain isolation boundary yet — keep this convention unless a real need for module scoping shows up):

```
services/<name>/src/
├── app.module.ts          # wires every domain module + DatabaseService
├── app.controller.ts
├── main.ts
├── database.service.ts    # PrismaClient wrapper (injected as DatabaseService)
├── database/prisma/       # generated Prisma client output (checked into src/)
└── <domain>/
    ├── <domain>.module.ts
    ├── <domain>.controller.ts
    ├── <domain>.service.ts
    └── <domain>.dto.ts
```

No `entities/`, `repositories/`, or `interfaces/` folders — the Prisma schema is the single source of truth for shape, DTOs are hand-declared `class-validator` classes composed from each other (`OmitType`/`PickType`), and services call `DatabaseService` (Prisma) directly. See [DATA_LAYER.md](DATA_LAYER.md).

### NestJS + Inngest (oms)

Same NestJS/Prisma layering as above, plus an `inngest/` folder per domain for background workflows (order lifecycle transitions, fulfillment events):

```
services/oms/src/<domain>/inngest/
└── <event-name>.function.ts
```

Inngest functions call the same domain service functions a controller would — never duplicate business logic between the HTTP path and the event path.

### Express + Inngest (payments)

```
services/payments/src/
├── server.ts               # Express app bootstrap
├── database.service.ts     # Prisma wrapper (Express version)
├── inngest/
│   ├── client.ts
│   └── functions/<event-name>.function.ts
└── <domain>/
    ├── <domain>.routes.ts
    ├── <domain>.service.ts
    └── <domain>.schema.ts  # Zod, not class-validator (no Nest DTO pipeline here)
```

Payments is Inngest-first: provider webhooks land as HTTP requests, get validated, and are turned into Inngest events for reliable, retryable processing (idempotency keys required on every payment-mutating event — see [DATA_LAYER.md](DATA_LAYER.md)).

### Express + Hono (tms)

```
services/tms/src/
├── server.ts       # Express app, mounts the Hono app for the tms routes
├── app.ts          # Hono app: route definitions, middleware
└── <domain>/
    ├── <domain>.routes.ts   # Hono router
    ├── <domain>.service.ts
    └── <domain>.schema.ts   # Zod
```

Hono is used here for its lightweight, fetch-standard routing — keep route handlers thin, push logic into the domain service files, same as every other service.

## Import boundaries

- A service never imports another service's source code. Cross-service communication is HTTP (synchronous) or Inngest events (asynchronous).
- Within a service, domain folders don't import each other's internals directly — go through the exported service class/functions (e.g. `product.service.ts` may call `ProductsService`, not reach into `brand/` internals).
- Frontends never talk to the database. They call service HTTP APIs only (via Next.js Server Actions for `admin`, via fetch/Astro server endpoints for `storefront`).

## Cross-service features

A feature that spans services (e.g. checkout: `oms` creates the order, `payments` charges it, `tms` gets a shipping quote) is designed once in `neo`'s architecture pass and implemented as separate, independently reviewable changes per service — see the workflow in [GUIDE.md](GUIDE.md). Coordination between services at runtime is via Inngest events, not synchronous chains of HTTP calls, wherever the interaction can tolerate eventual consistency (e.g. "order paid" → tms starts shipping).

## See also

- [DATA_LAYER.md](DATA_LAYER.md) — schema, DTO, and service-method conventions
- [API_LAYER.md](API_LAYER.md) — controller/route conventions per framework
- [FRONTEND.md](FRONTEND.md) — Astro storefront and Next.js admin conventions
- [SCHEMA.md](SCHEMA.md) — actual database schema reference
- [GUIDE.md](GUIDE.md) — engineering principles and the feature workflow

# API Layer

Conventions for the outermost layer of each service — where requests come in and responses go out. This layer's job is orchestration: parse/validate input, call one service-layer method, shape the response. It never talks to the database directly and never contains business logic.

## NestJS controllers (catalog, accounts, oms)

- One controller per domain, thin. `@nestjs/swagger` decorators (`@ApiOperation`, `@ApiParam`, `@ApiQuery`, `@ApiResponse`) on every route, as in `services/catalog/src/product/product.controller.ts`.
- Route handler method names are PascalCase verbs (`GetProductsList`, `CreateProduct`, `EditProduct`) — this is the existing convention in `catalog`, keep it consistent across new controllers rather than switching to Nest's usual camelCase.
- Validate input via the DTO's `class-validator` decorators (Nest's global `ValidationPipe`), not manual checks inside the handler.
- A controller method does exactly one service call plus response shaping — no loops, no conditionals implementing business rules.

## Express routes (payments, tms's Express host)

- One `<domain>.routes.ts` file per domain, exporting an `express.Router()`.
- Validate input with the domain's Zod schema (`schema.safeParse`) at the top of the handler; on failure, respond `400` with the Zod issues, don't call the service.
- Keep the same "one service call per handler" discipline as Nest controllers.

## Hono routes (tms)

- One `<domain>.routes.ts` file per domain, exporting a Hono `Hono()` sub-app mounted in `app.ts`.
- Use Hono's built-in `zValidator` (or manual `schema.safeParse`) for input validation — same Zod schemas as the Express side of that service.
- Handlers return via Hono's `c.json(...)`; keep them as thin as the Nest/Express equivalents.

## Errors → HTTP responses

Every framework maps `AppError` subclasses (see [DATA_LAYER.md](DATA_LAYER.md)) to HTTP status via a shared error-handling middleware/filter, not per-handler try/catch:

- Nest: an `AppExceptionFilter` (`@Catch(AppError)`).
- Express: an error-handling middleware registered last (`(err, req, res, next) => ...`).
- Hono: `app.onError((err, c) => ...)`.

Unrecognized errors always become a generic `500` with a generic message — never leak a stack trace or internal error message to the client.

## Next.js Server Actions (admin app only)

The `admin` app is the one place a "server action" pattern exists, and it is a thin HTTP client, not a data-layer participant:

```
apps/admin/app/<domain>/actions.ts   # 'use server'
```

A Server Action here: reads the authenticated session → calls the relevant service's HTTP API (e.g. `POST /products` on `catalog`) → revalidates the affected path → returns `{ error }` or `{ success }` to the client. It never imports Prisma or any service's internals directly — `admin` talks to services exclusively over HTTP, same as any other API consumer.

## See also

- [ARCHITECTURE.md](ARCHITECTURE.md) — per-service folder layout
- [DATA_LAYER.md](DATA_LAYER.md) — service-layer and error conventions
- [FRONTEND.md](FRONTEND.md) — how `admin` and `storefront` consume these APIs

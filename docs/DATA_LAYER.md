# Data Layer

Conventions for schemas, DTOs, and service (business-logic) methods across every service. Read [ARCHITECTURE.md](ARCHITECTURE.md) first for the per-framework folder layout.

## Schema is the source of truth

- **Prisma services** (catalog, accounts, oms): `prisma/schema.prisma` defines every field, relation, and constraint. Never hand-declare a type that duplicates a model shape — import the generated types (`Product`, `Prisma.ProductWhereInput`, etc.) from the generated client, as `product.service.ts` already does (`export { type Product, ProductStatusEnum } from "../database/prisma/client"`).
- **Express services without Prisma-only concerns** (payments event payloads, tms route inputs): Zod schemas in `<domain>.schema.ts` are the source of truth; infer types with `z.infer<typeof Schema>` rather than writing a parallel interface.

## DTOs (Nest services)

DTOs are `class-validator` classes, composed from each other — never built from scratch field-by-field twice:

```ts
export class CreateProductDto { /* full field set + decorators */ }

export class EditProductDto extends OmitType(CreateProductDto, ["barcode", "slug", "sku"]) {
  id!: number;
  status!: ProductStatusEnum;
}
```

This is the existing pattern in `services/catalog/src/product/product.dto.ts` — follow it exactly for new domains and new services.

## Service methods

**Current pattern in `catalog`** (e.g. `ProductsService.create(title, slug, sku, barcode, model, brandId, ...)`) takes many positional arguments. This works but doesn't scale past ~4-5 params and makes call sites error-prone (easy to swap two same-typed args by accident).

**Convention going forward:** new service methods (in `accounts`, `oms`, `payments`, `tms`, and any *new* methods added to `catalog`) take a single typed input object instead of a long positional list:

```ts
async create(input: CreateProductInput) { ... }
```

Don't refactor `catalog`'s existing positional-arg methods just to match this — only apply the object-param convention to new code, to avoid churn-only diffs.

Every service method:
- Is a plain class method (Nest) or exported async function (Express/Hono) — no repository classes, no generic `.execute()` wrappers.
- Returns `null` (not throwing) when a "find one" lookup finds nothing.
- Throws a typed error for business-rule violations (see Errors below), never a bare `Error`.
- Never imports another domain's or another service's internals — see the import-boundary rules in [ARCHITECTURE.md](ARCHITECTURE.md).

## Errors

Each service defines its own small set of domain error classes extending a shared `AppError` base (e.g. `services/<name>/src/errors/app-error.ts`, `product-not-found.error.ts`). Controllers/routes catch `AppError` subclasses and map them to HTTP status codes; every other error becomes a generic 500 with no internal detail leaked to the client.

## Domain rules (apply project-wide)

- **Money is integer cents**, never floats. `Offer.price` in the catalog schema is already `Int` — follow this in every new money field (`payments`, `oms` order totals).
- **Soft delete** via a `deletedAt: DateTime?` column where records need to be recoverable/auditable (orders, payments) — omit it for pure catalog metadata (brand, color, kind) unless a real need arises.
- **Ownership/account scoping**: once `accounts` exists, every query in `oms`/`payments` that returns customer data must be scoped to the authenticated account — never trust an `accountId`/`customerId` passed in the request body; it must come from the authenticated session/token.
- Derived flags (e.g. "is this the active offer") are computed, never stored redundantly alongside the data that determines them.

## See also

- [API_LAYER.md](API_LAYER.md) — how controllers/routes call into this layer
- [SCHEMA.md](SCHEMA.md) — the actual current schema per service

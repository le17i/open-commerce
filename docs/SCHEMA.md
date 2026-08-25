# Schema Reference

Quick lookup of each service's database schema. Source of truth is always each service's `prisma/schema.prisma` (or, for payments/tms, its Zod schemas) — this file is a convenience index, keep it in sync when a schema changes.

## catalog (`services/catalog/prisma/schema.prisma`)

| Model | Key fields | Notes |
|---|---|---|
| `Category` | `slug`, `code`, `title`, `description?`, `parentId?` | Self-referential parent/children (one level modeled via `parentId`) |
| `Brand` | `slug`, `code`, `title`, `description?` | |
| `Color` | `slug`, `code`, `colorHex`, `title`, `description?` | |
| `Tag` | `label`, `slug` | Many-to-many with `Product` |
| `Kind` | `code`, `label` | Product type/kind classification |
| `Product` | `slug`, `barcode`, `sku`, `model`, `title`, `description?`, `content?`, `stock`, `height`, `length`, `weight`, `width`, `status` (`ProductStatusEnum`), `parentId?` (self-referential variants), `brandId`, `categoryId`, `colorId`, `kindId` | `status`: `DRAFT` \| `PUBLISHED` \| `OUTDATE` |
| `Image` | `filename`, `ext?`, `description?`, `productId` | |
| `Offer` | `price` (int cents), `promotionalPrice` (int cents), `discount`, `paymentMethods` (`OfferPaymentMethod[]`), `isActive`, `productId` | `OfferPaymentMethod`: `CREDIT_CARD` \| `PIX` |

## accounts — not yet built

Expected shape once scaffolded: `Account`/`Customer`, `Address`, and an auth-identity model. Fill in this section when `services/accounts/prisma/schema.prisma` exists.

## payments — not yet built

Zod schemas (no Prisma model list here — see `services/payments/src/**/*.schema.ts` once it exists). Expect `PaymentIntent`, `Charge`, `Refund`, keyed to an `orderId` from `oms` and scoped to an `accountId` from `accounts`. Amounts as integer cents.

## oms — not yet built

Expected: `Order`, `OrderLine`, an order-status enum driving the Inngest lifecycle workflow, `fulfillmentStatus`. Fill in once `services/oms/prisma/schema.prisma` exists.

## tms — not yet built

Zod schemas for `ShippingQuote`, `Carrier`, `Shipment`/tracking. Fill in once `services/tms/src/**/*.schema.ts` exists.

## See also

- [DATA_LAYER.md](DATA_LAYER.md) — how these schemas are used (DTOs, service methods, errors)
- [CODEBASE.md](CODEBASE.md) — index of the actual service functions operating on this schema

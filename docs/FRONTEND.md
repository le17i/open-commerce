# Frontend

Two separate frontend apps, with different jobs and different rules. See [ARCHITECTURE.md](ARCHITECTURE.md) for where they live and what they talk to.

## Astro storefront (`apps/storefront`)

Public-facing, customer-facing, SEO-first. Rules:

- Prefer static/server-rendered `.astro` pages over client-side JS. Reach for an island (`client:load`/`client:visible` React or Preact component) only for genuinely interactive pieces (cart widget, quantity selector) — never for rendering content that could be server output.
- Data fetching happens in the `.astro` frontmatter (server-side, at request/build time), calling the relevant service's public HTTP API (e.g. `catalog`'s `GET /products`). No client-side `fetch()` for content that's known at render time.
- Every route maps to a real customer journey — product listing, product detail, cart, checkout handoff. Keep route files under `src/pages/` matching the URL structure directly.
- Images/assets go through Astro's built-in image optimization (`astro:assets`), not raw `<img>` tags with unoptimized sources.

## Next.js admin (`apps/admin`)

Internal tool for staff — catalog management, order review, payment/shipping status. Rules:

- Server Components by default; fetch data only in Server Components, by calling the relevant service's HTTP API (never a client-side `fetch()` for initial data — see [API_LAYER.md](API_LAYER.md)).
- `'use client'` only for interactive components (forms, filters, modals).
- Forms use React Hook Form + `zodResolver`, submitting through a Server Action (`app/<domain>/actions.ts`) — never call a service API directly from client-side `fetch()`.
- Every interactive element that a test needs to target gets a `data-testid` (matches the E2E convention in [TESTING_E2E.md](TESTING_E2E.md)).
- Styling: Tailwind CSS + shadcn/ui for anything beyond a basic element.
- Always implement `loading.tsx`/`error.tsx` for a route segment that fetches data — don't ship a route with no loading/error state.

## Shared conventions

- Both apps import the shared `packages/*` code the same way (once such packages exist) — no duplicating a types/client package's logic locally "for now."
- Neither app ever imports a service's Prisma client or database code directly. HTTP only.

## See also

- [ARCHITECTURE.md](ARCHITECTURE.md) — system map
- [API_LAYER.md](API_LAYER.md) — Server Action conventions
- [TESTING_E2E.md](TESTING_E2E.md) — `data-testid` and journey-testing conventions

# Unit Testing

Unit tests target the service (business-logic) layer, in isolation from the database and network. See [DATA_LAYER.md](DATA_LAYER.md) for the layer being tested.

## Runner per stack

- **NestJS services** (catalog, accounts, oms): Jest, Nest's default (`@nestjs/testing`'s `Test.createTestingModule`).
- **Express/Hono services** (payments, tms): Vitest.

## What to mock

Mock the one thing a service method actually depends on — `DatabaseService`/Prisma client (Nest) or the Prisma/DB client (Express). Never hit a real database or make a real HTTP/Inngest call in a unit test. There is no repository class to mock — service methods call `DatabaseService`/Prisma directly, so mock that boundary:

```ts
// Nest example
const db = { product: { create: vi.fn(), findMany: vi.fn() } };
const service = new ProductsService(db as unknown as DatabaseService);
```

## Structure

- Arrange-Act-Assert. One `describe` per service class/module, one `it` per behavior.
- Cover: happy path, validation errors (if the service itself enforces a rule beyond DTO validation), business-rule errors (e.g. rejecting an edit on a discontinued product), not-found handling (`findOne` returning `null`).
- Tests are independent — no test depends on another test's side effects or run order.
- Test behavior, not implementation — assert on the returned value / thrown error, not on which internal method was called, unless verifying a specific side effect (e.g. "creates the product with an initial offer").

## Coverage

Target >80% line coverage on the service layer of each domain. Coverage is a floor, not a goal — a domain with complex branching logic (order-state transitions in `oms`, payment retry logic in `payments`) deserves tests beyond the number, especially around error paths.

## Inngest functions (oms, payments)

Test the function body as a plain async function with its dependencies mocked, the same as any other service method. Framework-specific event-triggering/step mechanics are covered by the E2E layer, not unit tests.

## See also

- [TESTING_INTEGRATION.md](TESTING_INTEGRATION.md) — backend API-level integration tests (real DB via testcontainers)
- [TESTING_E2E.md](TESTING_E2E.md) — journey-level tests across the full stack
- [CHECKLISTS.md](CHECKLISTS.md) — the pre-PR gate this feeds into

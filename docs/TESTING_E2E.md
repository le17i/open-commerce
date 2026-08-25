# End-to-End Testing

E2E tests cover real customer/staff journeys through a running frontend, using Playwright. They live per frontend app (`apps/storefront/e2e/`, `apps/admin/e2e/`), not per backend service — backend services are covered by their own API-level integration tests (see [TESTING_INTEGRATION.md](TESTING_INTEGRATION.md)) plus the unit tests in [TESTING_UNIT.md](TESTING_UNIT.md).

## What to cover

- Test the journey, not the implementation: "a customer can find a product and add it to their cart," not "the ProductCard component renders."
- One spec file per domain/journey (`e2e/product-browsing.spec.ts`, `e2e/checkout.spec.ts` in storefront; `e2e/product-management.spec.ts` in admin).
- Per journey: happy path, at least one validation-error path, at least one business-rule-error path (e.g. checkout with an out-of-stock item), and the primary navigation in/out of the flow.

## Selectors

Always select via `data-testid`, never via CSS class or element type — classes and markup change for styling reasons unrelated to the test. Naming convention: `<action>-<subject>` (`add-to-cart-btn`, `product-title`, `checkout-submit-btn`).

## Data

- Don't hardcode fixture data that could collide across runs — suffix with a timestamp/random id where the test creates data (`e2e-product-${Date.now()}`).
- Tests are independent: no spec depends on state left behind by another spec. Use `test.beforeEach` to establish the needed state (login, seed data) fresh each time.

## Structure

```ts
test.describe("checkout", () => {
  test.beforeEach(async ({ page }) => { /* login / seed as needed */ });

  test("customer can complete checkout with a valid card", async ({ page }) => { ... });
  test("checkout rejects an expired card", async ({ page }) => { ... });
});
```

## See also

- [TESTING_UNIT.md](TESTING_UNIT.md) — service-layer tests
- [TESTING_INTEGRATION.md](TESTING_INTEGRATION.md) — backend API-level integration tests
- [FRONTEND.md](FRONTEND.md) — `data-testid` placement rules
- [CHECKLISTS.md](CHECKLISTS.md) — pre-PR gate

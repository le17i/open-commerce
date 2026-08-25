# API-Level Integration Testing (Backend Services)

Integration tests exercise a backend service's real HTTP surface — routing, validation pipes/middleware, and the database — without a frontend. For NestJS services (catalog, accounts, oms) this means Jest + [Supertest](https://github.com/ladjs/supertest) driving the app's `INestApplication`; for Express/Hono services (payments, tms) the equivalent is Vitest + Supertest against the Express/Hono app instance. They are the layer [TESTING_E2E.md](TESTING_E2E.md) refers to as "their own API-level integration tests" — Playwright E2E never targets a backend service directly.

## Runner and location

- Live in each service's `test/` directory as `*.e2e-spec.ts` (Nest convention — the name is inherited from Nest's CLI scaffolding, but these are integration tests in the sense above, not Playwright journeys), one file per domain: `test/brand.e2e-spec.ts`, `test/product.e2e-spec.ts`, etc.
- Run via each service's `test:e2e` script (`jest --config ./test/jest-e2e.json` for Nest services). Exact script names per [COMMANDS.md](COMMANDS.md).

## Database: `@testcontainers/postgresql`

Integration tests hit a real Postgres — never mock the DB client here (that's what unit tests are for, see [TESTING_UNIT.md](TESTING_UNIT.md)). Use [`@testcontainers/postgresql`](https://node.testcontainers.org/modules/postgresql/) to provision that Postgres, rather than depending on a developer having the root `docker-compose.yaml` Postgres already running — this keeps `test:e2e` self-contained and CI-safe, requiring only a reachable Docker daemon.

Pattern (Nest services; Express/Hono services follow the same shape against their own app entrypoint):

- One container for the whole `test:e2e` run, started/stopped via Jest `globalSetup`/`globalTeardown` (`test/jest-e2e-global-setup.ts`, `test/jest-e2e-global-teardown.ts`, wired into `jest-e2e.json`) — not one container per spec file, to keep runtime reasonable.
- `globalSetup` starts the container, runs `prisma migrate deploy` against it, and persists the resulting connection string (`process.env.DATABASE_URL` plus a file under `test/`, since `globalSetup` and spec-file workers don't share memory) for specs to read before building their `TestingModule`.
- `globalTeardown` stops the container.
- Because the container is shared across spec files within one run, each spec is still responsible for cleaning up the rows it creates (see Data below) — the container's lifetime spans the whole `test:e2e` invocation, not a single file.

```ts
// test/jest-e2e-global-setup.ts
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

export default async function globalSetup() {
  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("<service>_test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const databaseUrl = container.getConnectionUri();

  execSync("pnpm prisma migrate deploy", {
    cwd: __dirname + "/..",
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });

  process.env.DATABASE_URL = databaseUrl;
  writeFileSync(__dirname + "/.e2e-db-url", databaseUrl);
  (globalThis as any).__PG_CONTAINER__ = container;
}
```

```ts
// test/jest-e2e-global-teardown.ts
export default async function globalTeardown() {
  const container = (globalThis as any).__PG_CONTAINER__;
  if (container) await container.stop();
}
```

Each spec reads the persisted connection string before compiling its `TestingModule`, since the service's DB client reads `DATABASE_URL` at construction time:

```ts
beforeAll(async () => {
  process.env.DATABASE_URL = readFileSync(__dirname + "/.e2e-db-url", "utf-8").trim();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  await app.init();
});
```

The root `docker-compose.yaml` Postgres remains for local manual dev/debugging — testcontainers is additive and is what `test:e2e` actually runs against, in both local runs and CI. A Docker daemon must be reachable wherever `test:e2e` executes.

## What to cover

Per domain/resource, cover:

- **Happy path** — 2xx status and response shape for each route.
- **Validation error** — 400 for missing/invalid required fields (confirms the global validation pipe/middleware is actually wired into the test app, not just `main.ts`'s bootstrap).
- **Not-found** — 404 for lookups by id/slug that don't exist.
- **Business-rule error** — the domain's own rule violations (e.g. duplicate slug/code on create, invalid state transition). If a route's current error handling is inconsistent (e.g. returns an exception object with 200 instead of throwing), test and document the actual behavior — don't silently assert the intended behavior — and flag it as a bug separately.

## Data

- Don't hardcode fixture data that could collide across runs or across spec files sharing one container — prefix/suffix with something distinctive (`e2e-test-${Date.now()}`).
- Each spec cleans up what it creates in `afterAll`/`afterEach` — delete-by-prefix scoped to the models it touched. A shared `test/utils/db-cleanup.ts` helper is the convention for this, called from each spec's `afterAll`.
- Tests within and across spec files are independent — no spec relies on state left behind by another.

## Structure

Mirrors the existing `test/app.e2e-spec.ts` pattern: build the app from the real root module in `beforeAll`, issue requests via `request(app.getHttpServer())`, close the app in `afterAll`.

```ts
describe("ProductsController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DATABASE_URL = readFileSync(__dirname + "/.e2e-db-url", "utf-8").trim();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await cleanupByPrefix("e2e-test-");
    await app.close();
  });

  it("creates a product", () => {
    return request(app.getHttpServer())
      .post("/products")
      .send(validCreateProductDto)
      .expect(201);
  });

  it("rejects a product missing required fields", () => {
    return request(app.getHttpServer()).post("/products").send({}).expect(400);
  });
});
```

## Coverage

Follow the same >80% floor as [TESTING_UNIT.md](TESTING_UNIT.md), measured on the routes/DTOs the integration layer actually exercises — it's a floor, not a goal; give extra attention to error paths on domains with real business rules.

## See also

- [TESTING_UNIT.md](TESTING_UNIT.md) — service-layer unit tests (DB mocked)
- [TESTING_E2E.md](TESTING_E2E.md) — Playwright journeys across the frontend
- [CHECKLISTS.md](CHECKLISTS.md) — the pre-PR gate this feeds into

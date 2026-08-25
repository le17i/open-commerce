import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Starts one Postgres container for the whole `test:e2e` run, migrates it,
 * and persists the resulting connection string for spec files to read.
 *
 * Jest's `globalSetup` runs once in its own process, separate from the
 * worker processes that run the actual spec files, so state can't be shared
 * in memory — the connection string is written to a file next to this one
 * instead. The container itself is stashed on `globalThis` so
 * `jest-e2e-global-teardown.ts` (which runs in the same process as this
 * script) can stop it.
 */
export default async function globalSetup() {
  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("opencommerce_catalog_test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const databaseUrl = container.getConnectionUri();

  execSync("node_modules/.bin/prisma migrate deploy", {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });

  writeFileSync(path.join(__dirname, ".e2e-db-url"), databaseUrl);

  (
    globalThis as unknown as { __PG_CONTAINER__: typeof container }
  ).__PG_CONTAINER__ = container;
}

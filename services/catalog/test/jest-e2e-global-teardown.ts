import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { rmSync } from "node:fs";
import path from "node:path";

/** Stops the Postgres container started in `jest-e2e-global-setup.ts`. */
export default async function globalTeardown() {
  const container = (
    globalThis as unknown as { __PG_CONTAINER__?: StartedPostgreSqlContainer }
  ).__PG_CONTAINER__;

  if (container) {
    await container.stop();
  }

  rmSync(path.join(__dirname, ".e2e-db-url"), { force: true });
}

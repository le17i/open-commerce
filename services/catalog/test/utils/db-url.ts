import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Reads the connection string for the testcontainers-provisioned Postgres
 * written by `jest-e2e-global-setup.ts`, and sets it as `DATABASE_URL` so
 * `DatabaseService` (which reads `process.env.DATABASE_URL` at construction
 * time) connects to the ephemeral container instead of any locally
 * configured database.
 *
 * Call this before compiling a `TestingModule` in every e2e spec's
 * `beforeAll`.
 */
export function loadTestDatabaseUrl(): void {
  const dbUrl = readFileSync(
    path.join(__dirname, "..", ".e2e-db-url"),
    "utf-8",
  ).trim();

  process.env.DATABASE_URL = dbUrl;
}

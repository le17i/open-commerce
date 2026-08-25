import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { loadTestDatabaseUrl } from "./db-url";

/**
 * Builds a fully-bootstrapped `INestApplication` against the real
 * `AppModule`, pointed at the testcontainers-provisioned Postgres.
 *
 * `main.ts`'s `ValidationPipe` is applied manually here because a
 * `TestingModule`-built app does not go through `main.ts`'s bootstrap —
 * without this, DTO validation errors would silently pass through instead
 * of producing 400s.
 */
export async function buildTestApp(): Promise<INestApplication> {
  loadTestDatabaseUrl();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  return app;
}

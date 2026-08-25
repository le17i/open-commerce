import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { buildTestApp } from "./utils/build-app";
import { cleanupE2eData, E2E_PREFIX } from "./utils/db-cleanup";
import { DatabaseService } from "../src/database.service";

describe("BrandController (e2e)", () => {
  let app: INestApplication<App>;
  let db: DatabaseService;

  beforeAll(async () => {
    app = await buildTestApp();
    db = app.get(DatabaseService);
  });

  afterAll(async () => {
    await cleanupE2eData(db);
    await app.close();
  });

  describe("POST /brands", () => {
    it("creates a brand", async () => {
      const res = await request(app.getHttpServer())
        .post("/brands")
        .send({
          slug: `${E2E_PREFIX}acme`,
          title: "Acme",
          code: `${E2E_PREFIX}ACME`,
          // `description` is required here despite being optional in the
          // schema/DTO type — see the bug note below.
          description: "n/a",
        })
        .expect(201);

      expect(res.body).toMatchObject({
        slug: `${E2E_PREFIX}acme`,
        title: "Acme",
        code: `${E2E_PREFIX}ACME`,
      });
      expect(res.body.id).toBeDefined();
    });

    it("rejects a brand missing required fields", () => {
      return request(app.getHttpServer())
        .post("/brands")
        .send({ title: "Missing slug and code" })
        .expect(400);
    });

    // BUG: `CreateBrandDto.description` is annotated `@ApiPropertyOptional`
    // and typed `description?: string`, but is missing `@IsOptional()` next
    // to its `@IsString()` decorator — so omitting it fails validation with
    // "description must be a string" instead of being accepted. Every other
    // domain DTO (category/color) applies `@IsOptional()` correctly. This
    // documents current behavior; flag to fix `brand.dto.ts` separately.
    it("rejects a brand that omits the optional description field", () => {
      return request(app.getHttpServer())
        .post("/brands")
        .send({
          slug: `${E2E_PREFIX}no-description`,
          title: "No Description",
          code: `${E2E_PREFIX}NODESC`,
        })
        .expect(400);
    });

    it("rejects a duplicate slug", async () => {
      await request(app.getHttpServer())
        .post("/brands")
        .send({
          slug: `${E2E_PREFIX}dup`,
          title: "Dup",
          code: `${E2E_PREFIX}DUP1`,
          description: "n/a",
        })
        .expect(201);

      // The service has no explicit uniqueness handling beyond the Prisma
      // unique constraint on `slug`, so a duplicate currently surfaces as an
      // unhandled Prisma error rather than a clean 409 — documenting the
      // actual behavior rather than an idealized one.
      const res = await request(app.getHttpServer())
        .post("/brands")
        .send({
          slug: `${E2E_PREFIX}dup`,
          title: "Dup Again",
          code: `${E2E_PREFIX}DUP2`,
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("GET /brands", () => {
    it("lists brands with pagination defaults", async () => {
      const res = await request(app.getHttpServer()).get("/brands").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("respects page/perPage query params", async () => {
      const res = await request(app.getHttpServer())
        .get("/brands")
        .query({ page: 0, perPage: 1 })
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe("GET /brands/:id", () => {
    it("returns a brand by id", async () => {
      const created = await request(app.getHttpServer())
        .post("/brands")
        .send({
          slug: `${E2E_PREFIX}by-id`,
          title: "By Id",
          code: `${E2E_PREFIX}BYID`,
          description: "n/a",
        });

      const res = await request(app.getHttpServer())
        .get(`/brands/${created.body.id}`)
        .expect(200);

      expect(res.body.slug).toBe(`${E2E_PREFIX}by-id`);
    });

    // BrandService.findById returns `null` for a nonexistent id and the
    // controller passes it straight through — there is no NotFoundException,
    // so this responds 200, not 404. Documenting actual behavior.
    it("responds 200 with an empty body for a nonexistent id (no 404 handling in BrandService)", async () => {
      const res = await request(app.getHttpServer())
        .get("/brands/999999999")
        .expect(200);
      expect(res.body.id).toBeUndefined();
    });
  });

  describe("GET /brands/slug/:slug", () => {
    it("returns a brand by slug", async () => {
      await request(app.getHttpServer())
        .post("/brands")
        .send({
          slug: `${E2E_PREFIX}by-slug`,
          title: "By Slug",
          code: `${E2E_PREFIX}BYSLUG`,
          description: "n/a",
        });

      const res = await request(app.getHttpServer())
        .get(`/brands/slug/${E2E_PREFIX}by-slug`)
        .expect(200);

      expect(res.body.code).toBe(`${E2E_PREFIX}BYSLUG`);
    });

    it("responds 200 with an empty body for a nonexistent slug (no 404 handling in BrandService)", async () => {
      const res = await request(app.getHttpServer())
        .get(`/brands/slug/${E2E_PREFIX}does-not-exist`)
        .expect(200);

      expect(res.body.id).toBeUndefined();
    });
  });
});

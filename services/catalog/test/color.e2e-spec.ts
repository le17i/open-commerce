import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { buildTestApp } from "./utils/build-app";
import { cleanupE2eData, E2E_PREFIX } from "./utils/db-cleanup";
import { DatabaseService } from "../src/database.service";

describe("ColorController (e2e)", () => {
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

  describe("POST /colors", () => {
    it("creates a color", async () => {
      const res = await request(app.getHttpServer())
        .post("/colors")
        .send({
          slug: `${E2E_PREFIX}midnight-blue`,
          title: "Midnight Blue",
          code: `${E2E_PREFIX}MBL`,
          colorHex: "#191970",
        })
        .expect(201);

      expect(res.body).toMatchObject({
        slug: `${E2E_PREFIX}midnight-blue`,
        colorHex: "#191970",
      });
      expect(res.body.id).toBeDefined();
    });

    it("rejects a color missing required fields", () => {
      return request(app.getHttpServer())
        .post("/colors")
        .send({ title: "Missing slug/code/colorHex" })
        .expect(400);
    });

    it("rejects a duplicate slug", async () => {
      await request(app.getHttpServer())
        .post("/colors")
        .send({
          slug: `${E2E_PREFIX}dup-color`,
          title: "Dup",
          code: `${E2E_PREFIX}DUPC1`,
          colorHex: "#000000",
        })
        .expect(201);

      // No explicit uniqueness handling beyond the Prisma unique constraint
      // on `slug` — documenting the actual (currently unhandled) behavior.
      const res = await request(app.getHttpServer())
        .post("/colors")
        .send({
          slug: `${E2E_PREFIX}dup-color`,
          title: "Dup Again",
          code: `${E2E_PREFIX}DUPC2`,
          colorHex: "#ffffff",
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("GET /colors", () => {
    it("lists colors with pagination defaults", async () => {
      const res = await request(app.getHttpServer()).get("/colors").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("respects page/perPage query params", async () => {
      const res = await request(app.getHttpServer())
        .get("/colors")
        .query({ page: 0, perPage: 1 })
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe("GET /colors/:id", () => {
    it("returns a color by id", async () => {
      const created = await request(app.getHttpServer())
        .post("/colors")
        .send({
          slug: `${E2E_PREFIX}by-id-color`,
          title: "By Id",
          code: `${E2E_PREFIX}BYIDC`,
          colorHex: "#123456",
        });

      const res = await request(app.getHttpServer())
        .get(`/colors/${created.body.id}`)
        .expect(200);

      expect(res.body.slug).toBe(`${E2E_PREFIX}by-id-color`);
    });

    // ColorService.findById returns `null` for a nonexistent id, and the
    // controller passes it straight through with no 404 handling.
    it("responds 200 with an empty body for a nonexistent id", async () => {
      const res = await request(app.getHttpServer())
        .get("/colors/999999999")
        .expect(200);
      expect(res.body.id).toBeUndefined();
    });
  });

  describe("GET /colors/slug/:slug", () => {
    it("returns a color by slug", async () => {
      await request(app.getHttpServer())
        .post("/colors")
        .send({
          slug: `${E2E_PREFIX}by-slug-color`,
          title: "By Slug",
          code: `${E2E_PREFIX}BYSLUGC`,
          colorHex: "#654321",
        });

      const res = await request(app.getHttpServer())
        .get(`/colors/slug/${E2E_PREFIX}by-slug-color`)
        .expect(200);

      expect(res.body.code).toBe(`${E2E_PREFIX}BYSLUGC`);
    });

    it("responds 200 with an empty body for a nonexistent slug", async () => {
      const res = await request(app.getHttpServer())
        .get(`/colors/slug/${E2E_PREFIX}does-not-exist`)
        .expect(200);

      expect(res.body.id).toBeUndefined();
    });
  });
});

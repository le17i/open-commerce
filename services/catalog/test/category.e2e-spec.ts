import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { buildTestApp } from "./utils/build-app";
import { cleanupE2eData, E2E_PREFIX } from "./utils/db-cleanup";
import { DatabaseService } from "../src/database.service";

describe("CategoryController (e2e)", () => {
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

  describe("POST /categories", () => {
    it("creates a category", async () => {
      const res = await request(app.getHttpServer())
        .post("/categories")
        .send({
          slug: `${E2E_PREFIX}electronics`,
          title: "Electronics",
          code: `${E2E_PREFIX}ELEC`,
        })
        .expect(201);

      expect(res.body).toMatchObject({
        slug: `${E2E_PREFIX}electronics`,
        code: `${E2E_PREFIX}ELEC`,
      });
      expect(res.body.id).toBeDefined();
    });

    it("creates a subcategory with a parentId", async () => {
      const parent = await request(app.getHttpServer())
        .post("/categories")
        .send({
          slug: `${E2E_PREFIX}parent-cat`,
          title: "Parent",
          code: `${E2E_PREFIX}PARENT`,
        });

      const res = await request(app.getHttpServer())
        .post("/categories")
        .send({
          slug: `${E2E_PREFIX}child-cat`,
          title: "Child",
          code: `${E2E_PREFIX}CHILD`,
          parentId: parent.body.id,
        })
        .expect(201);

      expect(res.body.parentId).toBe(parent.body.id);
    });

    it("rejects a category missing required fields", () => {
      return request(app.getHttpServer())
        .post("/categories")
        .send({ title: "Missing slug and code" })
        .expect(400);
    });

    it("rejects a category with a non-numeric parentId", () => {
      return request(app.getHttpServer())
        .post("/categories")
        .send({
          slug: `${E2E_PREFIX}bad-parent`,
          title: "Bad Parent",
          code: `${E2E_PREFIX}BADPARENT`,
          parentId: "not-a-number",
        })
        .expect(400);
    });

    it("surfaces an error for a nonexistent parentId (FK violation, not a clean 4xx)", async () => {
      // CategoryService.create passes parentId straight to Prisma with no
      // existence check — an unresolvable FK currently throws an unhandled
      // Prisma error. Documenting actual behavior.
      const res = await request(app.getHttpServer())
        .post("/categories")
        .send({
          slug: `${E2E_PREFIX}orphan-cat`,
          title: "Orphan",
          code: `${E2E_PREFIX}ORPHAN`,
          parentId: 999999999,
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("rejects a duplicate slug", async () => {
      await request(app.getHttpServer())
        .post("/categories")
        .send({
          slug: `${E2E_PREFIX}dup-cat`,
          title: "Dup",
          code: `${E2E_PREFIX}DUPCAT1`,
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post("/categories")
        .send({
          slug: `${E2E_PREFIX}dup-cat`,
          title: "Dup Again",
          code: `${E2E_PREFIX}DUPCAT2`,
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("GET /categories/getCategoriesList", () => {
    it("lists categories with pagination defaults", async () => {
      const res = await request(app.getHttpServer())
        .get("/categories/getCategoriesList")
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it("respects page/perPage query params", async () => {
      const res = await request(app.getHttpServer())
        .get("/categories/getCategoriesList")
        .query({ page: 0, perPage: 1 })
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe("GET /categories/:id", () => {
    it("returns a category by id", async () => {
      const created = await request(app.getHttpServer())
        .post("/categories")
        .send({
          slug: `${E2E_PREFIX}by-id-cat`,
          title: "By Id",
          code: `${E2E_PREFIX}BYIDCAT`,
        });

      const res = await request(app.getHttpServer())
        .get(`/categories/${created.body.id}`)
        .expect(200);

      expect(res.body.slug).toBe(`${E2E_PREFIX}by-id-cat`);
    });

    // CategoryService.findById returns `null` for a nonexistent id, and the
    // controller passes it straight through with no 404 handling.
    it("responds 200 with an empty body for a nonexistent id", async () => {
      const res = await request(app.getHttpServer())
        .get("/categories/999999999")
        .expect(200);
      expect(res.body.id).toBeUndefined();
    });
  });

  describe("GET /categories/slug/:slug", () => {
    it("returns a category by slug", async () => {
      await request(app.getHttpServer())
        .post("/categories")
        .send({
          slug: `${E2E_PREFIX}by-slug-cat`,
          title: "By Slug",
          code: `${E2E_PREFIX}BYSLUGCAT`,
        });

      const res = await request(app.getHttpServer())
        .get(`/categories/slug/${E2E_PREFIX}by-slug-cat`)
        .expect(200);

      expect(res.body.code).toBe(`${E2E_PREFIX}BYSLUGCAT`);
    });

    it("responds 200 with an empty body for a nonexistent slug", async () => {
      const res = await request(app.getHttpServer())
        .get(`/categories/slug/${E2E_PREFIX}does-not-exist`)
        .expect(200);

      expect(res.body.id).toBeUndefined();
    });
  });
});

import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { buildTestApp } from "./utils/build-app";
import { cleanupE2eData, E2E_PREFIX } from "./utils/db-cleanup";
import { DatabaseService } from "../src/database.service";

describe("KindController (e2e)", () => {
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

  describe("POST /kinds", () => {
    it("creates a kind", async () => {
      const res = await request(app.getHttpServer())
        .post("/kinds")
        .send({ label: "Electronics", code: `${E2E_PREFIX}electronics` })
        .expect(201);

      expect(res.body).toMatchObject({
        label: "Electronics",
        code: `${E2E_PREFIX}electronics`,
      });
      expect(res.body.id).toBeDefined();
    });

    it("rejects a kind missing required fields", () => {
      return request(app.getHttpServer()).post("/kinds").send({}).expect(400);
    });

    it("rejects a duplicate code", async () => {
      await request(app.getHttpServer())
        .post("/kinds")
        .send({ label: "Dup Kind", code: `${E2E_PREFIX}dup-kind` })
        .expect(201);

      // No explicit uniqueness handling beyond the Prisma unique constraint
      // on `code`/`label` — documenting the actual (currently unhandled)
      // behavior rather than assuming a clean 409.
      const res = await request(app.getHttpServer())
        .post("/kinds")
        .send({ label: "Dup Kind Again", code: `${E2E_PREFIX}dup-kind` });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("GET /kinds", () => {
    it("lists kinds with pagination defaults", async () => {
      const res = await request(app.getHttpServer()).get("/kinds").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("respects page/perPage query params", async () => {
      const res = await request(app.getHttpServer())
        .get("/kinds")
        .query({ page: 0, perPage: 1 })
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe("GET /kinds/:id", () => {
    it("returns a kind by id", async () => {
      const created = await request(app.getHttpServer())
        .post("/kinds")
        .send({ label: "By Id", code: `${E2E_PREFIX}by-id-kind` });

      const res = await request(app.getHttpServer())
        .get(`/kinds/${created.body.id}`)
        .expect(200);

      expect(res.body.code).toBe(`${E2E_PREFIX}by-id-kind`);
    });

    // KindService.findById returns `null` for a nonexistent id, and the
    // controller passes it straight through with no 404 handling.
    it("responds 200 with an empty body for a nonexistent id", async () => {
      const res = await request(app.getHttpServer())
        .get("/kinds/999999999")
        .expect(200);
      expect(res.body.id).toBeUndefined();
    });
  });
});

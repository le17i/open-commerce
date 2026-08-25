import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { buildTestApp } from "./utils/build-app";
import { cleanupE2eData, E2E_PREFIX } from "./utils/db-cleanup";
import { DatabaseService } from "../src/database.service";

describe("ProductsController (e2e)", () => {
  let app: INestApplication<App>;
  let db: DatabaseService;

  // Shared fixtures every product references.
  let brandId: number;
  let categoryId: number;
  let colorId: number;
  let kindId: number;

  beforeAll(async () => {
    app = await buildTestApp();
    db = app.get(DatabaseService);

    const server = app.getHttpServer();

    const brand = await request(server)
      .post("/brands")
      .send({
        slug: `${E2E_PREFIX}product-brand`,
        title: "Product Brand",
        code: `${E2E_PREFIX}PRODBRAND`,
        description: "n/a",
      });
    brandId = brand.body.id;

    const category = await request(server)
      .post("/categories")
      .send({
        slug: `${E2E_PREFIX}product-category`,
        title: "Product Category",
        code: `${E2E_PREFIX}PRODCAT`,
      });
    categoryId = category.body.id;

    const color = await request(server)
      .post("/colors")
      .send({
        slug: `${E2E_PREFIX}product-color`,
        title: "Product Color",
        code: `${E2E_PREFIX}PRODCOLOR`,
        colorHex: "#abcdef",
      });
    colorId = color.body.id;

    const kind = await request(server)
      .post("/kinds")
      .send({ label: "Product Kind", code: `${E2E_PREFIX}product-kind` });
    kindId = kind.body.id;
  });

  afterAll(async () => {
    await cleanupE2eData(db);
    await app.close();
  });

  const baseProductBody = () => ({
    title: "Classic T-Shirt",
    slug: `${E2E_PREFIX}classic-t-shirt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    barcode: `${E2E_PREFIX}${Date.now()}${Math.floor(Math.random() * 10000)}`,
    sku: "TSH-CLS-BLK-M",
    model: "CLS-2024",
    brandId,
    categoryId,
    colorId,
    kindId,
  });

  describe("POST /products", () => {
    it("creates a product with title/slug stored correctly", async () => {
      const body = baseProductBody();

      const res = await request(app.getHttpServer())
        .post("/products")
        .send(body)
        .expect(201);

      expect(res.body.title).toBe(body.title);
      expect(res.body.slug).toBe(body.slug);
      expect(res.body.status).toBe("DRAFT");
      expect(res.body.offers).toHaveLength(1);
    });

    it("creates a product variant via parentId", async () => {
      const parentBody = baseProductBody();
      const parent = await request(app.getHttpServer())
        .post("/products")
        .send(parentBody)
        .expect(201);

      const variantBody = { ...baseProductBody(), parentId: parent.body.id };
      const variant = await request(app.getHttpServer())
        .post("/products")
        .send(variantBody)
        .expect(201);

      expect(variant.body.parentId).toBe(parent.body.id);
    });

    it("rejects a product missing required fields", () => {
      return request(app.getHttpServer())
        .post("/products")
        .send({ title: "Missing everything else" })
        .expect(400);
    });

    it("rejects a duplicate slug", async () => {
      const body = baseProductBody();
      await request(app.getHttpServer())
        .post("/products")
        .send(body)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post("/products")
        .send({ ...body, barcode: `${body.barcode}-2` });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    // ProductsService.create passes brandId/categoryId/colorId/kindId
    // straight to Prisma with no existence check first — an unresolvable FK
    // currently throws an unhandled Prisma error rather than a clean 400.
    it("surfaces an error for a nonexistent brandId (FK violation, not a clean 4xx)", async () => {
      const res = await request(app.getHttpServer())
        .post("/products")
        .send({ ...baseProductBody(), brandId: 999999999 });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("GET /products", () => {
    it("lists PUBLISHED products by default", async () => {
      const res = await request(app.getHttpServer())
        .get("/products")
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.every((p: { status: string }) => p.status === "PUBLISHED"),
      ).toBe(true);
    });

    it("lists DRAFT products when status=DRAFT is passed", async () => {
      const body = baseProductBody();
      await request(app.getHttpServer())
        .post("/products")
        .send(body)
        .expect(201);

      const res = await request(app.getHttpServer())
        .get("/products")
        .query({ status: "DRAFT" })
        .expect(200);

      expect(res.body.some((p: { slug: string }) => p.slug === body.slug)).toBe(
        true,
      );
    });

    // `status` is a raw `@Query("status")` param with no enum-validating
    // pipe/DTO in front of it, so an invalid value isn't caught by the
    // global ValidationPipe — it reaches Prisma as-is and throws an
    // unhandled validation error, surfacing as 500 instead of 400.
    // Documenting the actual behavior; worth adding a ParseEnumPipe.
    it("responds 500 for an invalid status value (no enum validation on the query param)", () => {
      return request(app.getHttpServer())
        .get("/products")
        .query({ status: "NOT_A_STATUS" })
        .expect(500);
    });
  });

  describe("GET /products/:id and /products/slug/:slug", () => {
    it("returns a product by id", async () => {
      const body = baseProductBody();
      const created = await request(app.getHttpServer())
        .post("/products")
        .send(body);

      const res = await request(app.getHttpServer())
        .get(`/products/${created.body.id}`)
        .expect(200);

      expect(res.body.slug).toBe(body.slug);
    });

    it("returns a product by slug", async () => {
      const body = baseProductBody();
      await request(app.getHttpServer()).post("/products").send(body);

      const res = await request(app.getHttpServer())
        .get(`/products/slug/${body.slug}`)
        .expect(200);

      expect(res.body.title).toBe(body.title);
    });

    // ProductsService.findOne returns `null` for a nonexistent id/slug, and
    // the controller passes it straight through with no 404 handling.
    it("responds 200 with an empty body for a nonexistent id", async () => {
      const res = await request(app.getHttpServer())
        .get("/products/999999999")
        .expect(200);
      expect(res.body.id).toBeUndefined();
    });

    it("responds 200 with an empty body for a nonexistent slug", async () => {
      const res = await request(app.getHttpServer())
        .get(`/products/slug/${E2E_PREFIX}does-not-exist`)
        .expect(200);

      expect(res.body.id).toBeUndefined();
    });
  });

  describe("PATCH /products/:id", () => {
    it("updates a product's status", async () => {
      const body = baseProductBody();
      const created = await request(app.getHttpServer())
        .post("/products")
        .send(body);

      const res = await request(app.getHttpServer())
        .patch(`/products/${created.body.id}`)
        .send({
          id: created.body.id,
          status: "PUBLISHED",
          title: body.title,
          model: body.model,
          brandId,
          colorId,
          kindId,
          stock: 10,
        })
        .expect(200);

      expect(res.body.status).toBe("PUBLISHED");
      expect(res.body.stock).toBe(10);
    });

    it("rejects an update missing required body fields", async () => {
      const body = baseProductBody();
      const created = await request(app.getHttpServer())
        .post("/products")
        .send(body);

      return request(app.getHttpServer())
        .patch(`/products/${created.body.id}`)
        .send({ status: "PUBLISHED" })
        .expect(400);
    });
  });
});

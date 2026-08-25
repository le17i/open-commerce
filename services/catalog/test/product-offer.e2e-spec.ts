import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { buildTestApp } from "./utils/build-app";
import { cleanupE2eData, E2E_PREFIX } from "./utils/db-cleanup";
import { DatabaseService } from "../src/database.service";

describe("ProductOffersController (e2e)", () => {
  let app: INestApplication<App>;
  let db: DatabaseService;
  let productId: number;

  beforeAll(async () => {
    app = await buildTestApp();
    db = app.get(DatabaseService);

    const server = app.getHttpServer();

    const brand = await request(server)
      .post("/brands")
      .send({
        slug: `${E2E_PREFIX}offer-brand`,
        title: "Offer Brand",
        code: `${E2E_PREFIX}OFFERBRAND`,
        description: "n/a",
      });
    const category = await request(server)
      .post("/categories")
      .send({
        slug: `${E2E_PREFIX}offer-category`,
        title: "Offer Category",
        code: `${E2E_PREFIX}OFFERCAT`,
      });
    const color = await request(server)
      .post("/colors")
      .send({
        slug: `${E2E_PREFIX}offer-color`,
        title: "Offer Color",
        code: `${E2E_PREFIX}OFFERCOLOR`,
        colorHex: "#111111",
      });
    const kind = await request(server)
      .post("/kinds")
      .send({ label: "Offer Kind", code: `${E2E_PREFIX}offer-kind` });

    const product = await request(server)
      .post("/products")
      .send({
        title: "Offer Product",
        slug: `${E2E_PREFIX}offer-product`,
        barcode: `${E2E_PREFIX}offerbarcode`,
        sku: "OFFER-SKU",
        model: "OFFER-MODEL",
        brandId: brand.body.id,
        categoryId: category.body.id,
        colorId: color.body.id,
        kindId: kind.body.id,
      });
    productId = product.body.id;
  });

  afterAll(async () => {
    await cleanupE2eData(db);
    await app.close();
  });

  describe("POST /products/:productId/offers", () => {
    it("creates a new offer for a product", async () => {
      const res = await request(app.getHttpServer())
        .post(`/products/${productId}/offers`)
        .send({ price: 1999, promotionalPrice: 1499, isActive: true })
        .expect(201);

      expect(res.body.offers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ price: 1999, isActive: true }),
        ]),
      );
    });

    it("rejects an offer with an invalid body", () => {
      return request(app.getHttpServer())
        .post(`/products/${productId}/offers`)
        .send({ price: "not-a-number" })
        .expect(400);
    });

    // The controller now throws instead of returning the
    // BadRequestException, so this correctly responds 400. The body is
    // still `{}` though: the controller passes the raw ProductNotFoundError
    // instance into `new BadRequestException(error)`, and Error's `message`
    // property isn't enumerable, so it doesn't survive JSON serialization.
    it("responds 400 for a nonexistent productId", async () => {
      const res = await request(app.getHttpServer())
        .post("/products/999999999/offers")
        .send({ price: 1999, promotionalPrice: 1499, isActive: true })
        .expect(400);

      expect(res.body).toEqual({});
    });
  });

  describe("PUT /products/:productId/offers/id", () => {
    // The route is declared as `@Put("id")` under a controller prefixed
    // `products/:productId/offers`, so the *literal* path segment is "id",
    // not a `:id` route param — `@Param("id")` inside the handler is always
    // undefined, and any other literal offer id in the URL (e.g. .../offers/42)
    // simply won't match this route at all. Documenting actual behavior;
    // the route should be declared as `@Put(":id")`.
    it("404s for a URL using a real offer id, since the route only matches the literal segment 'id'", async () => {
      return request(app.getHttpServer())
        .put(`/products/${productId}/offers/1`)
        .send({ price: 1, promotionalPrice: 1, isActive: true })
        .expect(404);
    });

    it("matches the literal '/offers/id' path but fails internally since offerId is always undefined", async () => {
      const res = await request(app.getHttpServer())
        .put(`/products/${productId}/offers/id`)
        .send({ price: 1, promotionalPrice: 1, isActive: true });

      // The controller now throws instead of returning, so this correctly
      // responds 400 (the route-param bug above is unchanged).
      expect(res.status).toBe(400);
    });
  });
});

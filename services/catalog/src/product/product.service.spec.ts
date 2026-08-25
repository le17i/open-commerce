import { ProductsService } from "./product.service";
import { DatabaseService } from "../database.service";
import { Prisma, ProductStatusEnum } from "../database/prisma/client";
import {
  BrandNotFoundError,
  CategoryNotFoundError,
  ColorNotFoundError,
  KindNotFoundError,
  ParentProductNotFoundError,
  ProductConflictError,
} from "./product.errors";

describe("ProductsService", () => {
  let db: {
    brand: { findUnique: jest.Mock };
    category: { findUnique: jest.Mock };
    color: { findUnique: jest.Mock };
    kind: { findUnique: jest.Mock };
    product: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    image: { create: jest.Mock };
  };
  let service: ProductsService;

  const relatedInclude = {
    brand: true,
    category: true,
    color: true,
    kind: true,
    images: true,
    offers: true,
    tags: true,
    variants: true,
  };

  beforeEach(() => {
    db = {
      brand: { findUnique: jest.fn() },
      category: { findUnique: jest.fn() },
      color: { findUnique: jest.fn() },
      kind: { findUnique: jest.fn() },
      product: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      image: { create: jest.fn() },
    };
    service = new ProductsService(db as unknown as DatabaseService);
  });

  function mockRelatedEntitiesFound() {
    db.brand.findUnique.mockResolvedValue({ id: 1 });
    db.category.findUnique.mockResolvedValue({ id: 2 });
    db.color.findUnique.mockResolvedValue({ id: 3 });
    db.kind.findUnique.mockResolvedValue({ id: 4 });
  }

  describe("create", () => {
    it("creates a product with an initial offer when all related entities exist", async () => {
      mockRelatedEntitiesFound();
      const created = { id: 10, title: "Widget" };
      db.product.create.mockResolvedValue(created);

      const result = await service.create(
        "Widget",
        "widget",
        "SKU-1",
        "BARCODE-1",
        "MODEL-1",
        1,
        2,
        3,
        4,
        "content",
        "description",
        10,
        20,
        null,
        99,
        5,
        1,
        2,
        ProductStatusEnum.PUBLISHED,
      );

      expect(db.product.create).toHaveBeenCalledWith({
        data: {
          barcode: "BARCODE-1",
          brandId: 1,
          categoryId: 2,
          colorId: 3,
          kindId: 4,
          content: "content",
          description: "description",
          height: 10,
          length: 20,
          model: "MODEL-1",
          parentId: null,
          slug: "widget",
          status: ProductStatusEnum.PUBLISHED,
          stock: 5,
          sku: "SKU-1",
          title: "Widget",
          weight: 1,
          width: 2,
          offers: {
            create: { price: 99, isActive: true },
          },
        },
        include: relatedInclude,
      });
      expect(result).toBe(created);
    });

    it("throws BrandNotFoundError when the brand does not exist", async () => {
      mockRelatedEntitiesFound();
      db.brand.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          "Widget",
          "widget",
          "SKU-1",
          "BARCODE-1",
          "MODEL-1",
          1,
          2,
          3,
          4,
        ),
      ).rejects.toBeInstanceOf(BrandNotFoundError);
    });

    it("throws CategoryNotFoundError when the category does not exist", async () => {
      mockRelatedEntitiesFound();
      db.category.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          "Widget",
          "widget",
          "SKU-1",
          "BARCODE-1",
          "MODEL-1",
          1,
          2,
          3,
          4,
        ),
      ).rejects.toBeInstanceOf(CategoryNotFoundError);
    });

    it("throws ColorNotFoundError when the color does not exist", async () => {
      mockRelatedEntitiesFound();
      db.color.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          "Widget",
          "widget",
          "SKU-1",
          "BARCODE-1",
          "MODEL-1",
          1,
          2,
          3,
          4,
        ),
      ).rejects.toBeInstanceOf(ColorNotFoundError);
    });

    it("throws KindNotFoundError when the kind does not exist", async () => {
      mockRelatedEntitiesFound();
      db.kind.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          "Widget",
          "widget",
          "SKU-1",
          "BARCODE-1",
          "MODEL-1",
          1,
          2,
          3,
          4,
        ),
      ).rejects.toBeInstanceOf(KindNotFoundError);
    });

    it("throws ParentProductNotFoundError when the parent product does not exist", async () => {
      mockRelatedEntitiesFound();
      db.product.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          "Widget",
          "widget",
          "SKU-1",
          "BARCODE-1",
          "MODEL-1",
          1,
          2,
          3,
          4,
          null,
          null,
          0,
          0,
          99,
        ),
      ).rejects.toBeInstanceOf(ParentProductNotFoundError);
    });

    it("maps a unique constraint violation to ProductConflictError", async () => {
      mockRelatedEntitiesFound();
      const prismaError = new Prisma.PrismaClientKnownRequestError("conflict", {
        code: "P2002",
        clientVersion: "test",
      });
      db.product.create.mockRejectedValue(prismaError);

      await expect(
        service.create(
          "Widget",
          "widget",
          "SKU-1",
          "BARCODE-1",
          "MODEL-1",
          1,
          2,
          3,
          4,
        ),
      ).rejects.toBeInstanceOf(ProductConflictError);
    });

    it("rethrows unrelated errors from product creation", async () => {
      mockRelatedEntitiesFound();
      const unrelatedError = new Error("boom");
      db.product.create.mockRejectedValue(unrelatedError);

      await expect(
        service.create(
          "Widget",
          "widget",
          "SKU-1",
          "BARCODE-1",
          "MODEL-1",
          1,
          2,
          3,
          4,
        ),
      ).rejects.toBe(unrelatedError);
    });
  });

  describe("find", () => {
    it("applies default pagination and includes related entities", async () => {
      const products = [{ id: 1 }];
      db.product.findMany.mockResolvedValue(products);

      const result = await service.find({});

      expect(db.product.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        include: relatedInclude,
      });
      expect(result).toBe(products);
    });

    it("applies custom pagination", async () => {
      db.product.findMany.mockResolvedValue([]);

      await service.find({ title: "Widget" }, 10, 5);

      expect(db.product.findMany).toHaveBeenCalledWith({
        where: { title: "Widget" },
        skip: 10,
        take: 5,
        include: relatedInclude,
      });
    });
  });

  describe("findById", () => {
    it("returns the matching product with related entities", async () => {
      const product = { id: 1 };
      db.product.findUnique.mockResolvedValue(product);

      const result = await service.findById(1);

      expect(db.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: relatedInclude,
      });
      expect(result).toBe(product);
    });

    it("returns null when the product does not exist", async () => {
      db.product.findUnique.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe("findOne", () => {
    it("returns the first matching product with related entities", async () => {
      const product = { id: 1 };
      db.product.findFirst.mockResolvedValue(product);

      const result = await service.findOne({ title: "Widget" });

      expect(db.product.findFirst).toHaveBeenCalledWith({
        where: { title: "Widget" },
        include: relatedInclude,
      });
      expect(result).toBe(product);
    });

    it("returns null when no product matches", async () => {
      db.product.findFirst.mockResolvedValue(null);

      const result = await service.findOne({ title: "nope" });

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("returns null when the product to update does not exist", async () => {
      db.product.findUnique.mockResolvedValue(null);

      const result = await service.update({ id: 1 }, {} as never);

      expect(result).toBeNull();
      expect(db.product.update).not.toHaveBeenCalled();
    });

    it("updates the product when it exists", async () => {
      db.product.findUnique.mockResolvedValue({ id: 1 });
      const updated = { id: 1, title: "Updated Widget" };
      db.product.update.mockResolvedValue(updated);

      const result = await service.update({ id: 1 }, {
        title: "Updated Widget",
      } as never);

      expect(db.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: "Updated Widget" },
        include: relatedInclude,
      });
      expect(result).toBe(updated);
    });
  });

  describe("addImage", () => {
    it("creates an image with the provided data", async () => {
      const image = { id: 1 };
      db.image.create.mockResolvedValue(image);

      const result = await service.addImage(1, "png", "file.png", "desc");

      expect(db.image.create).toHaveBeenCalledWith({
        data: {
          productId: 1,
          ext: "png",
          filename: "file.png",
          description: "desc",
        },
      });
      expect(result).toBe(image);
    });

    it("defaults description to null", async () => {
      db.image.create.mockResolvedValue({});

      await service.addImage(1, "png", "file.png");

      expect(db.image.create).toHaveBeenCalledWith({
        data: {
          productId: 1,
          ext: "png",
          filename: "file.png",
          description: null,
        },
      });
    });
  });
});

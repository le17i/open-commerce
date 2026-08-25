import { BrandService } from "./brand.service";
import { DatabaseService } from "../database.service";

describe("BrandService", () => {
  let db: {
    brand: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
    };
  };
  let service: BrandService;

  beforeEach(() => {
    db = {
      brand: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    service = new BrandService(db as unknown as DatabaseService);
  });

  describe("create", () => {
    it("creates a brand with the provided data", async () => {
      const created = { id: 1, slug: "acme", title: "Acme", code: "ACM" };
      db.brand.create.mockResolvedValue(created);

      const result = await service.create("acme", "Acme", "ACM", "desc");

      expect(db.brand.create).toHaveBeenCalledWith({
        data: { slug: "acme", title: "Acme", code: "ACM", description: "desc" },
      });
      expect(result).toBe(created);
    });

    it("defaults description to null", async () => {
      db.brand.create.mockResolvedValue({});

      await service.create("acme", "Acme", "ACM");

      expect(db.brand.create).toHaveBeenCalledWith({
        data: { slug: "acme", title: "Acme", code: "ACM", description: null },
      });
    });
  });

  describe("find", () => {
    it("applies default pagination", async () => {
      const brands = [{ id: 1 }];
      db.brand.findMany.mockResolvedValue(brands);

      const result = await service.find({});

      expect(db.brand.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
      });
      expect(result).toBe(brands);
    });

    it("applies custom pagination", async () => {
      db.brand.findMany.mockResolvedValue([]);

      await service.find({ title: "Acme" }, 10, 5);

      expect(db.brand.findMany).toHaveBeenCalledWith({
        where: { title: "Acme" },
        skip: 10,
        take: 5,
      });
    });
  });

  describe("findById", () => {
    it("returns the matching brand with related products", async () => {
      const brand = { id: 1 };
      db.brand.findUnique.mockResolvedValue(brand);

      const result = await service.findById(1);

      expect(db.brand.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          products: {
            include: {
              brand: true,
              images: true,
              offers: true,
              tags: true,
              variants: true,
            },
          },
        },
      });
      expect(result).toBe(brand);
    });

    it("returns null when the brand does not exist", async () => {
      db.brand.findUnique.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe("findOne", () => {
    it("returns the first matching brand with related products", async () => {
      const brand = { id: 1 };
      db.brand.findFirst.mockResolvedValue(brand);

      const result = await service.findOne({ title: "Acme" });

      expect(db.brand.findFirst).toHaveBeenCalledWith({
        where: { title: "Acme" },
        include: {
          products: {
            include: {
              brand: true,
              images: true,
              offers: true,
              tags: true,
              variants: true,
            },
          },
        },
      });
      expect(result).toBe(brand);
    });

    it("returns null when no brand matches", async () => {
      db.brand.findFirst.mockResolvedValue(null);

      const result = await service.findOne({ title: "nope" });

      expect(result).toBeNull();
    });
  });
});

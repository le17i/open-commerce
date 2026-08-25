import { CategoryService } from "./category.service";
import { DatabaseService } from "../database.service";

describe("CategoryService", () => {
  let db: {
    category: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
    };
  };
  let service: CategoryService;

  beforeEach(() => {
    db = {
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    service = new CategoryService(db as unknown as DatabaseService);
  });

  describe("create", () => {
    it("creates a category with the provided data", async () => {
      const created = { id: 1, slug: "shoes", title: "Shoes" };
      db.category.create.mockResolvedValue(created);

      const result = await service.create("shoes", "Shoes", "SHOES", "desc", 2);

      expect(db.category.create).toHaveBeenCalledWith({
        data: {
          slug: "shoes",
          title: "Shoes",
          code: "SHOES",
          description: "desc",
          parentId: 2,
        },
      });
      expect(result).toBe(created);
    });

    it("defaults description and parentId to null", async () => {
      db.category.create.mockResolvedValue({});

      await service.create("shoes", "Shoes", "SHOES");

      expect(db.category.create).toHaveBeenCalledWith({
        data: {
          slug: "shoes",
          title: "Shoes",
          code: "SHOES",
          description: null,
          parentId: null,
        },
      });
    });
  });

  describe("find", () => {
    it("applies default pagination", async () => {
      const categories = [{ id: 1 }];
      db.category.findMany.mockResolvedValue(categories);

      const result = await service.find({});

      expect(db.category.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
      });
      expect(result).toBe(categories);
    });

    it("applies custom pagination", async () => {
      db.category.findMany.mockResolvedValue([]);

      await service.find({ title: "Shoes" }, 10, 5);

      expect(db.category.findMany).toHaveBeenCalledWith({
        where: { title: "Shoes" },
        skip: 10,
        take: 5,
      });
    });
  });

  describe("findById", () => {
    it("returns the matching category with related products", async () => {
      const category = { id: 1 };
      db.category.findUnique.mockResolvedValue(category);

      const result = await service.findById(1);

      expect(db.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          products: {
            include: {
              category: true,
              images: true,
              offers: true,
              tags: true,
              variants: true,
            },
          },
        },
      });
      expect(result).toBe(category);
    });

    it("returns null when the category does not exist", async () => {
      db.category.findUnique.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe("findOne", () => {
    it("returns the first matching category with related products", async () => {
      const category = { id: 1 };
      db.category.findFirst.mockResolvedValue(category);

      const result = await service.findOne({ title: "Shoes" });

      expect(db.category.findFirst).toHaveBeenCalledWith({
        where: { title: "Shoes" },
        include: {
          products: {
            include: {
              category: true,
              images: true,
              offers: true,
              tags: true,
              variants: true,
            },
          },
        },
      });
      expect(result).toBe(category);
    });

    it("returns null when no category matches", async () => {
      db.category.findFirst.mockResolvedValue(null);

      const result = await service.findOne({ title: "nope" });

      expect(result).toBeNull();
    });
  });

  // `update` and `delete` are currently unimplemented no-ops on CategoryService.
  // These tests document that behavior; update them once real logic lands.
  describe("update", () => {
    it("resolves to undefined (not yet implemented)", async () => {
      await expect(service.update()).resolves.toBeUndefined();
    });
  });

  describe("delete", () => {
    it("resolves to undefined (not yet implemented)", async () => {
      await expect(service.delete()).resolves.toBeUndefined();
    });
  });
});

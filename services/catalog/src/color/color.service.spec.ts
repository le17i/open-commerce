import { ColorService } from "./color.service";
import { DatabaseService } from "../database.service";

describe("ColorService", () => {
  let db: {
    color: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
    };
  };
  let service: ColorService;

  beforeEach(() => {
    db = {
      color: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    service = new ColorService(db as unknown as DatabaseService);
  });

  describe("create", () => {
    it("creates a color with the provided data", async () => {
      const created = { id: 1, slug: "red", title: "Red" };
      db.color.create.mockResolvedValue(created);

      const result = await service.create(
        "red",
        "Red",
        "RED",
        "#FF0000",
        "desc",
      );

      expect(db.color.create).toHaveBeenCalledWith({
        data: {
          slug: "red",
          title: "Red",
          code: "RED",
          colorHex: "#FF0000",
          description: "desc",
        },
      });
      expect(result).toBe(created);
    });

    it("defaults description to null", async () => {
      db.color.create.mockResolvedValue({});

      await service.create("red", "Red", "RED", "#FF0000");

      expect(db.color.create).toHaveBeenCalledWith({
        data: {
          slug: "red",
          title: "Red",
          code: "RED",
          colorHex: "#FF0000",
          description: null,
        },
      });
    });
  });

  describe("find", () => {
    it("applies default pagination", async () => {
      const colors = [{ id: 1 }];
      db.color.findMany.mockResolvedValue(colors);

      const result = await service.find({});

      expect(db.color.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
      });
      expect(result).toBe(colors);
    });

    it("applies custom pagination", async () => {
      db.color.findMany.mockResolvedValue([]);

      await service.find({ title: "Red" }, 10, 5);

      expect(db.color.findMany).toHaveBeenCalledWith({
        where: { title: "Red" },
        skip: 10,
        take: 5,
      });
    });
  });

  describe("findById", () => {
    it("returns the matching color with related products", async () => {
      const color = { id: 1 };
      db.color.findUnique.mockResolvedValue(color);

      const result = await service.findById(1);

      expect(db.color.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          products: {
            include: {
              color: true,
              images: true,
              offers: true,
              tags: true,
              variants: true,
            },
          },
        },
      });
      expect(result).toBe(color);
    });

    it("returns null when the color does not exist", async () => {
      db.color.findUnique.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe("findOne", () => {
    it("returns the first matching color with related products", async () => {
      const color = { id: 1 };
      db.color.findFirst.mockResolvedValue(color);

      const result = await service.findOne({ title: "Red" });

      expect(db.color.findFirst).toHaveBeenCalledWith({
        where: { title: "Red" },
        include: {
          products: {
            include: {
              color: true,
              images: true,
              offers: true,
              tags: true,
              variants: true,
            },
          },
        },
      });
      expect(result).toBe(color);
    });

    it("returns null when no color matches", async () => {
      db.color.findFirst.mockResolvedValue(null);

      const result = await service.findOne({ title: "nope" });

      expect(result).toBeNull();
    });
  });
});

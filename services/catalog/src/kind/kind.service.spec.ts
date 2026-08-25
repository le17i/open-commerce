import { KindService } from "./kind.service";
import { DatabaseService } from "../database.service";

describe("KindService", () => {
  let db: {
    kind: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
    };
  };
  let service: KindService;

  beforeEach(() => {
    db = {
      kind: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    service = new KindService(db as unknown as DatabaseService);
  });

  describe("create", () => {
    it("creates a kind with the provided data", async () => {
      const created = { id: 1, code: "SHOE", label: "Shoe" };
      db.kind.create.mockResolvedValue(created);

      const result = await service.create("Shoe", "SHOE");

      expect(db.kind.create).toHaveBeenCalledWith({
        data: { code: "SHOE", label: "Shoe" },
      });
      expect(result).toBe(created);
    });
  });

  describe("find", () => {
    it("applies default pagination", async () => {
      const kinds = [{ id: 1 }];
      db.kind.findMany.mockResolvedValue(kinds);

      const result = await service.find({});

      expect(db.kind.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
      });
      expect(result).toBe(kinds);
    });

    it("applies custom pagination", async () => {
      db.kind.findMany.mockResolvedValue([]);

      await service.find({ label: "Shoe" }, 10, 5);

      expect(db.kind.findMany).toHaveBeenCalledWith({
        where: { label: "Shoe" },
        skip: 10,
        take: 5,
      });
    });
  });

  describe("findById", () => {
    it("returns the matching kind with related products", async () => {
      const kind = { id: 1 };
      db.kind.findUnique.mockResolvedValue(kind);

      const result = await service.findById(1);

      expect(db.kind.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          products: {
            include: {
              kind: true,
              images: true,
              offers: true,
              tags: true,
              variants: true,
            },
          },
        },
      });
      expect(result).toBe(kind);
    });

    it("returns null when the kind does not exist", async () => {
      db.kind.findUnique.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe("findOne", () => {
    it("returns the first matching kind with related products", async () => {
      const kind = { id: 1 };
      db.kind.findFirst.mockResolvedValue(kind);

      const result = await service.findOne({ label: "Shoe" });

      expect(db.kind.findFirst).toHaveBeenCalledWith({
        where: { label: "Shoe" },
        include: {
          products: {
            include: {
              kind: true,
              images: true,
              offers: true,
              tags: true,
              variants: true,
            },
          },
        },
      });
      expect(result).toBe(kind);
    });

    it("returns null when no kind matches", async () => {
      db.kind.findFirst.mockResolvedValue(null);

      const result = await service.findOne({ label: "nope" });

      expect(result).toBeNull();
    });
  });
});

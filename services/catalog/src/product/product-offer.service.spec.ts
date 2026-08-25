import { ProductOffersService } from "./product-offer.service";
import { DatabaseService } from "../database.service";

describe("ProductOffersService", () => {
  let tx: {
    product: { findUnique: jest.Mock };
    offer: {
      findUnique: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let db: { $transaction: jest.Mock };
  let service: ProductOffersService;

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
    tx = {
      product: { findUnique: jest.fn() },
      offer: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    db = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback(tx),
      ),
    };
    service = new ProductOffersService(db as unknown as DatabaseService);
  });

  describe("createOffer", () => {
    it("throws when the product does not exist", async () => {
      tx.product.findUnique.mockResolvedValue(null);

      await expect(service.createOffer(1)).rejects.toThrow(
        "Product with ID 1 not found.",
      );
      expect(tx.offer.create).not.toHaveBeenCalled();
    });

    it("deactivates existing offers, creates the new offer, and returns the product", async () => {
      tx.product.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 1, offers: [{ id: 5 }] });

      const result = await service.createOffer(1, 100, 80, true);

      expect(tx.offer.updateMany).toHaveBeenCalledWith({
        where: { productId: 1 },
        data: { isActive: false },
      });
      expect(tx.offer.create).toHaveBeenCalledWith({
        data: {
          productId: 1,
          price: 100,
          promotionalPrice: 80,
          isActive: true,
        },
      });
      expect(tx.product.findUnique).toHaveBeenLastCalledWith({
        where: { id: 1 },
        include: relatedInclude,
      });
      expect(result).toEqual({ id: 1, offers: [{ id: 5 }] });
    });

    it("applies default price, promotional price, and active flag", async () => {
      tx.product.findUnique.mockResolvedValue({ id: 1 });

      await service.createOffer(1);

      expect(tx.offer.create).toHaveBeenCalledWith({
        data: { productId: 1, price: 0, promotionalPrice: 0, isActive: true },
      });
    });
  });

  describe("editOffer", () => {
    it("throws when the product does not exist", async () => {
      tx.product.findUnique.mockResolvedValue(null);

      await expect(service.editOffer(1, 5, {})).rejects.toThrow(
        "Product with ID 1 not found.",
      );
      expect(tx.offer.update).not.toHaveBeenCalled();
    });

    it("throws when the offer does not exist", async () => {
      tx.product.findUnique.mockResolvedValue({ id: 1 });
      tx.offer.findUnique.mockResolvedValue(null);

      await expect(service.editOffer(1, 5, {})).rejects.toThrow(
        "Product offer with ID 5 not found.",
      );
      expect(tx.offer.update).not.toHaveBeenCalled();
    });

    it("deactivates other offers, updates the target offer, and returns the product", async () => {
      tx.product.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 1, offers: [{ id: 5, price: 150 }] });
      tx.offer.findUnique.mockResolvedValue({ id: 5 });

      const result = await service.editOffer(1, 5, { price: 150 });

      expect(tx.offer.updateMany).toHaveBeenCalledWith({
        where: { productId: 1 },
        data: { isActive: false },
      });
      expect(tx.offer.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { price: 150 },
      });
      expect(result).toEqual({ id: 1, offers: [{ id: 5, price: 150 }] });
    });
  });

  describe("deleteOffer", () => {
    it("throws when the product does not exist", async () => {
      tx.product.findUnique.mockResolvedValue(null);

      await expect(service.deleteOffer(1, 5)).rejects.toThrow(
        "Product with ID 1 not found.",
      );
      expect(tx.offer.delete).not.toHaveBeenCalled();
    });

    it("throws when the offer does not exist", async () => {
      tx.product.findUnique.mockResolvedValue({ id: 1 });
      tx.offer.findUnique.mockResolvedValue(null);

      await expect(service.deleteOffer(1, 5)).rejects.toThrow(
        "Product offer with ID 5 not found.",
      );
      expect(tx.offer.delete).not.toHaveBeenCalled();
    });

    it("deletes the offer and returns the product", async () => {
      tx.product.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 1, offers: [] });
      tx.offer.findUnique.mockResolvedValue({ id: 5 });

      const result = await service.deleteOffer(1, 5);

      expect(tx.offer.delete).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(result).toEqual({ id: 1, offers: [] });
    });
  });
});

import { Injectable } from "@nestjs/common";
import { Prisma } from "../database/prisma/client";
import { DatabaseService } from "../database.service";

@Injectable()
export class ProductOffersService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Finds a product by its identifier within a transaction.
   *
   * @param productId The product identifier.
   * @param $tx The Prisma transaction client.
   * @returns The matching product.
   * @throws {Error} If the product does not exist.
   */
  private async findProductById(
    productId: number,
    $tx: Prisma.TransactionClient,
  ) {
    const product = await $tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    return product;
  }

  /**
   * Creates an offer for a product and deactivates its existing offers.
   *
   * @param productId The product identifier.
   * @param price The offer price.
   * @param promotionalPrice The promotional offer price.
   * @param isActive Whether the new offer is active.
   * @returns The product with its updated offer information.
   */
  async createOffer(
    productId: number,
    price = 0,
    promotionalPrice = 0,
    isActive = true,
  ) {
    const product = await this.db.$transaction(async ($tx) => {
      await this.findProductById(productId, $tx);

      await $tx.offer.updateMany({
        where: { productId },
        data: { isActive: false },
      });

      await $tx.offer.create({
        data: {
          productId,
          price,
          promotionalPrice,
          isActive,
        },
      });

      return await $tx.product.findUnique({
        where: { id: productId },
        include: {
          brand: true,
          category: true,
          color: true,
          kind: true,
          images: true,
          offers: true,
          tags: true,
          variants: true,
        },
      });
    });

    return product;
  }

  /**
   * Updates an offer for a product and deactivates the product's other offers.
   *
   * @param productId The product identifier.
   * @param offerId The offer identifier.
   * @param data The offer fields to update.
   * @returns The product with its updated offer information.
   * @throws {Error} If the product or offer does not exist.
   */
  async editOffer(
    productId: number,
    offerId: number,
    data: Omit<Prisma.OfferUpdateInput, "productId">,
  ) {
    const product = await this.db.$transaction(async ($tx) => {
      await this.findProductById(productId, $tx);

      const existingOffer = await $tx.offer.findUnique({
        where: { id: offerId },
      });

      if (!existingOffer) {
        throw new Error(`Offer with id ${offerId} not found`);
      }

      await $tx.offer.updateMany({
        where: { productId },
        data: { isActive: false },
      });

      await $tx.offer.update({
        where: { id: offerId },
        data,
      });

      return await $tx.product.findUnique({
        where: { id: productId },
        include: {
          brand: true,
          category: true,
          color: true,
          kind: true,
          images: true,
          offers: true,
          tags: true,
          variants: true,
        },
      });
    });

    return product;
  }

  /**
   * Deletes an offer from a product.
   *
   * @param productId The product identifier.
   * @param offerId The offer identifier.
   * @returns The product with its updated offer information.
   */
  async deleteOffer(productId: number, offerId: number) {
    const product = await this.db.$transaction(async ($tx) => {
      await this.findProductById(productId, $tx);

      await $tx.offer.delete({
        where: { id: offerId },
      });

      return await $tx.product.findUnique({
        where: { id: productId },
        include: {
          brand: true,
          category: true,
          color: true,
          kind: true,
          images: true,
          offers: true,
          tags: true,
          variants: true,
        },
      });
    });

    return product;
  }
}

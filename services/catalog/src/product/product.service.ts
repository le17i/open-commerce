import { Injectable } from "@nestjs/common";
import { ProductStatusEnum, Prisma, Product } from "../database/prisma/client";
import { DatabaseService } from "../database.service";

// Re-exporting types from the generated Prisma client for external use.
// This avoid hard coupling with the generated Prisma client and allows for easier refactoring in the future.
export { type Product, ProductStatusEnum } from "../database/prisma/client";

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Creates a product and its initial offer.
   *
   * @param title Product title.
   * @param slug Product URL slug.
   * @param sku Product stock keeping unit.
   * @param barcode Product barcode.
   * @param model Product model.
   * @param brandId Brand identifier.
   * @param categoryId Category identifier.
   * @param colorId Color identifier.
   * @param kindId Product kind identifier.
   * @param content Optional product content.
   * @param description Optional product description.
   * @param height Product height.
   * @param length Product length.
   * @param parentId Optional parent product identifier.
   * @param price Initial offer price.
   * @param stock Initial stock quantity.
   * @param weight Product weight.
   * @param width Product width.
   * @param status Product status.
   * @returns The created product with its related entities.
   */
  async create(
    title: string,
    slug: string,
    sku: string,
    barcode: string,
    model: string,
    brandId: number,
    categoryId: number,
    colorId: number,
    kindId: number,
    content: string | null = null,
    description: string | null = null,
    height = 0,
    length = 0,
    parentId: number | null = null,
    price = 0,
    stock = 0,
    weight = 0,
    width = 0,
    status: ProductStatusEnum = ProductStatusEnum.DRAFT,
  ) {
    const product = await this.db.product.create({
      data: {
        barcode,
        brandId,
        categoryId,
        colorId,
        kindId,
        content,
        description,
        height,
        length,
        model,
        parentId,
        slug,
        status,
        stock,
        sku,
        title,
        weight,
        width,
        offers: {
          create: { price, isActive: true },
        },
      },
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

    return product;
  }

  /**
   * Finds products matching the provided filter.
   *
   * @param predicated Product filter criteria.
   * @param initial Number of records to skip.
   * @param perPage Maximum number of records to return.
   * @returns The matching products with their related entities.
   */
  async find(predicated: Prisma.ProductWhereInput, initial = 0, perPage = 20) {
    return this.db.product.findMany({
      where: predicated,
      skip: initial,
      take: perPage,
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
  }

  /**
   * Finds a product by its identifier.
   *
   * @param id Product identifier.
   * @returns The matching product with its related entities, or null if not found.
   */
  async findById(id: number) {
    return this.db.product.findUnique({
      where: { id },
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
  }

  /**
   * Finds the first product matching the provided filter.
   *
   * @param predicated Product filter criteria.
   * @returns The first matching product with its related entities, or null if not found.
   */
  async findOne(predicated: Prisma.ProductWhereInput) {
    return this.db.product.findFirst({
      where: predicated,
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
  }

  /**
   * Updates a product.
   *
   * @param predicated Unique criteria identifying the product to update.
   * @param model Product fields to update.
   * @returns The updated product with its related entities.
   */
  async update(
    predicated: Prisma.ProductWhereUniqueInput,
    model: Omit<
      Product,
      "id" | "createAt" | "categoryId" | "parentId" | "barcode" | "slug" | "sku"
    >,
  ) {
    return this.db.product.update({
      where: predicated,
      data: model,
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
  }

  /**
   * Adds an image to a product.
   *
   * @param productId Product identifier.
   * @param ext Image file extension.
   * @param filename Image filename.
   * @param description Optional image description.
   * @returns The created image.
   */
  async addImage(
    productId: number,
    ext: string,
    filename: string,
    description: string | null = null,
  ) {
    return this.db.image.create({
      data: { productId, ext, filename, description },
    });
  }
}

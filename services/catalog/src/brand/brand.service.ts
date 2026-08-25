import { Injectable } from "@nestjs/common";
import { Prisma } from "../database/prisma/client";
import { DatabaseService } from "../database.service";

@Injectable()
export class BrandService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Creates a brand.
   *
   * @param slug - The unique URL-friendly brand identifier.
   * @param title - The brand name.
   * @param code - The brand code.
   * @param description - An optional brand description.
   * @returns The created brand.
   */
  async create(
    slug: string,
    title: string,
    code: string,
    description: string | null = null,
  ) {
    const brand = await this.db.brand.create({
      data: {
        slug,
        title,
        code,
        description,
      },
    });

    return brand;
  }

  /**
   * Finds brands matching a predicate.
   *
   * @param predicate - The Prisma filter used to select brands.
   * @param initial - The number of matching brands to skip.
   * @param perPage - The maximum number of brands to return.
   * @returns The matching brands.
   */
  async find(predicate: Prisma.BrandWhereInput, initial = 0, perPage = 20) {
    const brands = await this.db.brand.findMany({
      where: predicate,
      skip: initial,
      take: perPage,
    });

    return brands;
  }

  /**
   * Finds a brand by its identifier, including its products and related data.
   *
   * @param brandId - The brand identifier.
   * @returns The matching brand, or null if it does not exist.
   */
  async findById(brandId: number) {
    const brand = await this.db.brand.findUnique({
      where: { id: brandId },
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

    return brand;
  }

  /**
   * Finds the first brand matching a predicate, including its products and related data.
   *
   * @param predicate - The Prisma filter used to select a brand.
   * @returns The first matching brand, or null if none is found.
   */
  async findOne(predicate: Prisma.BrandWhereInput) {
    const brand = await this.db.brand.findFirst({
      where: predicate,
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

    return brand;
  }
}

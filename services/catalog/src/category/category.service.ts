import { Injectable } from "@nestjs/common";
import { Prisma } from "../database/prisma/client";
import { DatabaseService } from "../database.service";

@Injectable()
export class CategoryService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Creates a category.
   *
   * @param slug - The category slug.
   * @param title - The category title.
   * @param code - The category code.
   * @param description - The category description.
   * @param parentId - The optional parent category ID.
   * @returns The created category.
   */
  async create(
    slug: string,
    title: string,
    code: string,
    description: string | null = null,
    parentId: number | null = null,
  ) {
    const category = await this.db.category.create({
      data: {
        slug,
        title,
        code,
        description,
        parentId,
      },
    });

    return category;
  }

  /**
   * Finds categories matching a predicate.
   *
   * @param predicate - The filter criteria.
   * @param initial - The number of categories to skip.
   * @param perPage - The maximum number of categories to return.
   * @returns The matching categories.
   */
  async find(predicate: Prisma.CategoryWhereInput, initial = 0, perPage = 20) {
    const categories = await this.db.category.findMany({
      where: predicate,
      skip: initial,
      take: perPage,
    });

    return categories;
  }

  /**
   * Finds a category by its ID.
   *
   * @param categoryId - The category ID.
   * @returns The matching category, or null if none exists.
   */
  async findById(categoryId: number) {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
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

    return category;
  }

  /**
   * Finds the first category matching a predicate.
   *
   * @param predicate - The filter criteria.
   * @returns The first matching category, or null if none exists.
   */
  async findOne(predicate: Prisma.CategoryWhereInput) {
    const category = await this.db.category.findFirst({
      where: predicate,
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

    return category;
  }

  async update() {}

  async delete() {}
}

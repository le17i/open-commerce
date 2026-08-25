import { Injectable } from "@nestjs/common";
import { Prisma } from "../database/prisma/client";
import { DatabaseService } from "../database.service";

@Injectable()
/** Provides database operations for product colors. */
export class ColorService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Creates a color.
   *
   * @param slug The URL-friendly identifier for the color.
   * @param title The display name of the color.
   * @param code The color code.
   * @param colorHex The hexadecimal representation of the color.
   * @param description An optional description of the color.
   */
  async create(
    slug: string,
    title: string,
    code: string,
    colorHex: string,
    description: string | null = null,
  ) {
    const color = await this.db.color.create({
      data: {
        slug,
        title,
        code,
        colorHex,
        description,
      },
    });

    return color;
  }

  /**
   * Finds colors matching a predicate using pagination.
   *
   * @param predicate The filter used to match colors.
   * @param initial The number of matching colors to skip.
   * @param perPage The maximum number of colors to return.
   */
  async find(predicate: Prisma.ColorWhereInput, initial = 0, perPage = 20) {
    const colors = await this.db.color.findMany({
      where: predicate,
      skip: initial,
      take: perPage,
    });

    return colors;
  }

  /**
   * Finds a color by its identifier, including related product data.
   *
   * @param colorId The unique identifier of the color.
   */
  async findById(colorId: number) {
    const color = await this.db.color.findUnique({
      where: { id: colorId },
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

    return color;
  }

  /**
   * Finds the first color matching a predicate, including related product data.
   *
   * @param predicate The filter used to match a color.
   */
  async findOne(predicate: Prisma.ColorWhereInput) {
    const color = await this.db.color.findFirst({
      where: predicate,
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

    return color;
  }
}

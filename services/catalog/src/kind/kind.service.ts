import { Injectable } from "@nestjs/common";
import { Prisma } from "../database/prisma/client";
import { DatabaseService } from "../database.service";

@Injectable()
export class KindService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Creates a kind.
   *
   * @param label The kind label.
   * @param code The unique kind code.
   * @returns The created kind.
   */
  async create(label: string, code: string) {
    const kind = await this.db.kind.create({
      data: { code, label },
    });

    return kind;
  }

  /**
   * Finds kinds matching the provided predicate.
   *
   * @param predicate The filter criteria.
   * @param initial The number of kinds to skip.
   * @param perPage The maximum number of kinds to return.
   * @returns The matching kinds.
   */
  async find(predicate: Prisma.KindWhereInput, initial = 0, perPage = 20) {
    const kinds = await this.db.kind.findMany({
      where: predicate,
      skip: initial,
      take: perPage,
    });
    return kinds;
  }

  /**
   * Finds a kind by its identifier, including its products and related data.
   *
   * @param kindId The kind identifier.
   * @returns The matching kind, or `null` if none is found.
   */
  async findById(kindId: number) {
    const kind = await this.db.kind.findUnique({
      where: { id: kindId },
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

    return kind;
  }

  /**
   * Finds the first kind matching the provided predicate, including its
   * products and related data.
   *
   * @param predicate The filter criteria.
   * @returns The first matching kind, or `null` if none is found.
   */
  async findOne(predicate: Prisma.KindWhereInput) {
    const kind = await this.db.kind.findFirst({
      where: predicate,
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

    return kind;
  }
}

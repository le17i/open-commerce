import { DatabaseService } from "../../src/database.service";

/** Prefix every e2e-created record's slug/code/etc. with this. */
export const E2E_PREFIX = "e2e-test-";

/**
 * Deletes rows created by e2e specs, identified by the shared `E2E_PREFIX`.
 * Call from a spec's `afterAll` once its `INestApplication`'s `DatabaseService`
 * instance is available (or a standalone one built for cleanup only).
 *
 * Deletes in FK-safe order: offers/images before products, products before
 * the domains they reference (brand/category/color/kind).
 */
export async function cleanupE2eData(db: DatabaseService): Promise<void> {
  const products = await db.product.findMany({
    where: { slug: { startsWith: E2E_PREFIX } },
    select: { id: true },
  });
  const productIds = products.map((p) => p.id);

  if (productIds.length > 0) {
    await db.offer.deleteMany({ where: { productId: { in: productIds } } });
    await db.image.deleteMany({ where: { productId: { in: productIds } } });
    // Variants reference their parent via parentId; clear self-references
    // before deleting so the FK doesn't block deletion.
    await db.product.updateMany({
      where: { id: { in: productIds } },
      data: { parentId: null },
    });
    await db.product.deleteMany({ where: { id: { in: productIds } } });
  }

  // Categories can self-reference via parentId (unique); clear those first
  // so deleting a parent doesn't hit the FK constraint.
  await db.category.updateMany({
    where: { slug: { startsWith: E2E_PREFIX } },
    data: { parentId: null },
  });
  await db.category.deleteMany({ where: { slug: { startsWith: E2E_PREFIX } } });
  await db.brand.deleteMany({ where: { slug: { startsWith: E2E_PREFIX } } });
  await db.color.deleteMany({ where: { slug: { startsWith: E2E_PREFIX } } });
  await db.kind.deleteMany({ where: { code: { startsWith: E2E_PREFIX } } });
}

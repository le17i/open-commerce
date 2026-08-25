// Plain domain errors for the product data layer. Deliberately free of any
// NestJS/HTTP concerns — `product.service.ts` throws these, and
// `product.controller.ts` is responsible for mapping them to the
// appropriate HTTP exception.

// Base class for "a related entity referenced in the request body doesn't
// exist" — these are all client input errors (400), just for different
// fields, so the controller can catch them together via `instanceof`.
export abstract class RelatedEntityNotFoundError extends Error {}

export class BrandNotFoundError extends RelatedEntityNotFoundError {
  constructor(brandId: number) {
    super(`Brand with ID ${brandId} not found.`);
  }
}

export class CategoryNotFoundError extends RelatedEntityNotFoundError {
  constructor(categoryId: number) {
    super(`Category with ID ${categoryId} not found.`);
  }
}

export class ColorNotFoundError extends RelatedEntityNotFoundError {
  constructor(colorId: number) {
    super(`Color with ID ${colorId} not found.`);
  }
}

export class KindNotFoundError extends RelatedEntityNotFoundError {
  constructor(kindId: number) {
    super(`Kind with ID ${kindId} not found.`);
  }
}

export class ParentProductNotFoundError extends RelatedEntityNotFoundError {
  constructor(parentId: number) {
    super(`Parent product with ID ${parentId} not found.`);
  }
}

export class ProductConflictError extends Error {
  constructor(slug: string) {
    super(`A product with slug '${slug}' already exists.`);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ProductsService, ProductStatusEnum } from "./product.service";
import { CreateProductDto, EditProductDto } from "./product.dto";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@Controller("products")
@ApiTags("Products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "List products" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 0 })
  @ApiQuery({ name: "perPage", required: false, type: Number, example: 20 })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["PUBLISHED", "DRAFT"],
    example: "PUBLISHED",
  })
  @ApiResponse({ status: 200, description: "Products listed successfully." })
  async GetProductsList(
    @Query("page") initial: number = 0,
    @Query("perPage") perPage: number = 20,
    @Query("status") status: ProductStatusEnum = "PUBLISHED",
  ) {
    const products = await this.productsService.find(
      {
        status,
      },
      initial,
      perPage,
    );
    return products;
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a product by ID" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({ status: 200, description: "Product found." })
  @ApiResponse({ status: 404, description: "Product not found." })
  async GetProductById(@Param("id") id: number) {
    const product = await this.productsService.findOne({ id });
    return product;
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get a product by slug" })
  @ApiParam({ name: "slug", type: String, example: "classic-t-shirt" })
  @ApiResponse({ status: 200, description: "Product found." })
  @ApiResponse({ status: 404, description: "Product not found." })
  async GetProductBySlug(@Param("slug") slug: string) {
    const product = await this.productsService.findOne({
      slug: slug,
    });
    return product;
  }

  @Post()
  @ApiOperation({ summary: "Create a product" })
  @ApiResponse({ status: 201, description: "Product created successfully." })
  @ApiResponse({ status: 400, description: "Invalid product data." })
  async CreateProduct(@Body() body: CreateProductDto) {
    const product = await this.productsService.create(
      body.slug,
      body.title,
      body.sku,
      body.barcode,
      body.model,
      body.brandId,
      body.categoryId,
      body.colorId,
      body.kindId,
      body.content,
      body.description,
      body.height,
      body.length,
      body.parentId,
      body.price,
      body.stock,
      body.weight,
      body.width,
    );

    return product;
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a product" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({ status: 200, description: "Product updated successfully." })
  @ApiResponse({ status: 404, description: "Product not found." })
  async EditProduct(@Param("id") id: number, @Body() body: EditProductDto) {
    const product = await this.productsService.update({ id }, body);

    return product;
  }
}

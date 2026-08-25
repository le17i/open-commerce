import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CategoryService } from "./category.service";
import { CategoryDto, CreateCategoryDto } from "./category.dto";

@Controller("categories")
@ApiTags("Categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get("getCategoriesList")
  @ApiOperation({ summary: "List categories" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 0 })
  @ApiQuery({ name: "perPage", required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: "Categories retrieved successfully.",
    type: [CategoryDto],
  })
  async GetCategoriesList(
    @Query("page") initial: number = 0,
    @Query("perPage") perPage: number = 20,
  ) {
    const categories = await this.categoryService.find({}, initial, perPage);
    return categories;
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a category by ID" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: "Category retrieved successfully.",
    type: CategoryDto,
  })
  async GetCategoryById(@Param("id") id: number) {
    const category = await this.categoryService.findById(id);
    return category;
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get a category by slug" })
  @ApiParam({ name: "slug", type: String, example: "electronics" })
  @ApiResponse({
    status: 200,
    description: "Category retrieved successfully.",
    type: CategoryDto,
  })
  async GetCategoryBySlug(@Param("slug") slug: string) {
    const category = await this.categoryService.findOne({ slug });
    return category;
  }

  @Post()
  @ApiOperation({ summary: "Create a category" })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: "Category created successfully.",
    type: CategoryDto,
  })
  async CreateCategory(@Body() body: CreateCategoryDto) {
    const category = await this.categoryService.create(
      body.slug,
      body.title,
      body.code,
      body.description,
      body.parentId,
    );

    return category;
  }
}

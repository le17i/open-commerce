import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { BrandDto, CreateBrandDto } from "./brand.dto";
import { BrandService } from "./brand.service";

@Controller("brands")
@ApiTags("Brands")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: "List brands" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 0 })
  @ApiQuery({ name: "perPage", required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: "Brands retrieved successfully",
    type: [BrandDto],
  })
  async GetBrandsList(
    @Query("page") initial: number = 0,
    @Query("perPage") perPage: number = 20,
  ) {
    const brands = await this.brandService.find({}, initial, perPage);
    return brands;
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a brand by ID" })
  @ApiParam({ name: "id", type: Number, description: "Brand ID" })
  @ApiResponse({
    status: 200,
    description: "Brand retrieved successfully",
    type: BrandDto,
  })
  @ApiResponse({ status: 404, description: "Brand not found" })
  async GetBrandById(@Param("id") id: number) {
    const brand = await this.brandService.findById(id);
    return brand;
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get a brand by slug" })
  @ApiParam({ name: "slug", type: String, description: "Brand slug" })
  @ApiResponse({
    status: 200,
    description: "Brand retrieved successfully",
    type: BrandDto,
  })
  @ApiResponse({ status: 404, description: "Brand not found" })
  async GetBrandBySlug(@Param("slug") slug: string) {
    const brand = await this.brandService.findOne({ slug });
    return brand;
  }

  @Post()
  @ApiOperation({ summary: "Create a brand" })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({
    status: 201,
    description: "Brand created successfully",
    type: BrandDto,
  })
  async CreateBrand(@Body() body: CreateBrandDto) {
    const brand = await this.brandService.create(
      body.slug,
      body.title,
      body.code,
      body.description,
    );

    return brand;
  }
}

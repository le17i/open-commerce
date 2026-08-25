import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ColorService } from "./color.service";
import { ColorDto, CreateColorDto } from "./color.dto";

@ApiTags("Colors")
@Controller("colors")
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Get()
  @ApiOperation({ summary: "List colors" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 0 })
  @ApiQuery({ name: "perPage", required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: "Colors retrieved successfully.",
    type: [ColorDto],
  })
  async GetColorsList(
    @Query("page") initial: number = 0,
    @Query("perPage") perPage: number = 20,
  ) {
    const colors = await this.colorService.find({}, initial, perPage);
    return colors;
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a color by ID" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: "Color retrieved successfully.",
    type: ColorDto,
  })
  @ApiResponse({ status: 404, description: "Color not found." })
  async GetColorById(@Param("id") id: number) {
    const color = await this.colorService.findById(id);
    return color;
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get a color by slug" })
  @ApiParam({ name: "slug", type: String, example: "midnight-blue" })
  @ApiResponse({
    status: 200,
    description: "Color retrieved successfully.",
    type: ColorDto,
  })
  @ApiResponse({ status: 404, description: "Color not found." })
  async GetColorBySlug(@Param("slug") slug: string) {
    const color = await this.colorService.findOne({ slug });
    return color;
  }

  @Post()
  @ApiOperation({ summary: "Create a color" })
  @ApiBody({ type: CreateColorDto })
  @ApiResponse({
    status: 201,
    description: "Color created successfully.",
    type: ColorDto,
  })
  @ApiResponse({ status: 400, description: "Invalid color data." })
  async CreateColor(@Body() body: CreateColorDto) {
    const color = await this.colorService.create(
      body.slug,
      body.title,
      body.code,
      body.colorHex,
      body.description,
    );

    return color;
  }
}

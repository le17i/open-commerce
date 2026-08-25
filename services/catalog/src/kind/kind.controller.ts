import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { KindService } from "./kind.service";
import { CreateKindDto, KindDto } from "./kind.dto";

@ApiTags("Kinds")
@Controller("kinds")
export class KindController {
  constructor(private readonly kindService: KindService) {}

  @Get()
  @ApiOperation({ summary: "List kinds" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 0 })
  @ApiQuery({ name: "perPage", required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: "Kinds retrieved successfully.",
    type: [KindDto],
  })
  async GetKindsList(
    @Query("page") initial: number = 0,
    @Query("perPage") perPage: number = 20,
  ) {
    const kinds = await this.kindService.find({}, initial, perPage);
    return kinds;
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a kind by ID" })
  @ApiParam({ name: "id", type: Number, description: "Kind ID" })
  @ApiResponse({
    status: 200,
    description: "Kind retrieved successfully.",
    type: KindDto,
  })
  async GetKindById(@Param("id") id: number) {
    const kind = await this.kindService.findById(id);
    return kind;
  }

  @Post()
  @ApiOperation({ summary: "Create a kind" })
  @ApiBody({ type: CreateKindDto })
  @ApiResponse({
    status: 201,
    description: "Kind created successfully.",
    type: KindDto,
  })
  async CreateKind(@Body() body: CreateKindDto) {
    const kind = await this.kindService.create(body.label, body.code);

    return kind;
  }
}

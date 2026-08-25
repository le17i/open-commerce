import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller()
@ApiTags("Health")
export class AppController {
  @Get("health")
  @ApiOperation({
    summary: "Check service health",
    description:
      "Returns the current availability status of the catalog service.",
  })
  @ApiOkResponse({
    description: "The catalog service is healthy and available",
    schema: {
      example: { message: "UP", status: 200 },
    },
  })
  healthCheck() {
    return { message: "UP", status: 200 };
  }
}

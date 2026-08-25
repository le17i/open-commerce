import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ProductDto } from "./product.dto";
import {
  CreateProductOfferDto,
  EditProductOfferDto,
} from "./product-offer.dto";
import { ProductOffersService } from "./product-offer.service";

@ApiTags("Product Offers")
@Controller("products/:productId/offers")
export class ProductOffersController {
  constructor(private readonly productOffersService: ProductOffersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new product offer" })
  @ApiCreatedResponse({ description: "Return a product", type: ProductDto })
  @ApiBadRequestResponse({ description: "Invalid input" })
  async CreateOffer(
    @Param("productId") productId: number,
    @Body() body: CreateProductOfferDto,
  ) {
    try {
      const product = await this.productOffersService.createOffer(
        productId,
        body.price,
        body.promotionalPrice,
        body.isActive,
      );
      return product;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Put("id")
  @ApiOperation({ summary: "Activates an offer for from a product" })
  @ApiCreatedResponse({ description: "Return a product", type: ProductDto })
  @ApiBadRequestResponse({ description: "Invalid input" })
  async ActiveOffer(
    @Param("productId") productId: number,
    @Param("id") offerId: number,
    @Body() body: EditProductOfferDto,
  ) {
    try {
      const product = await this.productOffersService.editOffer(
        productId,
        offerId,
        body,
      );
      return product;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}

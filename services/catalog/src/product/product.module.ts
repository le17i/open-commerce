import { Global, Module } from "@nestjs/common";
import { ProductsController } from "./product.controller";
import { ProductOffersController } from "./product-offer.controller";
import { ProductsService } from "./product.service";
import { ProductOffersService } from "./product-offer.service";

@Global()
@Module({
  controllers: [ProductsController, ProductOffersController],
  providers: [ProductsService, ProductOffersService],
  exports: [ProductsService],
})
export class ProductsModule {}

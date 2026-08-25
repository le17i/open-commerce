import { Global, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { DatabaseService } from "./database.service";
import { ProductsModule } from "./product/product.module";
import { BrandModule } from "./brand/brand.module";
import { CategoryModule } from "./category/category.module";
import { ColorModule } from "./color/color.module";
import { KindModule } from "./kind/kind.module";

@Global()
@Module({
  imports: [
    BrandModule,
    CategoryModule,
    ColorModule,
    KindModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class AppModule {}

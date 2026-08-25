import { Global, Module } from "@nestjs/common";
import { ColorController } from "./color.controller";
import { ColorService } from "./color.service";

@Global()
@Module({
  controllers: [ColorController],
  providers: [ColorService],
  exports: [ColorService],
})
export class ColorModule {}

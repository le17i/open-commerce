import { Global, Module } from "@nestjs/common";
import { KindController } from "./kind.controller";
import { KindService } from "./kind.service";

@Global()
@Module({
  controllers: [KindController],
  providers: [KindService],
  exports: [KindService],
})
export class KindModule {}

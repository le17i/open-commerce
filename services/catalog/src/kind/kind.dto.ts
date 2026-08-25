import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateKindDto {
  @ApiProperty({
    description: "Display name of the kind.",
    example: "Electronics",
  })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({
    description: "Unique code used to identify the kind.",
    example: "electronics",
  })
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class KindDto extends CreateKindDto {
  @ApiProperty({
    description: "Unique identifier of the kind.",
    example: "1",
  })
  @IsString()
  @IsNotEmpty()
  id!: string;
}

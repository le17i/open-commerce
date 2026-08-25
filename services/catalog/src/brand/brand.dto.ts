import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBrandDto {
  @ApiProperty({
    description: "URL-friendly unique identifier for the brand",
    example: "acme",
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({
    description: "Display name of the brand",
    example: "Acme",
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: "Unique code used to identify the brand",
    example: "ACME",
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({
    description: "Optional description of the brand",
    example: "A trusted provider of everyday products",
  })
  @IsString()
  description?: string;
}

export class BrandDto extends CreateBrandDto {
  @ApiProperty({
    description: "Unique identifier of the brand",
    example: "1",
  })
  @IsString()
  @IsNotEmpty()
  id!: string;
}

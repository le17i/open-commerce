import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({
    description: "URL-friendly unique identifier for the category.",
    example: "electronics",
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({
    description: "Display name of the category.",
    example: "Electronics",
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: "Unique code used to identify the category.",
    example: "ELEC",
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({
    description: "Optional description of the category.",
    example: "Devices, accessories, and other electronic products.",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Identifier of the parent category, if this is a subcategory.",
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  parentId?: number;
}

export class CategoryDto extends CreateCategoryDto {
  @ApiProperty({
    description: "Unique identifier of the category.",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  id!: number;
}

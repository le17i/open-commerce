import { OmitType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

import { ProductStatusEnum } from "./product.service";

export class CreateProductDto {
  @ApiProperty({ description: "Product title", example: "Classic T-Shirt" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: "URL-friendly product identifier",
    example: "classic-t-shirt",
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ description: "Product barcode", example: "7891234567890" })
  @IsString()
  @IsNotEmpty()
  barcode!: string;

  @ApiProperty({ description: "Stock keeping unit", example: "TSH-CLS-BLK-M" })
  @ApiProperty({ description: "Product model", example: "CLS-2024" })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({ description: "Brand identifier", example: 1 })
  @IsInt()
  brandId!: number;

  @ApiProperty({ description: "Category identifier", example: 10 })
  @IsInt()
  categoryId!: number;

  @ApiProperty({ description: "Color identifier", example: 3 })
  @IsInt()
  colorId!: number;

  @ApiProperty({ description: "Product kind identifier", example: 2 })
  @IsInt()
  kindId!: number;

  @ApiPropertyOptional({
    description: "Product content",
    example: "100% cotton",
  })
  @IsString()
  @IsOptional()
  content!: string;

  @ApiPropertyOptional({
    description: "Product description",
    example: "A comfortable classic T-shirt.",
  })
  @IsString()
  @IsOptional()
  description!: string;

  @ApiPropertyOptional({
    description: "Height in the configured unit",
    example: 30,
  })
  @IsInt()
  @IsOptional()
  height!: number;

  @ApiPropertyOptional({
    description: "Length in the configured unit",
    example: 70,
  })
  @IsInt()
  @IsOptional()
  length!: number;

  @ApiPropertyOptional({
    description: "Parent product identifier",
    example: 100,
  })
  @IsInt()
  @IsOptional()
  parentId!: number;

  @ApiPropertyOptional({ description: "Product price", example: 4990 })
  @IsInt()
  @IsOptional()
  price!: number;

  @ApiPropertyOptional({ description: "Available stock quantity", example: 25 })
  @IsInt()
  @IsOptional()
  stock!: number;

  @ApiPropertyOptional({ description: "Product weight", example: 0.25 })
  @IsNumber()
  @IsOptional()
  weight!: number;

  @ApiPropertyOptional({
    description: "Width in the configured unit",
    example: 50,
  })
  @IsInt()
  @IsOptional()
  width!: number;
}

export class EditProductDto extends OmitType(CreateProductDto, [
  "barcode",
  "categoryId",
  "parentId",
  "price",
  "slug",
  "sku",
]) {
  @ApiProperty({ description: "Product identifier", example: 42 })
  @IsNumber()
  id!: number;

  @ApiProperty({
    enum: ProductStatusEnum,
    description: "Current product status",
  })
  @IsString()
  status!: ProductStatusEnum;
}

export class ProductDto extends CreateProductDto {
  @ApiProperty({ description: "Product identifier", example: 42 })
  @IsNumber()
  id!: number;

  @ApiProperty({
    enum: ProductStatusEnum,
    description: "Current product status",
  })
  @IsString()
  status!: ProductStatusEnum;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt } from "class-validator";

export class CreateProductOfferDto {
  @ApiProperty({
    description: "Offer price in the smallest unit of the currency.",
    example: 1999,
    type: Number,
  })
  @IsInt()
  price!: number;

  @ApiProperty({
    description:
      "Promotional offer price in the smallest unit of the currency.",
    example: 1499,
    type: Number,
  })
  @IsInt()
  promotionalPrice!: number;

  @ApiProperty({
    description: "Whether the product offer is active.",
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  isActive!: boolean;
}

export class EditProductOfferDto extends CreateProductOfferDto {}

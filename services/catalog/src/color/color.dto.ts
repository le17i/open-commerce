import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateColorDto {
  @ApiProperty({
    description: "URL-friendly identifier for the color.",
    example: "midnight-blue",
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({
    description: "Display name of the color.",
    example: "Midnight Blue",
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: "Application-specific code for the color.",
    example: "MBL",
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: "Color value in hexadecimal format.",
    example: "#191970",
    pattern: "^#[0-9A-Fa-f]{6}$",
  })
  @IsString()
  @IsNotEmpty()
  colorHex!: string;

  @ApiPropertyOptional({
    description: "Optional description of the color.",
    example: "A deep blue shade with a subtle purple undertone.",
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ColorDto extends CreateColorDto {
  @ApiProperty({
    description: "Unique identifier of the color.",
    example: "1",
  })
  @IsString()
  @IsNotEmpty()
  id!: string;
}

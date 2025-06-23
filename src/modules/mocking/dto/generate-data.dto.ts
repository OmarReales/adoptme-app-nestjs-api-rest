import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateDataDto {
  @ApiProperty({
    description: 'Number of users to generate',
    example: 50,
    minimum: 1,
    maximum: 1000,
    required: false,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Users count must be an integer' })
  @Min(1, { message: 'Users count must be at least 1' })
  @Max(1000, { message: 'Users count cannot exceed 1000' })
  users?: number = 50;

  @ApiProperty({
    description: 'Number of pets to generate',
    example: 100,
    minimum: 1,
    maximum: 2000,
    required: false,
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Pets count must be an integer' })
  @Min(1, { message: 'Pets count must be at least 1' })
  @Max(2000, { message: 'Pets count cannot exceed 2000' })
  pets?: number = 100;
}

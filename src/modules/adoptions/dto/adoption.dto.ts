import { IsString, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdoptionStatus } from '../../../schemas/adoption.schema';

export class CreateAdoptionDto {
  @ApiProperty({
    description: 'Pet ID to adopt',
    example: '64f8b5c2e4b0a8f2c1d3e4f5',
  })
  @IsMongoId()
  pet: string;

  @ApiProperty({
    description: 'Optional notes from the user',
    example: 'I would love to adopt this pet because...',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAdoptionDto {
  @ApiProperty({
    description: 'Adoption status',
    enum: AdoptionStatus,
    example: AdoptionStatus.APPROVED,
  })
  @IsEnum(AdoptionStatus)
  status: AdoptionStatus;

  @ApiProperty({
    description: 'Admin notes',
    example: 'Approved after background check',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

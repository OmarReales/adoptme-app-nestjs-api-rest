import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  MinLength,
  Min,
  Max,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PetStatus } from '../../../schemas/pet.schema';

export class CreatePetDto {
  @ApiProperty({
    description: 'Name of the pet',
    example: 'Buddy',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Breed of the pet',
    example: 'Golden Retriever',
  })
  @IsString()
  @IsNotEmpty()
  breed: string;

  @ApiProperty({
    description: 'Age of the pet in years',
    example: 3,
    minimum: 0,
    maximum: 30,
  })
  @IsInt()
  @Min(0)
  @Max(30)
  age: number;

  @ApiProperty({
    description: 'Description of the pet',
    example: 'Friendly and energetic dog who loves to play',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Image URL of the pet',
    example: 'https://example.com/pet-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'Status of the pet',
    enum: PetStatus,
    example: PetStatus.AVAILABLE,
    default: PetStatus.AVAILABLE,
    required: false,
  })
  @IsOptional()
  @IsEnum(PetStatus)
  status?: PetStatus = PetStatus.AVAILABLE;
}

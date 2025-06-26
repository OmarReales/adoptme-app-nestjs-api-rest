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
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PetStatus, PetSpecies, PetGender } from '../../../schemas/pet.schema';

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
    description: 'Species of the pet',
    enum: PetSpecies,
    example: PetSpecies.DOG,
  })
  @IsEnum(PetSpecies)
  species: PetSpecies;

  @ApiProperty({
    description: 'Gender of the pet',
    enum: PetGender,
    example: PetGender.MALE,
  })
  @IsEnum(PetGender)
  gender: PetGender;

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
  image?: string;

  @ApiProperty({
    description: 'Characteristics of the pet',
    example: ['friendly', 'energetic', 'house-trained'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  characteristics?: string[];

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

import {
  IsString,
  IsEmail,
  IsInt,
  IsEnum,
  MinLength,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../schemas/user.schema';
import { IsStrongPassword } from '../../../common/validators/strong-password.validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique userName for the user',
    example: 'john_doe',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  userName: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'Age of the user',
    example: 25,
    minimum: 18,
    maximum: 120,
  })
  @IsInt()
  @Min(18)
  @Max(120)
  age: number;

  @ApiProperty({
    description: 'Role of the user',
    enum: UserRole,
    example: UserRole.USER,
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  role?: UserRole = UserRole.USER;
}

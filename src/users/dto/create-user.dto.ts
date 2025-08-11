import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsInt,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @MinLength(6) 
  @IsNotEmpty()
  readonly password: string;

  @IsInt()
  readonly role_id: number;
}

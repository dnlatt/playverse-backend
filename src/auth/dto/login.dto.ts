// src/auth/dto/login.dto.ts
//
// Login Request ကို validate လုပ်ရန် DTO
//
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
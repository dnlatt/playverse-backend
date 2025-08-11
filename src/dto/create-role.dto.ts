//
// Data validation for creating a new role.
//

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'The name of the role',
    example: 'Admin',
    maxLength: 50,
  })
  name: string;
}
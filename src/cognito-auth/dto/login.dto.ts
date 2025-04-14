import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña del usuario'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
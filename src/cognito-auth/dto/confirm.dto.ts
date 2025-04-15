import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class ConfirmAuthDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario a confirmar'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Código de verificación enviado al email'
  })
  @IsString()
  @IsNotEmpty()
  pin: string;
}
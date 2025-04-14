import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, Matches, IsEnum } from "class-validator";
import { Roles } from "@prisma/client";

export class RegisterAuthDto {
  @ApiProperty({
    description: 'Debe ser un email válido',
    example: 'usuario@test.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mínimo 8 caracteres con mayúscula, número y símbolo',
    example: 'P@ssw0rd123'
  })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*\d)(?=.*[A-Z])(?=.*\W)/, {
    message: 'La contraseña debe contener al menos: 1 mayúscula, 1 número y 1 símbolo'
  })
  password: string;

  @ApiProperty({
    description: 'Rol del usuario',
    example: 'USER',
    enum: Roles,
    required: false,
    default: 'USER'
  })
  @IsEnum(Roles)
  role?: Roles = Roles.USER;
}
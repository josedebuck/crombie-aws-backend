import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsIn } from 'class-validator';
import { Roles } from '@prisma/client';

export class AssignRoleDto {
  @ApiProperty({
    description: 'Email del usuario a asignar rol',
    example: 'admin@ejemplo.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Rol a asignar',
    example: 'ADMIN',
    enum: Roles // Esto automáticamente usará solo ADMIN y USER
  })
  @IsString()
  @IsIn(Object.values(Roles), {
    message: `El rol debe ser uno de: ${Object.values(Roles).join(', ')}`
  })
  role: Roles;
}
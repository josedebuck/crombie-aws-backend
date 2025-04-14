import { 
    Controller, 
    Get, 
    Param, 
    Patch, 
    Delete, 
    Body,
    UseGuards 
  } from '@nestjs/common';
  import { UserService } from './user.service';
  import { JwtAuthGuard } from 'src/cognito-auth/cognito-auth.guard';
  import { RolesGuard } from 'src/custom-decorators/roles.guard';
  import { AcceptedRoles } from 'src/custom-decorators/roles.decorator';
  import { Roles } from '@prisma/client';
  import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  
  @ApiTags('Users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('users')
  export class UserController {
    constructor(private readonly userService: UserService) {}
  
    @Get(':id')
    @AcceptedRoles(Roles.ADMIN, Roles.USER)
    @ApiOperation({ summary: 'Obtener usuario por ID' })
    @ApiResponse({ 
      status: 200, 
      description: 'Usuario encontrado',
      schema: {
        example: {
          id: 'uuid',
          email: 'user@example.com',
          userName: 'john_doe',
          rol: 'USER',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        }
      }
    })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async getUser(@Param('id') id: string) {
      return this.userService.getUserById(id);
    }
  
    @Patch(':id')
    @AcceptedRoles(Roles.ADMIN, Roles.USER)
    @ApiOperation({ summary: 'Actualizar usuario' })
    @ApiResponse({ 
      status: 200, 
      description: 'Usuario actualizado',
      schema: {
        example: {
          id: 'uuid',
          email: 'new_email@example.com',
          userName: 'new_username',
          rol: 'USER',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-10T00:00:00.000Z'
        }
      }
    })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async updateUser(
      @Param('id') id: string,
      @Body() data: { email?: string; userName?: string }
    ) {
      return this.userService.updateUser(id, data);
    }
  
    @Delete(':id')
    @AcceptedRoles(Roles.ADMIN)
    @ApiOperation({ summary: 'Eliminar usuario' })
    @ApiResponse({ 
      status: 200, 
      description: 'Usuario eliminado',
      schema: {
        example: { 
          id: 'uuid', 
          email: 'user@example.com' 
        }
      }
    })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async deleteUser(@Param('id') id: string) {
      return this.userService.deleteUser(id);
    }
  }
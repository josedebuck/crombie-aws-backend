import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CognitoIdentityProviderClient, GetUserCommand, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { Roles } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(private prisma: PrismaService) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      console.log('Token recibido:', token.substring(0, 20) + '...');
      
      const response = await this.cognitoClient.send(
        new GetUserCommand({ AccessToken: token })
      );

      console.log('Respuesta de GetUser:', JSON.stringify(response, null, 2));

      if (!response.Username) {
        throw new UnauthorizedException('No se pudo identificar al usuario');
      }

      const email = response.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
      
      if (!email) {
        throw new UnauthorizedException('No se pudo obtener el email del usuario');
      }

      // Obtener el rol del usuario desde la base de datos
      const dbUser = await this.prisma.user.findUnique({
        where: { email },
        select: { role: true }
      });

      if (!dbUser) {
        throw new UnauthorizedException('Usuario no encontrado en la base de datos');
      }

      console.log('Usuario encontrado en DB:', {
        email,
        role: dbUser.role
      });

      request.user = {
        id: response.Username,
        email: email,
        role: dbUser.role // Usar el rol de la base de datos
      };

      console.log('Request user:', JSON.stringify(request.user, null, 2));
      return true;
    } catch (error) {
      console.error('Error detallado de Cognito:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    console.log('Header de autorización:', authHeader);
    console.log('Token extraído:', token ? token.substring(0, 20) + '...' : 'no token');
    return token;
  }
}
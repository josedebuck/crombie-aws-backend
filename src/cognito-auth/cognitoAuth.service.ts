import { 
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand, 
  SignUpCommand, 
  ConfirmSignUpCommand,
  AdminGetUserCommand 
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from './dto/login.dto';
import { RegisterAuthDto } from './dto/register.dto';
import { ConfirmAuthDto } from './dto/confirm.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Roles } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CognitoAuthService {
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.configService.get<string>('AWS_REGION'),
    });
    this.userPoolId = this.configService.get<string>('COGNITO_USER_POOL_ID') ?? '';
    this.clientId = this.configService.get<string>('COGNITO_CLIENT_ID') ?? '';
  }

  async signUp(registerDto: RegisterAuthDto): Promise<any> {
    try {
      const username = this.generateRandomUsername();

      const signUpCommand = new SignUpCommand({
        ClientId: this.clientId,
        Username: username,
        Password: registerDto.password,
        UserAttributes: [
          { Name: 'email', Value: registerDto.email }
        ],
      });

      const cognitoResult = await this.cognitoClient.send(signUpCommand);

      const prismaUser = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          username: username,
          password: 'managed-by-cognito',
          role: registerDto.role,
        },
      });

      return {
        ...cognitoResult,
        prismaUserId: prismaUser.id,
        email: registerDto.email,
        role: registerDto.role,
        userConfirmed: false,
        message: 'Registro exitoso. Por favor verifica tu email con el código de confirmación.'
      };
    } catch (error) {
      if (error.name === 'UsernameExistsException') {
        throw new BadRequestException('El usuario ya existe');
      }
      if (error.name === 'InvalidPasswordException') {
        throw new BadRequestException('La contraseña no cumple los requisitos');
      }
      throw new BadRequestException(error.message || 'Error en el registro');
    }
  }

  async signIn(loginDto: LoginAuthDto): Promise<any> {
    try {
      if (!loginDto.email) {
        throw new BadRequestException('El email es requerido');
      }

      // Primero intentamos obtener el usuario de Cognito
      try {
        await this.getUser(loginDto.email);
      } catch (error) {
        if (error.name === 'UserNotFoundException') {
          throw new UnauthorizedException('Usuario no encontrado');
        }
        throw error;
      }

      // Luego buscamos en nuestra base de datos
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
        select: { role: true, username: true },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado en la base de datos local');
      }

      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: loginDto.email, // Usar email como username
          PASSWORD: loginDto.password,
        },
      });
      
      const response = await this.cognitoClient.send(command);

      return {
        ...response.AuthenticationResult,
        role: user.role || Roles.USER,
      };
    } catch (error) {
      console.error('Error detallado en signIn:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      if (error.name === 'NotAuthorizedException') {
        throw new UnauthorizedException('Credenciales inválidas');
      } 
      if (error.name === 'UserNotFoundException') {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      if (error.name === 'UserNotConfirmedException') {
        throw new UnauthorizedException('Usuario no confirmado');
      }
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error en la autenticación: ' + error.message);
    }
  }

  async confirmSignUp(confirmDto: ConfirmAuthDto): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: confirmDto.email },
        select: { username: true },
      });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      const command = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: user.username,
        ConfirmationCode: confirmDto.pin,
      });
      
      const result = await this.cognitoClient.send(command);
      
      return {
        ...result,
        message: 'Usuario confirmado exitosamente',
        userConfirmed: true
      };
    } catch (error) {
      if (error.name === 'CodeMismatchException') {
        throw new BadRequestException('Código de verificación incorrecto');
      }
      if (error.name === 'ExpiredCodeException') {
        throw new BadRequestException('Código de verificación expirado');
      }
      throw new BadRequestException(error.message || 'Error al confirmar el registro');
    }
  }

  async refreshToken(refreshTokenDto: RefreshDto): Promise<any> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshTokenDto.refreshToken,
        },
      });

      const response = await this.cognitoClient.send(command);
      return {
        accessToken: response.AuthenticationResult?.AccessToken,
        idToken: response.AuthenticationResult?.IdToken,
        expiresIn: response.AuthenticationResult?.ExpiresIn,
      };
    } catch (error) {
      if (error.name === 'NotAuthorizedException') {
        throw new UnauthorizedException('Token de refresco inválido o expirado');
      }
      throw new InternalServerErrorException('Error al refrescar el token');
    }
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      await this.getUser(email);
      return false;
    } catch (error) {
      if (error.name === 'UserNotFoundException') {
        return true;
      }
      throw new InternalServerErrorException('Error al verificar el email');
    }
  }

  private async getUser(email: string): Promise<any> {
    const command = new AdminGetUserCommand({
      UserPoolId: this.userPoolId,
      Username: email,
    });
    return await this.cognitoClient.send(command);
  }

  private generateRandomUsername(): string {
    const randomString = Math.random().toString(36).substring(2, 10);
    return `user_${randomString}`;
  }
}
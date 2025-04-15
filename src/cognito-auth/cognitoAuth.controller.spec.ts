import { Test, TestingModule } from '@nestjs/testing';
import { CognitoAuthController } from './cognitoAuth.controller';
import { CognitoAuthService } from './cognitoAuth.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Roles } from '@prisma/client';

// mock para los servicios
const mockCognitoAuthService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  confirmSignUp: jest.fn(),
  refreshToken: jest.fn(),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('CognitoAuthController', () => {
  let controller: CognitoAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CognitoAuthController],
      providers: [
        { provide: CognitoAuthService, useValue: mockCognitoAuthService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<CognitoAuthController>(CognitoAuthController);
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const registerDto = { email: 'user@example.com', password: 'password' };
      mockCognitoAuthService.signUp.mockResolvedValue({
        message: 'Registration successful',
        email: 'user@example.com',
        userConfirmed: false,
        role: Roles.USER,
      });

      const result = await controller.register(registerDto);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Registration successful');
      expect(result.data.email).toBe('user@example.com');
    });

    it('should throw an error if registration fails', async () => {
        const registerDto = { email: 'user@example.com', password: 'weakpassword' };
        mockCognitoAuthService.signUp.mockRejectedValue(
          new BadRequestException('Invalid data')
        );
      
        try {
          await controller.register(registerDto);
        } catch (e) {
          expect(e.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(e.response.message).toBe('Invalid data');
        }
      });
  });

  describe('login', () => {
    it('should return a token when login is successful', async () => {
      const loginDto = { email: 'user@example.com', password: 'password' };
      mockCognitoAuthService.signIn.mockResolvedValue({
        AccessToken: 'access_token',
        RefreshToken: 'refresh_token',
        ExpiresIn: 3600,
        IdToken: 'id_token',
        role: Roles.USER,
      });

      const result = await controller.login(loginDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Inicio de sesión exitoso');
      expect(result.data.accessToken).toBe('access_token');
    });

    it('should throw an error if login fails', async () => {
        const loginDto = { email: 'user@example.com', password: 'wrongpassword' };
        mockCognitoAuthService.signIn.mockRejectedValue(
          new UnauthorizedException('Invalid credentials')
        );
      
        try {
          await controller.login(loginDto);
        } catch (e) {
          expect(e.response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(e.response.message).toBe('Invalid credentials');
        }
      });
  });

  describe('confirm', () => {
    it('should confirm user registration successfully', async () => {
      const confirmDto = { email: 'user@example.com', code: 'confirmation_code', pin: '1234' };
      mockCognitoAuthService.confirmSignUp.mockResolvedValue({
        message: 'Confirmation successful',
        userConfirmed: true,
      });

      const result = await controller.confirm(confirmDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Confirmation successful');
      expect(result.data.userConfirmed).toBe(true);
    });

    it('should throw an error if refresh fails', async () => {
        const refreshDto = { refreshToken: 'invalid-refresh-token' };
        mockCognitoAuthService.refreshToken.mockRejectedValue(
          new UnauthorizedException('Invalid refresh token')
        );
      
        try {
          await controller.refresh(refreshDto);
        } catch (e) {
          expect(e.response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(e.response.message).toBe('Invalid refresh token');
        }
      });
      
      
  });

  describe('refresh', () => {
    it('should refresh the token successfully', async () => {
      const refreshDto = { refreshToken: 'refresh_token' };
      mockCognitoAuthService.refreshToken.mockResolvedValue({
        accessToken: 'new_access_token',
        idToken: 'new_id_token',
        expiresIn: 3600,
      });

      const result = await controller.refresh(refreshDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Token refrescado exitosamente');
      expect(result.data.accessToken).toBe('new_access_token');
    });

    it('should throw an error if refresh fails', async () => {
        const refreshDto = { refreshToken: 'invalid_refresh_token' };
        mockCognitoAuthService.refreshToken.mockRejectedValue(
          new UnauthorizedException('Invalid refresh token')
        );
      
        try {
          await controller.refresh(refreshDto);
        } catch (e) {
          expect(e.response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(e.response.message).toBe('Invalid refresh token');
        }
      });
  });

  describe('assignRole', () => {
    it('should assign role to a user successfully', async () => {
      const assignRoleDto = { email: 'user@example.com', role: Roles.ADMIN };
      mockPrismaService.user.update.mockResolvedValue({
        email: 'user@example.com',
        role: Roles.ADMIN,
      });

      const result = await controller.assignRole(assignRoleDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Rol ADMIN asignado correctamente al usuario user@example.com');
      expect(result.data.role).toBe(Roles.ADMIN);
    });

    it('should throw an error if user not found', async () => {
      const assignRoleDto = { email: 'nonexistent@example.com', role: Roles.ADMIN };
      mockPrismaService.user.update.mockRejectedValue({ code: 'P2025' });

      try {
        await controller.assignRole(assignRoleDto);
      } catch (e) {
        expect(e.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(e.response.message).toBe('Usuario no encontrado');
      }
    });

    it('should throw an internal error if something goes wrong', async () => {
      const assignRoleDto = { email: 'user@example.com', role: Roles.ADMIN };
      mockPrismaService.user.update.mockRejectedValue(new Error('Unexpected error'));

      try {
        await controller.assignRole(assignRoleDto);
      } catch (e) {
        expect(e.response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(e.response.message).toBe('Error al asignar el rol');
      }
    });
  });

  describe('checkEmail', () => {
    it('should check if email is available', async () => {
      const email = 'user@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await controller.checkEmail(email);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('El email está disponible');
    });

    it('should check if email is already registered', async () => {
      const email = 'user@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue({ email: 'user@example.com' });

      const result = await controller.checkEmail(email);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('El email ya está registrado');
    });
  });
});

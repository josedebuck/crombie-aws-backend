import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { CognitoAuthService } from '../cognito-auth/cognitoAuth.service';
import { LoginAuthDto } from '../cognito-auth/dto/login.dto';
import { RegisterAuthDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let cognitoAuthService: CognitoAuthService;

  const mockCognitoAuthService = {
    signIn: jest.fn(),
    signUp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CognitoAuthService,
          useValue: mockCognitoAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    cognitoAuthService = module.get<CognitoAuthService>(CognitoAuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call signIn with loginDto', async () => {
      const loginDto: LoginAuthDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = { accessToken: 'mockToken' };

      mockCognitoAuthService.signIn.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);
      expect(result).toEqual(mockResponse);
      expect(cognitoAuthService.signIn).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should call signUp with registerDto', async () => {
      const registerDto: RegisterAuthDto = {
        email: 'new@example.com',
        password: 'newpassword123',
        userName: 'newuser',
      };
      const mockResponse = { userSub: 'mockUserId' };

      mockCognitoAuthService.signUp.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);
      expect(result).toEqual(mockResponse);
      expect(cognitoAuthService.signUp).toHaveBeenCalledWith(registerDto);
    });
  });
});

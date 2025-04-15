import { Test, TestingModule } from '@nestjs/testing';
import { CognitoAuthService } from './cognitoAuth.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshDto } from './dto/refresh.dto';

jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
  const actual = jest.requireActual('@aws-sdk/client-cognito-identity-provider');
  return {
    ...actual,
    CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    InitiateAuthCommand: jest.fn(),
  };
});

describe('CognitoAuthService', () => {
  let service: CognitoAuthService;
  let mockCognitoClient: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CognitoAuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const config = {
                AWS_REGION: 'us-east-1',
                COGNITO_USER_POOL_ID: 'fake-pool-id',
                COGNITO_CLIENT_ID: 'fake-client-id',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CognitoAuthService>(CognitoAuthService);
    mockCognitoClient = (service as any).cognitoClient;
  });

  describe('refreshToken', () => {
    it('should return new tokens on successful refresh', async () => {
      const refreshDto: RefreshDto = { refreshToken: 'valid_token' };

      mockCognitoClient.send.mockResolvedValue({
        AuthenticationResult: {
          AccessToken: 'new-access-token',
          IdToken: 'new-id-token',
          ExpiresIn: 3600,
        },
      });

      const result = await service.refreshToken(refreshDto);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        idToken: 'new-id-token',
        expiresIn: 3600,
      });
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      const refreshDto: RefreshDto = { refreshToken: 'invalid_token' };

      const error = new Error('Not authorized');
      (error as any).name = 'NotAuthorizedException';
      mockCognitoClient.send.mockRejectedValue(error);

      await expect(service.refreshToken(refreshDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});

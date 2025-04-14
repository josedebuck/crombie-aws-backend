import { Module } from '@nestjs/common';
import { CognitoAuthService } from './cognitoAuth.service';
import { CognitoAuthController } from './cognitoAuth.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from './cognito-auth.guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule
  ],
  controllers: [CognitoAuthController],
  providers: [
    CognitoAuthService,
    JwtAuthGuard
  ],
  exports: [CognitoAuthService]
})
export class CognitoAuthModule {} 
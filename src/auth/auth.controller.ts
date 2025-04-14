import { Controller, Post, Body } from '@nestjs/common';
import { CognitoAuthService } from 'src/cognito-auth/cognitoAuth.service';
import { LoginAuthDto } from 'src/cognito-auth/dto/login.dto';
import { RegisterAuthDto } from './dto/register.dto';

@Controller('auth')
export class AuthController { 
  constructor(private readonly cognitoAuthService: CognitoAuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginAuthDto) {
    return this.cognitoAuthService.signIn(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterAuthDto) {
    return this.cognitoAuthService.signUp(registerDto);
  }
}
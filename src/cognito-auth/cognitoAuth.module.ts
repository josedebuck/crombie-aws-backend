import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { CognitoAuthService } from "./cognitoAuth.service";
import { CognitoAuthController } from "./cognitoAuth.controller";
import { JwtAuthGuard } from "./cognito-auth.guard";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'supersecret',
            signOptions: { expiresIn: '1h' }
        }),
        PrismaModule,
    ],
    controllers: [CognitoAuthController],
    providers: [
        CognitoAuthService,
        JwtAuthGuard,
    ],
    exports: [
        JwtAuthGuard,
        CognitoAuthService,
    ],
})
export class CognitoAuthModule {}
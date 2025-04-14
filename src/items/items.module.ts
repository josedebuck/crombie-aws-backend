import { Module } from "@nestjs/common";
import { ItemsService } from "./items.service";
import { ItemsController } from "./items.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { CognitoAuthModule } from "src/cognito-auth/cognitoAuth.module";


@Module({
  imports: [PrismaModule, CognitoAuthModule],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
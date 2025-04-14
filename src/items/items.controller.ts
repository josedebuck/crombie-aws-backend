import { Controller, Post, Body, Get, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../cognito-auth/cognito-auth.guard';
import { RolesGuard } from '../custom-decorators/roles.guard';
import { AcceptedRoles } from '../custom-decorators/roles.decorator';
import { Roles } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('User Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@AcceptedRoles(Roles.USER, Roles.ADMIN)
@Controller('items')
export class ItemsController { 
  constructor(private readonly itemsService: ItemsService) {}
  
  @Post('cart')
  @AcceptedRoles(Roles.USER)
  async addToCart(@Req() req, @Body() body: { productId: string; quantity?: number }) {
    return this.itemsService.addToCart(req.user.id, body.productId, body.quantity);
  }

  @Get('cart')
  @AcceptedRoles(Roles.USER)
  async getCart(@Req() req) {
    return this.itemsService.getCart(req.user.id);
  }

  @Delete('cart/:id')
  @AcceptedRoles(Roles.USER)
  async removeCartItem(@Param('id') id: string) {
    return this.itemsService.removeCartItem(id);
  }

  @Post('wishlist')
  @AcceptedRoles(Roles.USER)
  async addToWishlist(@Req() req, @Body() body: { productId: string }) {
    return this.itemsService.addToWishlist(req.user.id, body.productId);
  }

  @Get('wishlist')
  @AcceptedRoles(Roles.USER)
  async getWishlist(@Req() req) {
    return this.itemsService.getWishlist(req.user.id);
  }

  @Delete('wishlist/:id')
  @AcceptedRoles(Roles.USER)
  async removeFromWishlist(@Param('id') id: string) {
    return this.itemsService.removeFromWishlist(id);
  }
}
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Roles } from "@prisma/client";

type SafeUser = {
  id: string;
  email: string;
  username: string;
  role: Roles;
  createdAt: Date;
  updatedAt: Date;
};

type UserWithPassword = SafeUser & { password: string };

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: { email: string; username: string; password: string }): Promise<SafeUser> {
    return this.prisma.user.create({
      data,
      select: this.getSafeUserSelect(),
    });
  }

  async getUserById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.getSafeUserSelect(),
    });
  }

  async getUserByEmail(email: string): Promise<UserWithPassword | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: { ...this.getSafeUserSelect(), password: true },
    });
  }

  async updateUser(id: string, data: { email?: string; username?: string }): Promise<SafeUser> {
    await this.verifyUserExists(id);
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.getSafeUserSelect(),
    });
  }

  async deleteUser(id: string): Promise<{ id: string; email: string }> {
    await this.verifyUserExists(id);
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true },
    });
  }

  private verifyUserExists(id: string): Promise<void> {
    return this.prisma.user.findUnique({ where: { id } })
      .then(user => {
        if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      });
  }

  private getSafeUserSelect() {
    return {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
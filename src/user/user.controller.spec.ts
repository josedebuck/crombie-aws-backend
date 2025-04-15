import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Roles } from '@prisma/client';
import { JwtAuthGuard } from '../cognito-auth/cognito-auth.guard';
import { RolesGuard } from '../custom-decorators/roles.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    role: Roles.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn().mockResolvedValue(mockUser),
            updateUser: jest.fn().mockImplementation((id, data) => {
              if (!data.userName) {
                throw new Error('Invalid data');
              }
              return Promise.resolve(mockUser);
            }),
            deleteUser: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users/:id', () => {
    it('should return a user with valid ID', async () => {
      const result = await controller.getUser('1');
      expect(result).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith('1');
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user with valid data', async () => {
      const updateData = { userName: 'updateduser' };
      const result = await controller.updateUser('1', updateData);
      expect(result).toEqual(mockUser);
      expect(userService.updateUser).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw error with invalid data', async () => {
      const invalidData = { invalidField: 'value' };
      await expect(controller.updateUser('1', invalidData as any)).rejects.toThrow();
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const result = await controller.deleteUser('1');
      expect(result).toEqual({ id: '1', email: 'test@example.com' });
      expect(userService.deleteUser).toHaveBeenCalledWith('1');
    });
  });
});

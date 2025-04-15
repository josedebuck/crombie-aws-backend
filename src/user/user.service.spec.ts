import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Roles } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  // data mockeada
  const mockSafeUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    role: Roles.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithPassword = {
    ...mockSafeUser,
    password: 'hashedpassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockResolvedValue(mockSafeUser),
              findUnique: jest.fn()
                .mockImplementation(({ where }) => {
                  if (where.id === '1') return Promise.resolve(mockSafeUser);
                  if (where.email === 'test@example.com') return Promise.resolve(mockUserWithPassword);
                  return Promise.resolve(null);
                }),
              update: jest.fn().mockResolvedValue(mockSafeUser),
              delete: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user without password in response', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const result = await service.createUser(userData);
      expect(result).toEqual(mockSafeUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
        select: expect.any(Object),
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user without password', async () => {
      const result = await service.getUserById('1');
      expect(result).toEqual(mockSafeUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      const result = await service.getUserById('999');
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user with password', async () => {
      const result = await service.getUserByEmail('test@example.com');
      expect(result).toEqual(mockUserWithPassword);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { ...service['getSafeUserSelect'](), password: true },
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateData = { username: 'updateduser' };
      const result = await service.updateUser('1', updateData);
      expect(result).toEqual(mockSafeUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user doesnt exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.updateUser('999', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return limited fields', async () => {
      const result = await service.deleteUser('1');
      expect(result).toEqual({ id: '1', email: 'test@example.com' });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true, email: true },
      });
    });

    it('should throw NotFoundException if user doesnt exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.deleteUser('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyUserExists', () => {
    it('should not throw if user exists', async () => {
      await expect(service['verifyUserExists']('1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException if user doesnt exist', async () => {
      await expect(service['verifyUserExists']('999')).rejects.toThrow(NotFoundException);
    });
  });
});
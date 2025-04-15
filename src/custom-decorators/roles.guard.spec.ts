import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Roles } from '@prisma/client';

class MockReflector {
  get = jest.fn(); 
  getAll = jest.fn();
  getAllAndMerge = jest.fn();
  getAllAndOverride = jest.fn(); 
}

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: MockReflector;

  beforeEach(() => {
    reflector = new MockReflector();
    rolesGuard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  it('should allow access if no roles are required', () => {
    reflector.get.mockReturnValueOnce([]);
    const context = createMockExecutionContext();
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should allow access if the user has the ADMIN role', () => {
    const requiredRoles: Roles[] = ['ADMIN'];
    reflector.get.mockReturnValueOnce(requiredRoles);
    
    const context = createMockExecutionContext({
      user: { role: 'ADMIN' },
    });

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should allow access if the user has the USER role', () => {
    const requiredRoles: Roles[] = ['USER'];
    reflector.get.mockReturnValueOnce(requiredRoles);
    
    const context = createMockExecutionContext({
      user: { role: 'USER' },
    });

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should deny access if the user does not have one of the required roles', () => {
    const requiredRoles: Roles[] = ['ADMIN'];
    reflector.get.mockReturnValueOnce(requiredRoles);
    
    const context = createMockExecutionContext({
      user: { role: 'USER' },
    });

    expect(rolesGuard.canActivate(context)).toBe(false);
  });

  it('should deny access if no user role is provided', () => {
    const requiredRoles: Roles[] = ['ADMIN', 'USER'];
    reflector.get.mockReturnValueOnce(requiredRoles);
    
    const context = createMockExecutionContext({
      user: {},
    });

    expect(rolesGuard.canActivate(context)).toBe(false);
  });

  it('should allow access if no roles are required and user is not authenticated', () => {
    reflector.get.mockReturnValueOnce([]);
    
    const context = createMockExecutionContext({
      user: null,
    });

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  function createMockExecutionContext(overrides: any = {}) {
    return {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        user: overrides.user || null,
      }),
      getHandler: jest.fn().mockReturnValue(() => {}),
    } as unknown as ExecutionContext;
  }
});
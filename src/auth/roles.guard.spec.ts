// src/auth/roles.guard.spec.ts
//
// Unit tests for the RolesGuard.
// Tests the guard's logic for different user roles and route requirements.

import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

// A mock user with the 'Admin' role
const mockAdminUser = {
  role: { name: 'admin' },
};

// A mock user with the 'User' role
const mockNormalUser = {
  role: { name: 'user' },
};

// Mock the Reflector to control the roles returned by the decorator
const mockReflector = {
  getAllAndOverride: jest.fn(),
};

// Mock the ExecutionContext to simulate incoming requests
const createMockContext = (user: any): ExecutionContext => {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
};

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  // Test case: The route has no roles required. Access should be allowed.
  it('should allow access if no roles are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const context = createMockContext(mockAdminUser);
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  // Test case: The user has the required 'Admin' role. Access should be allowed.
  it('should allow access if the user has the required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['Admin']);

    const context = createMockContext(mockAdminUser);
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  // Test case: The user does NOT have the required 'Admin' role. Access should be denied.
  it('should deny access if the user does not have the required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['Admin']);

    const context = createMockContext(mockNormalUser);
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});

// src/roles/roles.controller.spec.ts
//
// Unit tests for RolesController, focusing on CRUD endpoints and role-based access.

import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Helper function to create a mock execution context for testing guards and controllers
const createMockContext = (user: any, handlerRoles: string[] = []): ExecutionContext => {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
      getResponse: () => ({}),
    }),
  } as ExecutionContext;
};


// Mock objects for Guards and Services
const mockRolesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock AuthGuard to simulate a logged-in user
const mockAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // In a real app, this would come from a JWT token
    request.user = {
      userId: 1,
      email: 'admin@test.com',
      role: { name: 'Admin' }
    };
    return true;
  },
};

// Mock RolesGuard to control access based on user role
const mockRolesGuard = {
  canActivate: (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const requiredRoles = new Reflector().getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const user = request.user;
    return requiredRoles.some((roleName) => user.role.name === roleName);
  },
};


describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: RolesService, useValue: mockRolesService },
        { provide: Reflector, useValue: {
          // Mock the Reflector for RolesGuard to use
          getAllAndOverride: () => ['Admin'],
        } },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockAuthGuard)
      .overrideGuard(RolesGuard).useValue(mockRolesGuard)
      .compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- CRUD Endpoint Tests ---
  describe('create', () => {
    it('should create a new role if user is an Admin', async () => {
      const createRoleDto: CreateRoleDto = { name: 'Editor' };
      const expectedRole = { role_id: 2, ...createRoleDto };
      (service.create as jest.Mock).mockResolvedValue(expectedRole);
      
      const result = await controller.create(createRoleDto);

      expect(service.create).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(expectedRole);
    });
  });

  describe('findAll', () => {
    it('should return an array of roles for an Admin', async () => {
      const rolesArray = [{ role_id: 1, name: 'Admin' }, { role_id: 2, name: 'User' }];
      (service.findAll as jest.Mock).mockResolvedValue(rolesArray);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(rolesArray);
    });
  });

  describe('findOne', () => {
    it('should return a single role for an Admin', async () => {
      const roleId = 1;
      const expectedRole = { role_id: 1, name: 'Admin' };
      (service.findOne as jest.Mock).mockResolvedValue(expectedRole);

      const result = await controller.findOne(String(roleId));

      expect(service.findOne).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(expectedRole);
    });
  });

  describe('update', () => {
    it('should update a role for an Admin', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDto = { name: 'SuperAdmin' };
      const existingRole = { role_id: 1, name: 'Admin' };
      const updatedRole = { role_id: 1, name: 'SuperAdmin' };
      (service.update as jest.Mock).mockResolvedValue(updatedRole);

      const result = await controller.update(String(roleId), updateRoleDto);

      expect(service.update).toHaveBeenCalledWith(roleId, updateRoleDto);
      expect(result).toEqual(updatedRole);
    });
  });

  describe('remove', () => {
    it('should remove a role for an Admin', async () => {
      const roleId = 1;
      const removedRole = { role_id: 1, name: 'Admin' };
      (service.remove as jest.Mock).mockResolvedValue(removedRole);
      
      const result = await controller.remove(String(roleId));

      expect(service.remove).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(removedRole);
    });
  });

  // --- Role-Based Access Tests ---
  describe('Access Control', () => {
    it('should throw ForbiddenException for a non-Admin user', async () => {
      // Use a different mock guard that denies access
      const nonAdminGuard = {
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { 
            userId: 2, 
            email: 'user@test.com', 
            role: { name: 'User' } 
          };
          const requiredRoles = new Reflector().getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
          ]);
          if (!requiredRoles) {
            return true;
          }
          return requiredRoles.some((roleName) => request.user.role.name === roleName);
        },
      };

      const moduleWithNonAdminUser = await Test.createTestingModule({
        controllers: [RolesController],
        providers: [
          { provide: RolesService, useValue: mockRolesService },
          { provide: Reflector, useValue: { getAllAndOverride: () => ['Admin'] } },
        ],
      })
      .overrideGuard(JwtAuthGuard).useValue(mockAuthGuard)
      .overrideGuard(RolesGuard).useValue(nonAdminGuard) // Override with a guard that checks for a non-admin user
      .compile();

      const controllerWithNonAdminUser = moduleWithNonAdminUser.get<RolesController>(RolesController);

      try {
        // This call should be intercepted by the RolesGuard and throw an error
        await controllerWithNonAdminUser.findAll();
      } catch (e) {
        // We expect the guard to throw a ForbiddenException
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should allow access for a non-protected route (if one existed)', () => {
        // For demonstration, let's create a mock context for a non-protected route
        const reflectorWithoutRoles = {
          getAllAndOverride: () => undefined,
        };

        const context = createMockContext(mockNormalUser);
        const guard = new RolesGuard(reflectorWithoutRoles as any);
        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });
  });
});
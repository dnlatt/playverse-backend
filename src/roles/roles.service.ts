// Unit tests for RolesService, testing database interactions.

import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const mockPrismaService = {
  roles: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('RolesService', () => {
  let service: RolesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- CRUD Service Tests ---
  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = { name: 'Tester' };
      const expectedRole = { role_id: 3, ...createRoleDto };
      (prisma.roles.create as jest.Mock).mockResolvedValue(expectedRole);

      const result = await service.create(createRoleDto);

      expect(prisma.roles.create).toHaveBeenCalledWith({ data: createRoleDto });
      expect(result).toEqual(expectedRole);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const rolesArray = [{ role_id: 1, name: 'Admin' }, { role_id: 2, name: 'User' }];
      (prisma.roles.findMany as jest.Mock).mockResolvedValue(rolesArray);

      const result = await service.findAll();

      expect(prisma.roles.findMany).toHaveBeenCalled();
      expect(result).toEqual(rolesArray);
    });
  });

  describe('findOne', () => {
    it('should return a single role by ID', async () => {
      const roleId = 1;
      const expectedRole = { role_id: 1, name: 'Admin' };
      (prisma.roles.findUnique as jest.Mock).mockResolvedValue(expectedRole);

      const result = await service.findOne(roleId);

      expect(prisma.roles.findUnique).toHaveBeenCalledWith({ where: { role_id: roleId } });
      expect(result).toEqual(expectedRole);
    });

    it('should throw NotFoundException if role is not found', async () => {
      const roleId = 99;
      (prisma.roles.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(roleId)).rejects.toThrow(NotFoundException);
      expect(prisma.roles.findUnique).toHaveBeenCalledWith({ where: { role_id: roleId } });
    });
  });

  describe('update', () => {
    it('should update a role by ID', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDto = { name: 'SuperAdmin' };
      const existingRole = { role_id: 1, name: 'Admin' };
      const updatedRole = { role_id: 1, name: 'SuperAdmin' };
      (prisma.roles.findUnique as jest.Mock).mockResolvedValue(existingRole);
      (prisma.roles.update as jest.Mock).mockResolvedValue(updatedRole);
      
      const result = await service.update(roleId, updateRoleDto);

      expect(prisma.roles.update).toHaveBeenCalledWith({ where: { role_id: roleId }, data: updateRoleDto });
      expect(result).toEqual(updatedRole);
    });
  });

  describe('remove', () => {
    it('should delete a role by ID', async () => {
      const roleId = 1;
      const existingRole = { role_id: 1, name: 'Admin' };
      (prisma.roles.findUnique as jest.Mock).mockResolvedValue(existingRole);
      (prisma.roles.delete as jest.Mock).mockResolvedValue(existingRole);
      
      const result = await service.remove(roleId);

      expect(prisma.roles.delete).toHaveBeenCalledWith({ where: { role_id: roleId } });
      expect(result).toEqual(existingRole);
    });
  });
});

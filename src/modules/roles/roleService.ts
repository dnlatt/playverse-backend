// src/modules/roles/roleService.ts
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createRoleSchema, updateRoleSchema } from './roleValidation';

const prisma = new PrismaClient();

// Service to find all roles.
export const findRoles = async () => {
  return await prisma.roles.findMany();
};

// Service to find a single role by ID.
export const findRoleById = async (role_id: number) => {
  return await prisma.roles.findUnique({
    where: { role_id },
  });
};

// Service to create a new role.
export const createRole = async (data: z.infer<typeof createRoleSchema>) => {
  return await prisma.roles.create({
    data,
  });
};

// Service to update an existing role.
export const updateRole = async (role_id: number, data: z.infer<typeof updateRoleSchema>) => {
  return await prisma.roles.update({
    where: { role_id },
    data,
  });
};

// Service to delete a role.
export const deleteRole = async (role_id: number) => {
  return await prisma.roles.delete({
    where: { role_id },
  });
};

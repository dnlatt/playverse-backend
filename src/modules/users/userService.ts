// src/modules/users/userService.ts
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { createUserSchema, updateUserSchema } from './userValidation';
import { roleConfig } from '../../config/rolesConfig';

const prisma = new PrismaClient();
const saltRounds = 10;

// Service to find all users.
export const findUsers = async () => {
  return await prisma.users.findMany({
    select: { user_id: true, name: true, email: true, role_id: true, address: true, phone_number: true },
  });
};

// Service to find a single user by ID.
export const findUserById = async (user_id: number) => {
  return await prisma.users.findUnique({
    where: { user_id },
    select: { user_id: true, name: true, email: true, role_id: true, address: true, phone_number: true },
  });
};

// Service to create a new user.
export const createUser = async (data: z.infer<typeof createUserSchema>) => {
  const { password, ...rest } = data;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);
  return await prisma.users.create({
    data: {
      ...rest,
      password_hash: hashedPassword,
      role_id: roleConfig.roles.user,
    },
    select: { user_id: true, name: true, email: true, role_id: true, address: true, phone_number: true },
  });
};

// Service to update an existing user.
export const updateUser = async (user_id: number, data: z.infer<typeof updateUserSchema>) => {
  const updatedData: any = { ...data };
  if (data.password) {
    updatedData.password_hash = await bcrypt.hash(data.password, saltRounds);
    delete updatedData.password;
  }
  return await prisma.users.update({
    where: { user_id },
    data: updatedData,
    select: { user_id: true, name: true, email: true, role_id: true, address: true, phone_number: true },
  });
};

// Service to delete a user.
export const deleteUser = async (user_id: number) => {
  return await prisma.users.delete({
    where: { user_id },
  });
};

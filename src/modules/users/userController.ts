// src/modules/users/userController.ts
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as userService from './userService';
import { createUserSchema, updateUserSchema } from './userValidation';

// Controller to get all users.
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.findUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Controller to get a single user by ID.
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const user = await userService.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Controller to create a new user.
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const newUser = await userService.createUser(validatedData);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
};

// Controller to update an existing user by ID.
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const validatedData = updateUserSchema.parse(req.body);
    const updatedUser = await userService.updateUser(userId, validatedData);
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  }
};

// Controller to delete a user by ID.
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    await userService.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
};

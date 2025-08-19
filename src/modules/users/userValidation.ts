// src/modules/users/userValidation.ts
import { z } from 'zod';

// Schema to validate data for creating a new user.
export const createUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters long' }),
  phone_number: z.string().min(8, { message: 'Phone number must be at least 8 digits long' }),
});

// Schema to validate data for updating an existing user. All fields are optional.
export const updateUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .optional(),
  address: z.string().min(5, { message: 'Address must be at least 5 characters long' }).optional(),
  phone_number: z.string().min(8, { message: 'Phone number must be at least 8 digits long' }).optional(),
  role_id: z.number().int().optional(),
});

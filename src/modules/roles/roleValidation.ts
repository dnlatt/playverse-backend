// src/modules/roles/roleValidation.ts
import { z } from 'zod';

// Schema to validate data for creating a new role.
export const createRoleSchema = z.object({
  name: z.string().min(2, { message: 'Role name must be at least 2 characters long' }),
});

// Schema to validate data for updating an existing role.
export const updateRoleSchema = z.object({
  name: z.string().min(2, { message: 'Role name must be at least 2 characters long' }).optional(),
});

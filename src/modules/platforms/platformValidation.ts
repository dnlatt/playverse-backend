import { z } from 'zod';

// Zod schema for creating a new platform.
// Only the 'name' is required, as the slug is generated automatically.
export const createPlatformSchema = z.object({
  name: z.string().min(2, { message: 'Platform name must be at least 2 characters long' }),
});

// Zod schema for updating a platform.
// All fields are optional since they can be partially updated.
export const updatePlatformSchema = z.object({
  name: z.string().min(2, { message: 'Platform name must be at least 2 characters long' }).optional(),
});

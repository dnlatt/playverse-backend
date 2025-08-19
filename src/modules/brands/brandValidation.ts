// src/modules/brands/brandValidation.ts
import { z } from 'zod';

// Zod schema for creating a new brand.
// Only the 'name' is required, as the slug is generated automatically.
export const createBrandSchema = z.object({
  name: z.string().min(2, { message: 'Brand name must be at least 2 characters long' }),
});

// Zod schema for updating a brand.
// All fields are optional since they can be partially updated.
export const updateBrandSchema = z.object({
  name: z.string().min(2, { message: 'Brand name must be at least 2 characters long' }).optional(),
});

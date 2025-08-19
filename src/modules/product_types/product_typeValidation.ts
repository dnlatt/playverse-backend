// src/modules/product_types/product_typeValidation.ts
import { z } from 'zod';

// Zod schema for creating a new product type.
export const createProductTypeSchema = z.object({
  name: z.string().min(2, { message: 'Product type name must be at least 2 characters long' }),
  brand_id: z.number().int().optional(),
});

// Zod schema for updating a product type.
// All fields are optional since they can be partially updated.
export const updateProductTypeSchema = z.object({
  name: z.string().min(2, { message: 'Product type name must be at least 2 characters long' }).optional(),
  brand_id: z.number().int().optional(),
});
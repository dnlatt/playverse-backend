// src/modules/product_images/product_imageValidation.ts
import { z } from 'zod';

// Zod schema for creating a new product image.
export const createProductImageSchema = z.object({
  product_id: z.number().int(),
  image_url: z.string().url({ message: 'Invalid URL format' }),
});

// Zod schema for updating a product image.
// All fields are optional since they can be partially updated.
export const updateProductImageSchema = z.object({
  product_id: z.number().int().optional(),
  image_url: z.string().url({ message: 'Invalid URL format' }).optional(),
});

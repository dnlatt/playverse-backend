// src/modules/products/productValidation.ts
import { z } from 'zod';

// Zod schema for creating a new product.
export const createProductSchema = z.object({
  product_type_id: z.number().int(),
  brand_id: z.number().int().optional(),
  platform_id: z.number().int().optional(),
  name: z.string().min(2, { message: 'Product name must be at least 2 characters long' }),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters long' }),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  stock: z.number().int().min(0, { message: 'Stock cannot be negative' }).default(0),
  released_date: z.string().datetime().optional(),
  status: z.enum(['instock', 'outstock', 'preorder']).default('instock'),
});

// Zod schema for updating a product.
// All fields are optional since they can be partially updated.
export const updateProductSchema = z.object({
  product_type_id: z.number().int().optional(),
  brand_id: z.number().int().optional(),
  platform_id: z.number().int().optional(),
  name: z.string().min(2, { message: 'Product name must be at least 2 characters long' }).optional(),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters long' }).optional(),
  price: z.number().positive({ message: 'Price must be a positive number' }).optional(),
  stock: z.number().int().min(0, { message: 'Stock cannot be negative' }).optional(),
  released_date: z.string().datetime().optional(),
  status: z.enum(['instock', 'outstock', 'preorder']).optional(),
});

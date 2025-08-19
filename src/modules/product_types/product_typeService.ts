// src/modules/product_types/product_typeService.ts
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createProductTypeSchema, updateProductTypeSchema } from './product_typeValidation';

const prisma = new PrismaClient();

// Service to find all product types.
export const findProductTypes = async () => {
  return await prisma.product_types.findMany();
};

// Service to find a single product type by its ID.
export const findProductTypeById = async (product_type_id: number) => {
  return await prisma.product_types.findUnique({
    where: { product_type_id },
  });
};

// Service to create a new product type.
export const createProductType = async (data: z.infer<typeof createProductTypeSchema>) => {
  return await prisma.product_types.create({
    data,
  });
};

// Service to update an existing product type by ID.
export const updateProductType = async (product_type_id: number, data: z.infer<typeof updateProductTypeSchema>) => {
  return await prisma.product_types.update({
    where: { product_type_id },
    data,
  });
};

// Service to delete a product type by ID.
export const deleteProductType = async (product_type_id: number) => {
  return await prisma.product_types.delete({
    where: { product_type_id },
  });
};

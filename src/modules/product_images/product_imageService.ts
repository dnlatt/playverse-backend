// src/modules/product_images/product_imageService.ts
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createProductImageSchema, updateProductImageSchema } from './product_imageValidation';

const prisma = new PrismaClient();

// Service to find all product images.
export const findProductImages = async () => {
  return await prisma.product_images.findMany();
};

// Service to find a single product image by its ID.
export const findProductImageById = async (image_id: number) => {
  return await prisma.product_images.findUnique({
    where: { image_id },
  });
};

// Service to create a new product image.
export const createProductImage = async (data: z.infer<typeof createProductImageSchema>) => {
  return await prisma.product_images.create({
    data,
  });
};

// Service to update an existing product image by ID.
export const updateProductImage = async (image_id: number, data: z.infer<typeof updateProductImageSchema>) => {
  return await prisma.product_images.update({
    where: { image_id },
    data,
  });
};

// Service to delete a product image by ID.
export const deleteProductImage = async (image_id: number) => {
  return await prisma.product_images.delete({
    where: { image_id },
  });
};
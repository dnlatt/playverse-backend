// src/modules/brands/brandService.ts
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createBrandSchema, updateBrandSchema } from './brandValidation';

const prisma = new PrismaClient();

// Helper function to generate a URL-friendly slug from a string.
// Removes special characters and replaces spaces/underscores with hyphens.
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .trim();
};

// Service to find all brands.
export const findBrands = async () => {
  return await prisma.brands.findMany();
};

// Service to find a single brand by its slug.
export const findBrandBySlug = async (slug: string) => {
  return await prisma.brands.findUnique({
    where: { slug },
  });
};

// Service to find a single brand by its ID.
export const findBrandById = async (brand_id: number) => {
  return await prisma.brands.findUnique({
    where: { brand_id },
  });
};

// Service to create a new brand.
export const createBrand = async (data: z.infer<typeof createBrandSchema>) => {
  const newSlug = createSlug(data.name);
  return await prisma.brands.create({
    data: {
      name: data.name,
      slug: newSlug,
    },
  });
};

// Service to update an existing brand by ID.
export const updateBrand = async (brand_id: number, data: z.infer<typeof updateBrandSchema>) => {
  const updatedData: { name?: string; slug?: string } = {};

  if (data.name) {
    updatedData.name = data.name;
    updatedData.slug = createSlug(data.name);
  }

  return await prisma.brands.update({
    where: { brand_id },
    data: updatedData,
  });
};

// Service to delete a brand by ID.
export const deleteBrand = async (brand_id: number) => {
  return await prisma.brands.delete({
    where: { brand_id },
  });
};

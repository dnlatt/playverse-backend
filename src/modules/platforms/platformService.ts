import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createPlatformSchema, updatePlatformSchema } from './platformValidation';

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

// Service to find all platforms.
export const findPlatforms = async () => {
  return await prisma.platforms.findMany();
};

// Service to find a single platform by its slug.
export const findPlatformBySlug = async (slug: string) => {
  return await prisma.platforms.findUnique({
    where: { slug },
  });
};

// Service to find a single platform by its ID.
export const findPlatformById = async (platform_id: number) => {
  return await prisma.platforms.findUnique({
    where: { platform_id },
  });
};

// Service to create a new platform.
export const createPlatform = async (data: z.infer<typeof createPlatformSchema>) => {
  const newSlug = createSlug(data.name);
  return await prisma.platforms.create({
    data: {
      name: data.name,
      slug: newSlug,
    },
  });
};

// Service to update an existing platform by ID.
export const updatePlatform = async (platform_id: number, data: z.infer<typeof updatePlatformSchema>) => {
  const updatedData: { name?: string; slug?: string } = {};

  if (data.name) {
    updatedData.name = data.name;
    updatedData.slug = createSlug(data.name);
  }

  return await prisma.platforms.update({
    where: { platform_id },
    data: updatedData,
  });
};

// Service to delete a platform by ID.
export const deletePlatform = async (platform_id: number) => {
  return await prisma.platforms.delete({
    where: { platform_id },
  });
};

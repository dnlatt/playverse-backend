// src/modules/products/productService.ts
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createProductSchema, updateProductSchema } from './productValidation';

const prisma = new PrismaClient();

// Helper function to generate a URL-friendly slug from a string.
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .trim();
};

// Service to find all products with public access, including search and pagination.
export const findPublicProducts = async (
  status?: string,
  search?: string,
  limit: number = 10,
  offset: number = 0,
) => {
  let whereClause: any = {
    OR: [
      { status: 'instock' },
      { status: 'preorder' },
    ],
  };

  if (status) {
    whereClause.OR = [{ status }];
  }

  if (search) {
    whereClause = {
      ...whereClause,
      name: { contains: search, mode: 'insensitive' },
    };
  }
  
  const [products, count] = await prisma.$transaction([
    prisma.products.findMany({
      where: whereClause,
      include: { product_images: true },
      take: limit,
      skip: offset,
    }),
    prisma.products.count({ where: whereClause }),
  ]);

  return {
    products: products.map(product => ({
      ...product,
      price: product.price.toNumber(),
    })),
    totalCount: count,
  };
};

// Service to find all products for admin access.
export const findAdminProducts = async () => {
  const products = await prisma.products.findMany();
  return products.map(product => ({
    ...product,
    price: product.price.toNumber(),
  }));
};

// Service to find a single product by its slug (public access).
export const findProductBySlug = async (slug: string) => {
  const product = await prisma.products.findUnique({
    where: { slug, status: 'instock' },
    include: { product_images: true }, // Include related product images.
  });
  if (product) {
    return { ...product, price: product.price.toNumber() };
  }
  return null;
};

// Service to find a single product by its ID (admin access).
export const findProductById = async (product_id: number) => {
  const product = await prisma.products.findUnique({
    where: { product_id },
    include: { product_images: true }, // Include related product images.
  });
  if (product) {
    return { ...product, price: product.price.toNumber() };
  }
  return null;
};

// Service to create a new product.
export const createProduct = async (data: z.infer<typeof createProductSchema>) => {
  const newSlug = createSlug(data.name);
  const newProduct = await prisma.products.create({
    data: {
      ...data,
      slug: newSlug,
      price: data.price as any,
      released_date: data.released_date ? new Date(data.released_date) : null,
    },
    include: { product_images: true },
  });
  return { ...newProduct, price: newProduct.price.toNumber() };
};

// Service to update an existing product by ID.
export const updateProduct = async (product_id: number, data: z.infer<typeof updateProductSchema>) => {
  const updatedData: any = { ...data };
  if (data.name) {
    updatedData.slug = createSlug(data.name);
  }
  if (data.price) {
    updatedData.price = data.price as any;
  }
  if (data.released_date) {
    updatedData.released_date = new Date(data.released_date);
  }
  const updatedProduct = await prisma.products.update({
    where: { product_id },
    data: updatedData,
    include: { product_images: true },
  });
  return { ...updatedProduct, price: updatedProduct.price.toNumber() };
};

// Service to delete a product by ID.
export const deleteProduct = async (product_id: number) => {
  return await prisma.products.delete({
    where: { product_id },
  });
};
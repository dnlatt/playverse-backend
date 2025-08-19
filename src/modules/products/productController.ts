// src/modules/products/productController.ts
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as productService from './productService';
import { createProductSchema, updateProductSchema } from './productValidation';

// Controller to get all products (public access).
export const getPublicProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const search = req.query.search as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // The service now returns an object with 'products' and 'totalCount'.
    const { products, totalCount } = await productService.findPublicProducts(status, search, limit, offset);
    res.json({ products, totalCount });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Controller to get all products for admin access.
export const getAdminProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.findAdminProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Controller to get a single product by slug (public access).
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.findProductBySlug(req.params.slug);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Controller to get a single product by ID (admin access).
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const product = await productService.findProductById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Controller to create a new product (admin only).
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const newProduct = await productService.createProduct(validatedData);
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Product SKU or slug already exists' });
    } else {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
};

// Controller to update an existing product by ID (admin only).
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const validatedData = updateProductSchema.parse(req.body);
    const updatedProduct = await productService.updateProduct(productId, validatedData);
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else {
      console.error('Error updating product:', error);
      res.status(404).json({ error: 'Product not found' });
    }
  }
};

// Controller to delete a product by ID (admin only).
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId, 10);
    await productService.deleteProduct(productId);
    res.status(204).send(); // No content on successful deletion.
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(404).json({ error: 'Product not found' });
  }
};

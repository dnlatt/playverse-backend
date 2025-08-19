// src/modules/product_images/product_imageController.ts
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as productImageService from './product_imageService';
import { createProductImageSchema, updateProductImageSchema } from './product_imageValidation';

// Controller to get all product images (public access).
export const getProductImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const productImages = await productImageService.findProductImages();
    res.json(productImages);
  } catch (error) {
    console.error('Error fetching product images:', error);
    res.status(500).json({ error: 'Failed to fetch product images' });
  }
};

// Controller to get a single product image by ID (public access).
export const getProductImageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageId = parseInt(req.params.imageId, 10);
    const productImage = await productImageService.findProductImageById(imageId);
    if (!productImage) {
      res.status(404).json({ error: 'Product image not found' });
      return;
    }
    res.json(productImage);
  } catch (error) {
    console.error('Error fetching product image by ID:', error);
    res.status(500).json({ error: 'Failed to fetch product image' });
  }
};

// Controller to create a new product image (admin only).
export const createProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createProductImageSchema.parse(req.body);
    const newProductImage = await productImageService.createProductImage(validatedData);
    res.status(201).json({ message: 'Product image created successfully', product_image: newProductImage });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
      res.status(400).json({ error: 'Invalid product_id' });
    } else {
      console.error('Error creating product image:', error);
      res.status(500).json({ error: 'Failed to create product image' });
    }
  }
};

// Controller to update an existing product image by ID (admin only).
export const updateProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageId = parseInt(req.params.imageId, 10);
    const validatedData = updateProductImageSchema.parse(req.body);
    const updatedProductImage = await productImageService.updateProductImage(imageId, validatedData);
    res.json({ message: 'Product image updated successfully', product_image: updatedProductImage });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else {
      console.error('Error updating product image:', error);
      res.status(404).json({ error: 'Product image not found' });
    }
  }
};

// Controller to delete a product image by ID (admin only).
export const deleteProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageId = parseInt(req.params.imageId, 10);
    await productImageService.deleteProductImage(imageId);
    res.status(204).send(); // No content on successful deletion.
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(404).json({ error: 'Product image not found' });
  }
};
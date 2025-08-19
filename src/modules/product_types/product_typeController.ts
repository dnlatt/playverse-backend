// src/modules/product_types/product_typeController.ts
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as productTypeService from './product_typeService';
import { createProductTypeSchema, updateProductTypeSchema } from './product_typeValidation';

// Controller to get all product types (public access).
export const getProductTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const productTypes = await productTypeService.findProductTypes();
    res.json(productTypes);
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({ error: 'Failed to fetch product types' });
  }
};

// Controller to get a single product type by ID (public access).
export const getProductTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const productTypeId = parseInt(req.params.productTypeId, 10);
    const productType = await productTypeService.findProductTypeById(productTypeId);
    if (!productType) {
      res.status(404).json({ error: 'Product type not found' });
      return;
    }
    res.json(productType);
  } catch (error) {
    console.error('Error fetching product type by ID:', error);
    res.status(500).json({ error: 'Failed to fetch product type' });
  }
};

// Controller to create a new product type (admin only).
export const createProductType = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createProductTypeSchema.parse(req.body);
    const newProductType = await productTypeService.createProductType(validatedData);
    res.status(201).json({ message: 'Product type created successfully', product_type: newProductType });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
      res.status(400).json({ error: 'Invalid brand_id' });
    } else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Product type name already exists' });
    } else {
      console.error('Error creating product type:', error);
      res.status(500).json({ error: 'Failed to create product type' });
    }
  }
};

// Controller to update an existing product type by ID (admin only).
export const updateProductType = async (req: Request, res: Response): Promise<void> => {
  try {
    const productTypeId = parseInt(req.params.productTypeId, 10);
    const validatedData = updateProductTypeSchema.parse(req.body);
    const updatedProductType = await productTypeService.updateProductType(productTypeId, validatedData);
    res.json({ message: 'Product type updated successfully', product_type: updatedProductType });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else {
      console.error('Error updating product type:', error);
      res.status(404).json({ error: 'Product type not found' });
    }
  }
};

// Controller to delete a product type by ID (admin only).
export const deleteProductType = async (req: Request, res: Response): Promise<void> => {
  try {
    const productTypeId = parseInt(req.params.productTypeId, 10);
    await productTypeService.deleteProductType(productTypeId);
    res.status(204).send(); // No content on successful deletion.
  } catch (error) {
    console.error('Error deleting product type:', error);
    res.status(404).json({ error: 'Product type not found' });
  }
};

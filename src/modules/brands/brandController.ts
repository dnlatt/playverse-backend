// src/modules/brands/brandController.ts
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as brandService from './brandService';
import { createBrandSchema, updateBrandSchema } from './brandValidation';

// Controller to get all brands (public access).
export const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await brandService.findBrands();
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
};

// Controller to get a single brand by slug (public access).
export const getBrandBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await brandService.findBrandBySlug(req.params.slug);
    if (!brand) {
      res.status(404).json({ error: 'Brand not found' });
      return;
    }
    res.json(brand);
  } catch (error) {
    console.error('Error fetching brand by slug:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
};

// Controller to create a new brand (admin only).
export const createBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createBrandSchema.parse(req.body);
    const newBrand = await brandService.createBrand(validatedData);
    res.status(201).json({ message: 'Brand created successfully', brand: newBrand });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Brand name or slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create brand' });
    }
  }
};

// Controller to update an existing brand by ID (admin only).
export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brandId = parseInt(req.params.brandId, 10);
    const validatedData = updateBrandSchema.parse(req.body);
    const updatedBrand = await brandService.updateBrand(brandId, validatedData);
    res.json({ message: 'Brand updated successfully', brand: updatedBrand });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else {
      res.status(404).json({ error: 'Brand not found' });
    }
  }
};

// Controller to delete a brand by ID (admin only).
export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brandId = parseInt(req.params.brandId, 10);
    await brandService.deleteBrand(brandId);
    res.status(204).send(); // No content on successful deletion.
  } catch (error) {
    res.status(404).json({ error: 'Brand not found' });
  }
};

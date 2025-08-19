import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as platformService from './platformService';
import { createPlatformSchema, updatePlatformSchema } from './platformValidation';

// Controller to get all platforms (public access).
export const getPlatforms = async (req: Request, res: Response): Promise<void> => {
  try {
    const platforms = await platformService.findPlatforms();
    res.json(platforms);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
};

// Controller to get a single platform by slug (public access).
export const getPlatformBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const platform = await platformService.findPlatformBySlug(req.params.slug);
    if (!platform) {
      res.status(404).json({ error: 'Platform not found' });
      return;
    }
    res.json(platform);
  } catch (error) {
    console.error('Error fetching platform by slug:', error);
    res.status(500).json({ error: 'Failed to fetch platform' });
  }
};

// Controller to create a new platform (admin only).
export const createPlatform = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createPlatformSchema.parse(req.body);
    const newPlatform = await platformService.createPlatform(validatedData);
    res.status(201).json({ message: 'Platform created successfully', platform: newPlatform });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Platform name or slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create platform' });
    }
  }
};

// Controller to update an existing platform by ID (admin only).
export const updatePlatform = async (req: Request, res: Response): Promise<void> => {
  try {
    const platformId = parseInt(req.params.platformId, 10);
    const validatedData = updatePlatformSchema.parse(req.body);
    const updatedPlatform = await platformService.updatePlatform(platformId, validatedData);
    res.json({ message: 'Platform updated successfully', platform: updatedPlatform });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else {
      res.status(404).json({ error: 'Platform not found' });
    }
  }
};

// Controller to delete a platform by ID (admin only).
export const deletePlatform = async (req: Request, res: Response): Promise<void> => {
  try {
    const platformId = parseInt(req.params.platformId, 10);
    await platformService.deletePlatform(platformId);
    res.status(204).send(); // No content on successful deletion.
  } catch (error) {
    res.status(404).json({ error: 'Platform not found' });
  }
};

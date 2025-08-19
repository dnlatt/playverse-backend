// src/modules/product_images/product_imageRoutes.ts
import { Router } from 'express';
import { getProductImages, getProductImageById, createProductImage, updateProductImage, deleteProductImage } from './product_imageController';
import { protect, authorize } from '../../middlewares/authMiddleware';
import { config } from '../../config';

const ADMIN_ID = parseInt(config.ADMIN_ID, 10) || 1;

const router = Router();

// --- Admin-only Routes ---
// These routes require a valid token and the admin role.
router.post('/', protect, authorize(ADMIN_ID), createProductImage);
router.patch('/:imageId', protect, authorize(ADMIN_ID), updateProductImage);
router.delete('/:imageId', protect, authorize(ADMIN_ID), deleteProductImage);

// --- Public Routes ---
// Get all product images
router.get('/', getProductImages);
// Get a single product image by ID
router.get('/:imageId', getProductImageById);

export default router;
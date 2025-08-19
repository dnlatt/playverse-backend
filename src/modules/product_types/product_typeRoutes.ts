// src/modules/product_types/product_typeRoutes.ts
import { Router } from 'express';
import { getProductTypes, getProductTypeById, createProductType, updateProductType, deleteProductType } from './product_typeController';
import { protect, authorize } from '../../middlewares/authMiddleware';
import { config } from '../../config';

const ADMIN_ID = parseInt(config.ADMIN_ID, 10) || 1;

const router = Router();

// --- Admin-only Routes ---
// These routes require a valid token and the admin role.
router.post('/', protect, authorize(ADMIN_ID), createProductType);
router.patch('/:productTypeId', protect, authorize(ADMIN_ID), updateProductType);
router.delete('/:productTypeId', protect, authorize(ADMIN_ID), deleteProductType);

// --- Public Routes ---
// Get all product types
router.get('/', getProductTypes);
// Get a single product type by ID
router.get('/:productTypeId', getProductTypeById);

export default router;

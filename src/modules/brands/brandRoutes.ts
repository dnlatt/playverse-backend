// src/modules/brands/brandRoutes.ts
import { Router } from 'express';
import { getBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand } from './brandController';
import { protect, authorize } from '../../middlewares/authMiddleware';
import { config } from '../../config';

const ADMIN_ID = parseInt(config.ADMIN_ID, 10) || 1;

const router = Router();


// --- Admin-only Routes ---

router.post('/', protect, authorize(ADMIN_ID), createBrand);
router.patch('/:brandId', protect, authorize(ADMIN_ID), updateBrand);
router.delete('/:brandId', protect, authorize(ADMIN_ID), deleteBrand);

// --- Public Routes ---

// Get all brands
router.get('/', getBrands);
// Get a single brand by slug
router.get('/:slug', getBrandBySlug);

export default router;

// src/modules/products/productRoutes.ts
import { Router } from 'express';
import { getPublicProducts, getProductBySlug, getProductById, createProduct, updateProduct, deleteProduct } from './productController';
import { protect, authorize } from '../../middlewares/authMiddleware';
import { config } from '../../config';

const ADMIN_ID = parseInt(config.ADMIN_ID, 10) || 1;

const router = Router();

// --- Admin-only Routes ---
// These routes require a valid token and the admin role.
router.post('/', protect, authorize(ADMIN_ID), createProduct);
router.patch('/:productId', protect, authorize(ADMIN_ID), updateProduct);
router.delete('/:productId', protect,authorize(ADMIN_ID), deleteProduct);

// --- Public Routes ---
// Get all products 
router.get('/', getPublicProducts);
// Get a single product by slug.
router.get('/:slug', getProductBySlug);
router.get('/:productId', getProductById);

export default router;

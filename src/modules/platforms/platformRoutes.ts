// src/modules/platforms/platformRoutes.ts
import { Router } from 'express';
import { getPlatforms, getPlatformBySlug, createPlatform, updatePlatform, deletePlatform } from './platformController';
import { protect, authorize } from '../../middlewares/authMiddleware';
import { config } from '../../config';

const ADMIN_ID = parseInt(config.ADMIN_ID, 10) || 1;

const router = Router();

// --- Public Routes ---
// Get all platforms
router.get('/', getPlatforms);
// Get a single platform by slug
router.get('/:slug', getPlatformBySlug);

// --- Admin-only Routes ---
// All these routes require a valid token and the admin role.
router.post('/', protect, authorize(ADMIN_ID), createPlatform);
router.patch('/:platformId', protect, authorize(ADMIN_ID), updatePlatform);
router.delete('/:platformId', protect, authorize(ADMIN_ID), deletePlatform);

export default router;

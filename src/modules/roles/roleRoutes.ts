// src/modules/roles/roleRoutes.ts
import { Router } from 'express';
import { createRole, getRoles, updateRole, deleteRole, getRoleById } from './roleController';
import { protect, authorize } from '../../middlewares/authMiddleware';
import { config } from '../../config';

const ADMIN_ID = parseInt(config.ADMIN_ID, 10) || 1;

const router = Router();

// --- Admin-only Routes ---
// These routes require a valid token and the admin role.
router.get('/', protect, authorize(ADMIN_ID), getRoles);
router.get('/:roleId', protect, authorize(ADMIN_ID), getRoleById);
router.post('/', protect, authorize(ADMIN_ID), createRole);
router.patch('/:roleId', protect, authorize(ADMIN_ID), updateRole);
router.delete('/:roleId', protect, authorize(ADMIN_ID), deleteRole);

export default router;

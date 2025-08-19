import { Router } from 'express';
import {
  getUserOrders,
  getUserOrderById,
  createOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
} from './orderController';
import { protect, authorize } from '../../middlewares/authMiddleware';
import { config } from '../../config';

const ADMIN_ID = parseInt(config.ADMIN_ID, 10) || 1; // Fallback to 1 if not set;

const router = Router();

// --- Admin-only Routes first ---
router.get('/all', protect, authorize(ADMIN_ID), getAllOrders);
router.patch('/:orderId', protect, authorize(ADMIN_ID), updateOrder);
router.delete('/:orderId', protect, authorize(ADMIN_ID), deleteOrder);

// --- User-specific Routes ---
router.get('/my', protect, getUserOrders);
router.get('/:orderId', protect, getUserOrderById);
router.post('/', protect, createOrder);

export default router;

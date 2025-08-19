// src/modules/orders/orderValidation.ts
import { z } from 'zod';

// Zod schema for a single order item.
export const orderItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

// Zod schema for creating a new order.
// The total and status are handled by the server.
export const createOrderSchema = z.object({
  order_items: z.array(orderItemSchema).min(1, { message: 'An order must have at least one item' }),
});

// Zod schema for updating an order.
export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled', 'shipped']).optional(),
  total: z.number().positive().optional(),
});

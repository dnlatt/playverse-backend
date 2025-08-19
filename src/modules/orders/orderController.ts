import { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as orderService from './orderService';
import { createOrderSchema, updateOrderSchema } from './orderValidation';

// Get all orders for the authenticated user
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.userId;
    const orders = await orderService.findUserOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
};

// Get a single order for the authenticated user
export const getUserOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    // @ts-ignore
    const userId = req.user.userId;
    const order = await orderService.findUserOrderById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('Error fetching user order by ID:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    // @ts-ignore
    const userId = req.user.userId;
    const newOrder = await orderService.createOrder(userId, validatedData);
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ errors: error });
    if (error instanceof Error) return res.status(400).json({ error: error.message });
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderService.findAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Update an order (admin only)
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    const validatedData = updateOrderSchema.parse(req.body);
    const updatedOrder = await orderService.updateOrder(orderId, validatedData);
    res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json({ errors: error });
    res.status(404).json({ error: 'Order not found' });
  }
};

// Delete an order (admin only)
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    await orderService.deleteOrder(orderId);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Order not found' });
  }
};

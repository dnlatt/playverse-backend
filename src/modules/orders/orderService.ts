// src/modules/orders/orderService.ts
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createOrderSchema, updateOrderSchema } from './orderValidation';

const prisma = new PrismaClient();

// Service to find all orders for a specific user, including user details.
export const findUserOrders = async (userId: number) => {
  return await prisma.orders.findMany({
    where: { user_id: userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone_number: true,
          address: true
        }
      },
      order_items: { include: { product: true } }
    },
    orderBy: { order_date: 'desc' },
  });
};

// Service to find a single order by ID for a specific user, including user details.
export const findUserOrderById = async (orderId: number) => {
  return await prisma.orders.findFirst({
    where: { order_id: orderId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone_number: true,
          address: true
        }
      },
      order_items: { include: { product: true } }
    },
  });
};

// Service to create a new order and its items.
export const createOrder = async (userId: number, data: z.infer<typeof createOrderSchema>) => {
  const productIds = data.order_items.map(item => item.product_id);

  // Use a transaction to ensure all operations succeed or fail together.
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch product prices and check stock.
    const products = await tx.products.findMany({
      where: { product_id: { in: productIds } },
      select: { product_id: true, price: true, stock: true },
    });

    if (products.length !== productIds.length) {
      throw new Error('One or more products not found');
    }

    let total = 0;
    const orderItemsToCreate = data.order_items.map(item => {
      const product = products.find(p => p.product_id === item.product_id);
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }
      total += product.price.toNumber() * item.quantity;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // 2. Create the order with the calculated total.
    const newOrder = await tx.orders.create({
      data: {
        user_id: userId,
        total: total,
      },
    });

    // 3. Create the order items.
    await tx.order_items.createMany({
      data: orderItemsToCreate.map(item => ({
        ...item,
        order_id: newOrder.order_id,
      })),
    });

    // 4. Decrease product stock.
    for (const item of data.order_items) {
      await tx.products.update({
        where: { product_id: item.product_id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });
};

// Service to find all orders for an admin.
export const findAllOrders = async () => {
  const orders = await prisma.orders.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone_number: true,
          address: true
        }
      },
      order_items: { include: { product: true } }
    },
    orderBy: { order_date: 'desc' },
  });
  return orders;
};

// Service to update an existing order (admin only).
export const updateOrder = async (orderId: number, data: z.infer<typeof updateOrderSchema>) => {
  return await prisma.orders.update({
    where: { order_id: orderId },
    data,
  });
};

// Service to delete an order (admin only).
export const deleteOrder = async (orderId: number) => {
  return await prisma.orders.delete({
    where: { order_id: orderId },
  });
};

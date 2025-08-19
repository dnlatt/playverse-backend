// src/routes/index.ts
// This is the main router that combines all feature-based routers.

import { Router } from 'express';
import authRouter from '../modules/auth/authRoutes'; 
import userRoutes from '../modules/users/userRoutes'; 
import rolesRouter from '../modules/roles/roleRoutes';
import brandsRouter from '../modules/brands/brandRoutes'; 
import platformsRouter from '../modules/platforms/platformRoutes';
import productRoutes from '../modules/products/productRoutes';
import product_typeRoutes from '../modules/product_types/product_typeRoutes'; 
import product_imageRoutes from '../modules/product_images/product_imageRoutes'; 
import orderRoutes from '../modules/orders/orderRoutes';

const router = Router();

// Use the auth router for the /auth path.
router.use('/auth', authRouter);

// Use the roles router for the /roles path.
router.use('/roles', rolesRouter);

// Use the user router for the /auth path.
router.use('/users', userRoutes);

// Use the brands router for the /brands path.
router.use('/brands', brandsRouter);

// Use the platforms router for the /platforms path.
router.use('/platforms', platformsRouter);

// Use the product type router for the /products type path.
router.use('/product_types', product_typeRoutes);

// Use the product images router for the /products images path.
router.use('/product_images', product_imageRoutes);

// Use the products router for the /products path.
router.use('/products', productRoutes);

// Use the orders router for the /products path.
router.use('/orders', orderRoutes);



export default router;
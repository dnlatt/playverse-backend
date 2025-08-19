// __tests__/e2e/product_image.e2e.test.ts
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { config } from '../../src/config';
import { loadRoles, roleConfig } from '../../src/config/rolesConfig';
import mainRouter from '../../src/routes';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const ADMIN_ROLE_NAME = 'admin';
const USER_ROLE_NAME = 'user';

// Helper to create a JWT token for testing.
const generateToken = (userId: number, roleId: number) => {
  return jwt.sign({ userId, roleId }, config.JWT_SECRET, { expiresIn: '1h' });
};

describe('Product Image Module E2E Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminRoleId: number;
  let userRoleId: number;
  let adminUserId: number;
  let regularUserId: number;
  let testProductId: number;
  let testImageId: number;

  beforeAll(async () => {
    // Manually load roles and set up the routes before any tests run.
    await loadRoles();
    app.use('/api', mainRouter);

    // Clean the database before all tests.
    await prisma.product_images.deleteMany();
    await prisma.products.deleteMany();
    await prisma.product_types.deleteMany();
    await prisma.brands.deleteMany();
    await prisma.platforms.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    
    // Reset auto-increment sequences.
    await prisma.$executeRaw`ALTER SEQUENCE "product_images_image_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "products_product_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "product_types_product_type_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "brands_brand_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "platforms_platform_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "users_user_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "roles_role_id_seq" RESTART WITH 1;`;

    // Create roles for testing
    const createdAdminRole = await prisma.roles.create({ data: { name: ADMIN_ROLE_NAME } });
    const createdUserRole = await prisma.roles.create({ data: { name: USER_ROLE_NAME } });
    adminRoleId = createdAdminRole.role_id;
    userRoleId = createdUserRole.role_id;

    // Create a test admin user and a regular user
    const adminUser = await prisma.users.create({
      data: { name: 'Admin', email: 'admin@test.com', password_hash: 'hashedpassword', role_id: adminRoleId },
    });
    const regularUser = await prisma.users.create({
      data: { name: 'User', email: 'user@test.com', password_hash: 'hashedpassword', role_id: userRoleId },
    });
    adminUserId = adminUser.user_id;
    regularUserId = regularUser.user_id;

    // Create a product for testing
    const productType = await prisma.product_types.create({ data: { name: 'game' } });
    const product = await prisma.products.create({
      data: {
        product_type_id: productType.product_type_id,
        name: 'Test Product',
        sku: 'TEST-SKU-001',
        slug: 'test-product',
        price: 19.99,
        stock: 10,
        status: 'instock',
      },
    });
    testProductId = product.product_id;

    // Create a product image for public and admin tests.
    const productImage = await prisma.product_images.create({
      data: { product_id: testProductId, image_url: 'http://example.com/test-image.jpg' },
    });
    testImageId = productImage.image_id;

    // Generate tokens for both users
    adminToken = generateToken(adminUserId, adminRoleId);
    userToken = generateToken(regularUserId, userRoleId);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- Public Access Tests ---
  it('should allow public access to get all product images', async () => {
    const res = await request(app).get('/api/product_images');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('image_url', 'http://example.com/test-image.jpg');
  });

  it('should allow public access to get a single product image by ID', async () => {
    const res = await request(app).get(`/api/product_images/${testImageId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('image_url', 'http://example.com/test-image.jpg');
  });

  // --- Admin-only CRUD Operations ---
  it('should allow admin to create a new product image', async () => {
    const newProductImage = { product_id: testProductId, image_url: 'http://example.com/new-image.jpg' };
    const res = await request(app)
      .post('/api/product_images')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProductImage);
      
    expect(res.status).toBe(201);
    expect(res.body.product_image.image_url).toBe(newProductImage.image_url);
  });

  it('should allow admin to update a product image by ID', async () => {
    const updatedUrl = 'http://example.com/updated-image.jpg';
    const res = await request(app)
      .patch(`/api/product_images/${testImageId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ image_url: updatedUrl });

    expect(res.status).toBe(200);
    expect(res.body.product_image.image_url).toBe(updatedUrl);
  });

  it('should allow admin to delete a product image by ID', async () => {
    const res = await request(app)
      .delete(`/api/product_images/${testImageId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(204);
  });
  
  // --- Access control tests ---
  it('should not allow a regular user to create a product image', async () => {
    const newProductImage = { product_id: testProductId, image_url: 'http://example.com/unauthorized-image.jpg' };
    const res = await request(app)
      .post('/api/product_images')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newProductImage);
      
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('You do not have permission to access this route');
  });

  it('should not allow an unauthenticated user to update a product image', async () => {
    const res = await request(app)
      .patch(`/api/product_images/${testImageId}`)
      .send({ image_url: 'http://example.com/unauthorized-update.jpg' });
      
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authorization token not found');
  });
});
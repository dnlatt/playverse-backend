// __tests__/e2e/product.e2e.test.ts
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

describe('Product Module E2E Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminRoleId: number;
  let userRoleId: number;
  let adminUserId: number;
  let regularUserId: number;
  let testProductId: number;
  let testProductSlug: string;

  beforeAll(async () => {
    // Manually load roles and set up the routes before any tests run.
    await loadRoles();
    app.use('/api', mainRouter);

    // Clean the database before all tests.
    await prisma.products.deleteMany();
    await prisma.product_types.deleteMany();
    await prisma.brands.deleteMany();
    await prisma.platforms.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    
    // Reset auto-increment sequences.
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

    // Create related data for product creation
    const productType = await prisma.product_types.create({ data: { name: 'game' } });
    const brand = await prisma.brands.create({ data: { name: 'Sony', slug: 'sony' } });
    const platform = await prisma.platforms.create({ data: { name: 'PlayStation 5', slug: 'playstation-5' } });

    // Create a product for public and admin tests.
    const product = await prisma.products.create({
      data: {
        product_type_id: productType.product_type_id,
        brand_id: brand.brand_id,
        platform_id: platform.platform_id,
        name: 'The Last of Us Part II',
        sku: 'TLOU2-PS5-001',
        slug: 'the-last-of-us-part-2',
        price: 69.99,
        stock: 10,
        status: 'instock',
      },
    });
    testProductId = product.product_id;
    testProductSlug = product.slug;

    // Generate tokens for both users
    adminToken = generateToken(adminUserId, adminRoleId);
    userToken = generateToken(regularUserId, userRoleId);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- Public Access Tests ---
  it('should allow public access to get all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.products[0]).toHaveProperty('name', 'The Last of Us Part II');

  });

  it('should allow public access to get a product by slug', async () => {
    const res = await request(app).get(`/api/products/${testProductSlug}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'The Last of Us Part II');
  });

  // --- Admin-only CRUD Operations ---

  it('should allow admin to create a new product', async () => {
    const productType = await prisma.product_types.findFirstOrThrow({ where: { name: 'game' } });
    const brand = await prisma.brands.create({ data: { name: 'Sony_2', slug: 'sony-2' } });
    const platform = await prisma.platforms.create({ data: { name: 'PlayStation 4', slug: 'playstation-4' } });
    
    const newProduct = {
      product_type_id: productType.product_type_id,
      brand_id: brand.brand_id,
      platform_id: platform.platform_id,
      name: 'Uncharted 4: A Thief\'s End',
      sku: 'UC4-PS4-001',
      price: 19.99,
      stock: 100,
      status: 'instock',
    };

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProduct);
      
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Product created successfully');
    expect(res.body.product.name).toBe(newProduct.name);
    expect(res.body.product.slug).toBe('uncharted-4-a-thiefs-end');
  });

  it('should allow admin to update a product by ID', async () => {
    const updatedName = 'The Last of Us Part II Remastered';
    const updatedSlug = 'the-last-of-us-part-ii-remastered'; 
    const res = await request(app)
      .patch(`/api/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: updatedName });

    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe(updatedName);
    expect(res.body.product.slug).toBe(updatedSlug);
  });

  it('should allow admin to delete a product by ID', async () => {
    const res = await request(app)
      .delete(`/api/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(204);
  });
  
  // --- Access control tests ---
  it('should not allow a regular user to create a product', async () => {
    const newProduct = { name: 'Unauthorized Game' };
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newProduct);
      
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('You do not have permission to access this route');
  });

  it('should not allow an unauthenticated user to update a product', async () => {
    const res = await request(app)
      .patch(`/api/products/${testProductId}`)
      .send({ name: 'Unauthorized Update' });
      
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authorization token not found');
  });
});

// __tests__/e2e/product_type.e2e.test.ts
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

describe('Product Type Module E2E Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminRoleId: number;
  let userRoleId: number;
  let adminUserId: number;
  let regularUserId: number;
  let testProductTypeId: number;
  let testBrandId: number;

  beforeAll(async () => {
    // Manually load roles and set up the routes before any tests run.
    await loadRoles();
    app.use('/api', mainRouter);

    // Clean the database before all tests.
    await prisma.product_types.deleteMany();
    await prisma.brands.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    
    // Reset auto-increment sequences.
    await prisma.$executeRaw`ALTER SEQUENCE "product_types_product_type_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "brands_brand_id_seq" RESTART WITH 1;`;
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

    // Create a brand for public and admin tests.
    const brand = await prisma.brands.create({ data: { name: 'Sony', slug: 'sony' } });
    testBrandId = brand.brand_id;

    // Create a product type for public and admin tests.
    const productType = await prisma.product_types.create({
      data: { name: 'Console', brand_id: testBrandId },
    });
    testProductTypeId = productType.product_type_id;

    // Generate tokens for both users
    adminToken = generateToken(adminUserId, adminRoleId);
    userToken = generateToken(regularUserId, userRoleId);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- Public Access Tests ---
  it('should allow public access to get all product types', async () => {
    const res = await request(app).get('/api/product_types');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name', 'Console');
  });

  it('should allow public access to get a single product type by ID', async () => {
    const res = await request(app).get(`/api/product_types/${testProductTypeId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Console');
  });

  // --- Admin-only CRUD Operations ---
  it('should allow admin to create a new product type', async () => {
    const newProductType = { name: 'Game', brand_id: testBrandId };
    const res = await request(app)
      .post('/api/product_types')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProductType);
      
    expect(res.status).toBe(201);
    expect(res.body.product_type.name).toBe(newProductType.name);
  });

  it('should allow admin to update a product type by ID', async () => {
    const updatedName = 'Updated Type';
    const res = await request(app)
      .patch(`/api/product_types/${testProductTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: updatedName });

    expect(res.status).toBe(200);
    expect(res.body.product_type.name).toBe(updatedName);
  });

  it('should allow admin to delete a product type by ID', async () => {
    const res = await request(app)
      .delete(`/api/product_types/${testProductTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(204);
  });
  
  // --- Access control tests ---
  it('should not allow a regular user to create a product type', async () => {
    const newProductType = { name: 'Unauthorized Type', brand_id: testBrandId };
    const res = await request(app)
      .post('/api/product_types')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newProductType);
      
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('You do not have permission to access this route');
  });

  it('should not allow an unauthenticated user to update a product type', async () => {
    const res = await request(app)
      .patch(`/api/product_types/${testProductTypeId}`)
      .send({ name: 'Unauthorized Update' });
      
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authorization token not found');
  });
});

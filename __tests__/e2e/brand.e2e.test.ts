// __tests__/e2e/brand.e2e.test.ts
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

describe('Brand Module E2E Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminUserId: number;
  let regularUserId: number;
  let createdBrandId: number;
  let createdBrandSlug: string;

  beforeAll(async () => {
    // Manually load roles and set up the routes before any tests run.
    await loadRoles();

    console.log('BRANDED Loaded roles:', roleConfig.roles);
    app.use('/api', mainRouter);

    // Clean the database before all tests.
    await prisma.brands.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    
    // Reset auto-increment sequences.
    await prisma.$executeRaw`ALTER SEQUENCE "brands_brand_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "users_user_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "roles_role_id_seq" RESTART WITH 1;`;

    // Create roles for testing and get their generated IDs
    const createdAdminRole = await prisma.roles.create({ data: { name: ADMIN_ROLE_NAME } });
    const createdUserRole = await prisma.roles.create({ data: { name: USER_ROLE_NAME } });
    
    const adminRoleId = createdAdminRole.role_id;
    const userRoleId = createdUserRole.role_id;

    // Create a test admin user and a regular user
    const adminUser = await prisma.users.create({
      data: { name: 'Admin', email: 'admin@test.com', password_hash: 'hashedpassword', role_id: adminRoleId },
    });
    const regularUser = await prisma.users.create({
      data: { name: 'User', email: 'user@test.com', password_hash: 'hashedpassword', role_id: userRoleId },
    });

    // Create a brand for public and admin tests.
    const brand = await prisma.brands.create({
      data: { name: 'Test Brand', slug: 'test-brand' },
    });
    createdBrandId = brand.brand_id;
    createdBrandSlug = brand.slug;

    // Generate tokens for both users
    adminToken = generateToken(adminUser.user_id, adminRoleId);
    userToken = generateToken(regularUser.user_id, userRoleId);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- Public Access Tests ---
  it('should allow public access to get all brands', async () => {
    const res = await request(app).get('/api/brands');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name', 'Test Brand');
  });

  it('should allow public access to get a brand by slug', async () => {
    const res = await request(app).get(`/api/brands/${createdBrandSlug}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test Brand');
  });

  // --- Admin-only CRUD Operations ---
  it('should allow admin to create a new brand', async () => {
    const newBrand = { name: 'New Brand' };
    const res = await request(app)
      .post('/api/brands')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newBrand);
      
    expect(res.status).toBe(201);
    expect(res.body.brand.name).toBe(newBrand.name);
    expect(res.body.brand.slug).toBe('new-brand');
  });

  it('should allow admin to update a brand by ID', async () => {
    const updatedName = 'Updated Brand Name';
    const updatedSlug = 'updated-brand-name';
    const res = await request(app)
      .patch(`/api/brands/${createdBrandId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: updatedName });

    expect(res.status).toBe(200);
    expect(res.body.brand.name).toBe(updatedName);
    expect(res.body.brand.slug).toBe(updatedSlug);
  });

  it('should allow admin to delete a brand by ID', async () => {
    const response = await request(app)
      .delete(`/api/brands/${createdBrandId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(204);
  });
  
  // --- Access control tests ---
  it('should not allow a regular user to create a brand', async () => {
    const newBrand = { name: 'Unauthorized Brand' };
    const res = await request(app)
      .post('/api/brands')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newBrand);
      
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('You do not have permission to access this route');
  });

  it('should not allow an unauthenticated user to update a brand', async () => {
    const res = await request(app)
      .patch(`/api/brands/${createdBrandId}`)
      .send({ name: 'Unauthorized Update' });
      
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authorization token not found');
  });
});

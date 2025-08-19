// __tests__/e2e/platform.e2e.test.ts
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

describe('Platform Module E2E Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminUserId: number;
  let regularUserId: number;
  let createdPlatformId: number;
  let createdPlatformSlug: string;

  beforeAll(async () => {
    // Manually load roles and set up the routes before any tests run.
    await loadRoles();
    app.use('/api', mainRouter);

    // Clean the database before all tests.
    await prisma.platforms.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    
    // Reset auto-increment sequences.
    await prisma.$executeRaw`ALTER SEQUENCE "platforms_platform_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "users_user_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "roles_role_id_seq" RESTART WITH 1;`;

    // Create roles for testing
    const createdAdminRole = await prisma.roles.create({ data: { name: ADMIN_ROLE_NAME } });
    const createdUserRole = await prisma.roles.create({ data: { name: USER_ROLE_NAME } });
    
    adminUserId = createdAdminRole.role_id;
    regularUserId = createdUserRole.role_id;

    // Create a test admin user and a regular user
    const adminUser = await prisma.users.create({
      data: { name: 'Admin', email: 'admin@test.com', password_hash: 'hashedpassword', role_id: adminUserId },
    });
    const regularUser = await prisma.users.create({
      data: { name: 'User', email: 'user@test.com', password_hash: 'hashedpassword', role_id: regularUserId },
    });

    // Create a platform for public and admin tests.
    const platform = await prisma.platforms.create({
      data: { name: 'PlayStation 5', slug: 'playstation-5' },
    });
    createdPlatformId = platform.platform_id;
    createdPlatformSlug = platform.slug;

    // Generate tokens for both users
    adminToken = generateToken(adminUser.user_id, adminUserId);
    userToken = generateToken(regularUser.user_id, regularUserId);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- Public Access Tests ---
  it('should allow public access to get all platforms', async () => {
    const res = await request(app).get('/api/platforms');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name', 'PlayStation 5');
  });

  it('should allow public access to get a platform by slug', async () => {
    const res = await request(app).get(`/api/platforms/${createdPlatformSlug}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'PlayStation 5');
  });

  // --- Admin-only CRUD Operations ---
  it('should allow admin to create a new platform', async () => {
    const newPlatform = { name: 'Xbox Series X' };
    const res = await request(app)
      .post('/api/platforms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newPlatform);
      
    expect(res.status).toBe(201);
    expect(res.body.platform.name).toBe(newPlatform.name);
    expect(res.body.platform.slug).toBe('xbox-series-x');
  });

  it('should allow admin to update a platform by ID', async () => {
    const updatedName = 'PlayStation 5 Pro';
    const updatedSlug = 'playstation-5-pro';
    const res = await request(app)
      .patch(`/api/platforms/${createdPlatformId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: updatedName });

    expect(res.status).toBe(200);
    expect(res.body.platform.name).toBe(updatedName);
    expect(res.body.platform.slug).toBe(updatedSlug);
  });

  it('should allow admin to delete a platform by ID', async () => {
    const res = await request(app)
      .delete(`/api/platforms/${createdPlatformId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(204);
  });
  
  // --- Access control tests ---
  it('should not allow a regular user to create a platform', async () => {
    const newPlatform = { name: 'Unauthorized Platform' };
    const res = await request(app)
      .post('/api/platforms')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newPlatform);
      
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('You do not have permission to access this route');
  });

  it('should not allow an unauthenticated user to update a platform', async () => {
    const res = await request(app)
      .patch(`/api/platforms/${createdPlatformId}`)
      .send({ name: 'Unauthorized Update' });
      
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authorization token not found');
  });
});

// __tests__/e2e/role.e2e.test.ts
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { config } from '../../src/config';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const ADMIN_ROLE_NAME = 'admin';
const USER_ROLE_NAME = 'user';

// Helper to create a JWT token for testing.
const generateToken = (userId: number, roleId: number) => {
  return jwt.sign({ userId, roleId }, config.JWT_SECRET, { expiresIn: '1h' });
};

describe('Role Module E2E Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminRoleId: number;
  let userRoleId: number;
  let testRoleId: number; // New variable to store the ID of a created role for testing.

  beforeAll(async () => {
    // Ensure the database is clean and roles/users exist for testing.
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    
    // Reset auto-increment sequences for tables with autoincrementing IDs.
    await prisma.$executeRaw`ALTER SEQUENCE "users_user_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "roles_role_id_seq" RESTART WITH 1;`;

    // Create roles for testing and get their generated IDs
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

    // Create a role to be used for the update and delete tests.
    const testRole = await prisma.roles.create({
      data: { name: 'test-role' },
    });
    testRoleId = testRole.role_id;

    // Generate tokens for both users
    adminToken = generateToken(adminUser.user_id, adminRoleId);
    userToken = generateToken(regularUser.user_id, userRoleId);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- CRUD Operations for Admin ---
  it('should allow admin to create a new role', async () => {
    const newRole = { name: 'editor' };
    const response = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newRole);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Role created successfully');
    expect(response.body.role.name).toBe(newRole.name);
  });

  it('should allow admin to get all roles', async () => {
    const response = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should allow admin to get a single role by ID', async () => {
    const response = await request(app)
      .get(`/api/roles/${testRoleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('role_id', testRoleId);
  });

  it('should allow admin to update a role by ID', async () => {
    const updatedData = { name: 'updated-role' };
    const response = await request(app)
      .patch(`/api/roles/${testRoleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Role updated successfully');
    expect(response.body.role.name).toBe(updatedData.name);
  });

  it('should allow admin to delete a role by ID', async () => {
    const response = await request(app)
      .delete(`/api/roles/${testRoleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(204);
  });
  
  // --- Access Control Tests ---
  it('should not allow a regular user to create a role', async () => {
    const newRole = { name: 'guest' };
    const response = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newRole);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('You do not have permission to access this route');
  });

  it('should not allow unauthenticated user to get roles', async () => {
    const response = await request(app)
      .get('/api/roles');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authorization token not found');
  });
});

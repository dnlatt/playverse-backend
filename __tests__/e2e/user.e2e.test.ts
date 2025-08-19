// __tests__/e2e/user.e2e.test.ts
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { config } from '../../src/config';
import { roleConfig } from '../../src/config/rolesConfig';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const ADMIN_ROLE_NAME = 'admin';
const USER_ROLE_NAME = 'user';

// Helper to create a JWT token for testing.
const generateToken = (userId: number, roleId: number) => {
  return jwt.sign({ userId, roleId }, config.JWT_SECRET, { expiresIn: '1h' });
};

describe('User Module E2E Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminUserId: number;
  let regularUserId: number;

  beforeAll(async () => {
    // Clean the database before all tests.
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();

    // Create roles with fixed IDs from roleConfig
    await prisma.roles.create({
      data: { role_id: roleConfig.roles.admin, name: ADMIN_ROLE_NAME }
    });
    await prisma.roles.create({
      data: { role_id: roleConfig.roles.user, name: USER_ROLE_NAME }
    });

    // Create a test admin user and a regular user
    const adminUser = await prisma.users.create({
      data: {
        name: 'Admin',
        email: 'admin@test.com',
        password_hash: 'hashedpassword',
        role_id: roleConfig.roles.admin,
        address: '123 Admin St.',
        phone_number: '11111111',
      },
    });

    const regularUser = await prisma.users.create({
      data: {
        name: 'User',
        email: 'user@test.com',
        password_hash: 'hashedpassword',
        role_id: roleConfig.roles.user,
        address: '456 User St.',
        phone_number: '22222222',
      },
    });

    adminUserId = adminUser.user_id;
    regularUserId = regularUser.user_id;

    // Generate tokens
    adminToken = generateToken(adminUserId, roleConfig.roles.admin);
    userToken = generateToken(regularUserId, roleConfig.roles.user);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- CRUD Operations for Admin ---
  it('should allow admin to get all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    expect(response.body[0]).toHaveProperty('email');
  });

  it('should allow admin to get a single user by ID', async () => {
    const response = await request(app)
      .get(`/api/users/${regularUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user_id', regularUserId);
  });

  it('should allow admin to create a new user', async () => {
    const newUser = {
      name: 'New User',
      email: 'newuser@test.com',
      password: 'password123',
      address: '789 New St.',
      phone_number: '33333333',
    };

    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    expect(response.body.user.email).toBe(newUser.email);
    expect(response.body.user.role_id).toBe(roleConfig.roles.user); // Should be locked to user role
  });

  it('should allow admin to update a user', async () => {
    const updatedData = {
      name: 'Updated User',
      phone_number: '44444444',
    };
    const response = await request(app)
      .patch(`/api/users/${regularUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User updated successfully');
    expect(response.body.user.name).toBe(updatedData.name);
    expect(response.body.user.phone_number).toBe(updatedData.phone_number);
  });

  it('should allow admin to delete a user', async () => {
    const response = await request(app)
      .delete(`/api/users/${regularUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
  });

  // --- Access Control Tests ---
  it('should not allow a regular user to get all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  it('should not allow an unauthenticated user to create a user', async () => {
    const newUser = {
      name: 'Guest User',
      email: 'guest@test.com',
      password: 'password123',
      address: '123 Guest St.',
      phone_number: '55555555',
    };
    const response = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(response.status).toBe(401);
  });
});

// __tests__/e2e/auth.e2e.test.ts
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Clean the database and create necessary roles before all tests.
beforeAll(async () => {
  // Clear all data to ensure a clean state for each test run.
  await prisma.users.deleteMany({});
  await prisma.roles.deleteMany({});

  // Reset auto-increment sequences for tables with autoincrementing IDs.
  await prisma.$executeRaw`ALTER SEQUENCE "users_user_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "roles_role_id_seq" RESTART WITH 1;`;

  // Create the required roles for the tests to pass.
  await prisma.roles.createMany({
    data: [
      { role_id: 1, name: 'user' },
      { role_id: 2, name: 'admin' },
    ],
  });
});

describe('Auth Module E2E Tests', () => {
  it('should register a new user successfully', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.user).toHaveProperty('user_id');
    expect(response.body.user.email).toBe(newUser.email);
    expect(response.body.user.name).toBe(newUser.name);
  });

  it('should prevent registering with an existing email', async () => {
    const existingUser = {
      name: 'Existing User',
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(existingUser);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Email already exists');
  });

  it('should login a user successfully', async () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginCredentials);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.user).toHaveProperty('user_id');
    expect(response.body.token).toBeDefined();
  });

  it('should fail to login with an invalid password', async () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginCredentials);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password');
  });
});

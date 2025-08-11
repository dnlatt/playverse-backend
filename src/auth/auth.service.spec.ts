// src/auth/auth.service.spec.ts
//
// Unit tests for AuthService.
// Mocks dependencies to test the service's logic.
//

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Mock object for UsersService
const mockUsersService = {
  findByEmail: jest.fn(),
};

// Mock object for JwtService
const mockJwtService = {
  sign: jest.fn(() => 'mock_access_token'),
};

// Mock the entire bcrypt module to avoid the TypeError
jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    // Reset all mocks after each test to ensure test isolation
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    // Test for correct email and password
    it('should return a user object if email and password are correct', async () => {
      const user = {
        user_id: 1,
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: { name: 'User' },
      };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        user_id: 1,
        email: 'test@example.com',
        role: { name: 'User' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', user.password_hash);
    });

    // Should return null if user is not found
    it('should return null if user is not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      
      const result = await service.validateUser('notfound@example.com', 'password123');

      expect(result).toBeNull();
    });

    // Should return null if password is incorrect
    it('should return null if password is incorrect', async () => {
      const user = {
        user_id: 1,
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        role: { name: 'User' },
      };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    // Should return an access token object upon successful login
    it('should return an access token object', async () => {
      const user = { user_id: 1, email: 'test@example.com', role: { name: 'User' } };
      const expectedPayload = { email: user.email, sub: user.user_id, role: user.role.name };
      
      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual({ access_token: 'mock_access_token' });
    });
  });
});
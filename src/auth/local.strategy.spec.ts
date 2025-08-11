//
// Unit tests for LocalStrategy.
// Primarily tests the validation logic.
//

import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

// Mock object for AuthService
const mockAuthService = {
  validateUser: jest.fn(),
};

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    // Test for correct email and password
    it('should return a user object if validation succeeds', async () => {
      const user = { user_id: 1, email: 'test@example.com', role: { name: 'user' } };
      (authService.validateUser as jest.Mock).mockResolvedValue(user);

      const result = await strategy.validate('test@example.com', 'password123');

      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual(user);
    });

    // Should throw UnauthorizedException if validation fails
    it('should throw an UnauthorizedException if validation fails', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(strategy.validate('wrong@example.com', 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
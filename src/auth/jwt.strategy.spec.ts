//
// Unit tests for JwtStrategy.
// Primarily tests payload validation.
//

import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  // Mocking is needed to call the super constructor of JwtStrategy
  const mockAuthService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AuthService, useValue: mockAuthService }
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  // Should correctly validate the payload
  it('should validate and return the user payload', async () => {
    const payload = { sub: 1, email: 'test@example.com', role: 'user' };
    const result = await strategy.validate(payload);
    expect(result).toEqual({ userId: 1, email: 'test@example.com', role: 'user' });
  });
});
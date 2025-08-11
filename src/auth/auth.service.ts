// src/auth/auth.service.ts
//
// Auth Service သည် user ကို validate လုပ်ပြီး JWT ကို ဖန်တီးပေးသည်။
//

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * User ကို email နှင့် password ဖြင့် စစ်ဆေးသည်။
   * @param email user ၏ email
   * @param password user ၏ password
   * @returns စစ်ဆေးအောင်မြင်ပါက user object၊ မဟုတ်ပါက null
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      // password_hash field ကို database ကနေ ပြန်မထုတ်ပေးဖို့
      // password_hash ကို undefined လုပ်လိုက်တယ်။
      // ဒါက security အရ အရေးကြီးတယ်။
      const { password_hash, ...result } = user; 
      return result;
    }
    return null;
  }

  /**
   * User login အောင်မြင်ပါက JWT ကို ဖန်တီးပေးသည်။
   * @param user validate အောင်မြင်သော user object
   * @returns Access token
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.user_id, role: user.role.name };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
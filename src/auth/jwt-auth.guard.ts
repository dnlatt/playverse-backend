// src/auth/jwt-auth.guard.ts
//
// JWT ကို သုံးပြီး routes များကို ကာကွယ်ရန် Guard
//
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

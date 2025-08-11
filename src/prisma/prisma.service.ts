// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // Prisma ရဲ့ query တွေကို console မှာ log ထုတ်ချင်ရင် ဒီမှာ ထည့်နိုင်ပါတယ်
      // log: ['query', 'info', 'warn', 'error'],
    });
  }

  // Application စတင်တဲ့အခါ database ကို connect လုပ်ပေးမယ်
  async onModuleInit() {
    await this.$connect();
  }

  // Application ပိတ်တဲ့အခါ database connection ကို disconnect လုပ်ပေးမယ်
  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// src/users/users.service.ts (Update)
//
// password_hash field ကို ထည့်သွင်းပြီး findByEmail method တွင် role ကိုပါ include လုပ်သည်။
//
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { users } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<users> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.users.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password_hash: hashedPassword,
        role_id: createUserDto.role_id,
      },
    });
  }

  async findAll(): Promise<users[]> {
    return this.prisma.users.findMany({
      include: {
        role: true,
      },
    });
  }

  async findOne(id: number): Promise<users> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: id },
      include: {
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return user;
  }

  // Auth Service က ခေါ်သုံးနိုင်ရန် role ကိုပါ include လုပ်ပြီး findByEmail method ကို ပြင်ဆင်လိုက်သည်။
  async findByEmail(email: string): Promise<users | null> {
    return this.prisma.users.findUnique({
      where: { email },
      include: {
        role: true, // Role data ကို ထုတ်ပေးရန်
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<users> {
    await this.findOne(id);
    let password_hash: string | undefined;

    if (updateUserDto.password) {
      password_hash = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.users.update({
      where: { user_id: id },
      data: {
        ...updateUserDto,
        password_hash,
      },
    });
  }

  async remove(id: number): Promise<users> {
    await this.findOne(id);
    return this.prisma.users.delete({
      where: { user_id: id },
    });
  }
}
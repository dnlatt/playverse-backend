// src/modules/auth/authService.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterData } from './authValidation';
import { config } from '../../config';
import { JWTPayload } from '../../types/auth.d'; 


const prisma = new PrismaClient();

export const registerUser = async (data: RegisterData) => {
  // Hash the user's password.
  const passwordHash = await bcrypt.hash(data.password, config.SALTROUNDS);

  // Create a new user in the database using Prisma.
  const user = await prisma.users.create({
    data: {
      email: data.email,
      password_hash: passwordHash,
      name: data.name,
      // Assign the default role_id for a new user.
      role_id: parseInt(config.USER_ID), 
    },
  });

  return user;
};

// Handles the logic for user login.
export const loginUser = async (email: string, password: string) => {
  // Find the user by their email in the database.
  const user = await prisma.users.findUnique({
    where: { email },
  });

  // If no user is found, return null.
  if (!user) {
    return null;
  }
  // Compare the provided password with the hashed password in the database.
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  // If the password is valid, generate a JWT token and return it along with the user.
  if (isPasswordValid) {
    
    const payload: JWTPayload = {
      userId: user.user_id,
      email: user.email,
      roleId: user.role_id,
    };
    const token = jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: config.EXPIRATION as jwt.SignOptions['expiresIn']  }
    );
    return { user, token };
  } else {
    return null;
  }
};
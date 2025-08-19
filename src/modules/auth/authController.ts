// src/modules/auth/authController.ts
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { registerSchema, loginSchema } from './authValidation';
import * as authService from './authService';

// Handles the request for user registration.
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body using Zod schema.
    const validatedData = registerSchema.parse(req.body);
    const newUser = await authService.registerUser(validatedData);

    // If successful, send a 201 status code with a success message and user data.
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    if (error instanceof ZodError) {
      // Handle Zod validation errors.
      res.status(400).json({ errors: error });
    } else if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      // Handle duplicate email errors from Prisma.
      res.status(409).json({ error: 'Email already exists' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
};

// Handles the request for user login.
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body using Zod schema.
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData.email, validatedData.password);

    if (!result) {
      // If login fails (invalid email or password), send a 401 status.
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
    
    // If login is successful, send a 200 status with a success message, user data, and a JWT token.
    res.status(200).json({ message: 'Login successful', user: result.user, token: result.token });


  } catch (error) {
    if (error instanceof ZodError) {
      // Handle Zod validation errors.
      res.status(400).json({ errors: error });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to log in' });
    }
  }
};

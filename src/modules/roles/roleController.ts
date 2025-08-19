// src/modules/roles/roleController.ts
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as roleService from './roleService';
import { createRoleSchema, updateRoleSchema } from './roleValidation';

// Get all roles
export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await roleService.findRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Get a single role by ID
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleId = parseInt(req.params.roleId, 10);
    const role = await roleService.findRoleById(roleId);
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
};

// Create a new role (Admin only)
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createRoleSchema.parse(req.body);
    const newRole = await roleService.createRole(validatedData);
    res.status(201).json({ message: 'Role created successfully', role: newRole });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else {
      res.status(500).json({ error: 'Failed to create role' });
    }
  }
};

// Update an existing role by ID (Admin only)
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleId = parseInt(req.params.roleId, 10);
    const validatedData = updateRoleSchema.parse(req.body);
    const updatedRole = await roleService.updateRole(roleId, validatedData);
    res.json({ message: 'Role updated successfully', role: updatedRole });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error });
    } else {
      res.status(404).json({ error: 'Role not found' });
    }
  }
};

// Delete a role by ID (Admin only)
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleId = parseInt(req.params.roleId, 10);
    await roleService.deleteRole(roleId);
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    res.status(404).json({ error: 'Role not found' });
  }
};

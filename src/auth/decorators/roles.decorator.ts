import { SetMetadata } from '@nestjs/common';

// This is the key that stores the roles metadata
export const ROLES_KEY = 'roles'; 

// This decorator is used to define which roles can access a route
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
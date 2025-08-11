import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { roles } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the route handler
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get the user from the request object. 
    // The JwtAuthGuard should have populated this.
    const { user } = context.switchToHttp().getRequest();

    // Check if the user's role name is included in the required roles
    // The user object is expected to have a 'role' property.
    return requiredRoles.some((roleName) => user.role.name === roleName);
  }
}
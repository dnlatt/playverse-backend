// src/config/rolesConfig.ts
// This module handles fetching and creating role IDs on application startup.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// An object to store all roles fetched from the database, keyed by their name.
export const roleConfig: { roles: Record<string, number> } = {
  roles: {},
};

// This function ensures the 'admin' and 'user' roles exist and populates roleConfig.
export const loadRoles = async () => {
  try {
    const rolesToCreate = [
      { id: 1, name: 'admin' },
      { id: 2, name: 'user' },
    ];
    
    for (const roleData of rolesToCreate) {
      let role = await prisma.roles.findFirst({
        where: { name: roleData.name },
      });

      if (!role) {
        role = await prisma.roles.upsert({
          where: { role_id: roleData.id },
          update: { name: roleData.name },
          create: { role_id: roleData.id, name: roleData.name },
        });
        //console.log(`Created new role: ${roleData.name} with ID ${roleData.id}`);
      }
      
      roleConfig.roles[role.name] = role.role_id;
    }

    //console.log('Roles loaded:', roleConfig.roles);
  } catch (error) {
    console.error('Failed to load roles from the database:', error);
    process.exit(1); // Exit the application if a critical error occurs.
  }
};

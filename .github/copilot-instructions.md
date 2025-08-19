# Copilot Instructions for `playverse-backend`

This document provides guidance for AI coding agents working on the `playverse-backend` project. It outlines the architecture, conventions, workflows, and patterns specific to this codebase to ensure productive contributions.

## Project Overview

The `playverse-backend` is a Node.js-based backend application using TypeScript, Express.js, and Prisma for database management. The project is organized into modular components, each representing a domain (e.g., `auth`, `orders`, `products`).

### Key Directories

- **`src/modules/`**: Contains domain-specific modules, each with its own controller, service, routes, and validation files.
- **`prisma/`**: Includes the Prisma schema (`schema.prisma`) and migration scripts.
- **`__tests__/e2e/`**: End-to-end tests for various modules.
- **`config/`**: Configuration files, such as `rolesConfig.ts` for role-based access control.

### Data Flow

1. **Routes**: Define API endpoints and middleware.
2. **Controllers**: Handle HTTP requests and responses.
3. **Services**: Contain business logic and interact with the database via Prisma.
4. **Validation**: Validate incoming request data.

## Developer Workflows

### Running Tests

- End-to-end tests are located in `__tests__/e2e/`.
- Run a specific test file:
  ```bash
  npm run test __tests__/e2e/order.e2e.test.ts
  ```

### Debugging

- Use `console.log` for debugging. Example:
  ```typescript
  console.log("🔗 [DEBUG] Order routes initialized Role Name", roleConfig);
  ```

### Database Migrations

- Prisma is used for database migrations.
- Apply migrations:
  ```bash
  npx prisma migrate dev
  ```

### Seeding the Database

- Seed data is defined in `prisma/seed.ts`.
- Run the seed script:
  ```bash
  npx prisma db seed
  ```

## Project-Specific Conventions

### Role-Based Access Control

- Roles are defined in `config/rolesConfig.ts`.
- Example usage in routes:
  ```typescript
  router.get(
    "/admin",
    protect,
    authorize(roleConfig.roles.admin),
    getAllOrders
  );
  ```

### Modular Structure

- Each module (e.g., `orders`, `products`) follows this structure:
  - `moduleController.ts`: Handles HTTP requests.
  - `moduleService.ts`: Contains business logic.
  - `moduleRoutes.ts`: Defines API routes.
  - `moduleValidation.ts`: Validates request data.

### Middleware

- Authentication and authorization middleware are in `src/middlewares/authMiddleware.ts`.
- Example:
  ```typescript
  router.get("/", protect, getUserOrders);
  ```

## External Dependencies

- **Prisma**: ORM for database interactions.
- **Express.js**: Web framework.
- **Jest**: Testing framework.

## Key Files

- `src/app.ts`: Application entry point.
- `src/routes/index.ts`: Centralized route management.
- `prisma/schema.prisma`: Database schema.

---

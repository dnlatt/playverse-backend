# Playverse Backend

The **`playverse-backend`** is a **video gaming e-commerce backend** designed to power online marketplaces for physical game products. It is built with **Node.js**, **TypeScript**, **Express.js**, and **Prisma**, using **PostgreSQL** as the database.

The project follows a **modular and layered architecture** — separating concerns into controllers, services, validations, and routes — to ensure scalability, maintainability, and clear domain boundaries.

---

## 🚀 Project Overview

- **Framework**: Node.js + Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Testing**: Jest (E2E in `__tests__/e2e/`)

### 📂 Key Directories

| Directory        | Purpose                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `src/modules/`   | Domain-specific modules (controllers, services, routes, validations). |
| `prisma/`        | Database schema + migrations (`schema.prisma`, migration scripts).    |
| `__tests__/e2e/` | End-to-end tests for APIs.                                            |
| `config/`        | Configurations                                                        |

### 🔄 Data Flow

1. **Routes** → define endpoints + middleware
2. **Controllers** → handle HTTP requests/responses
3. **Services** → business logic & DB operations via Prisma
4. **Validation** → ensures request data is valid

---

## 🛠 Developer Workflows

### ▶️ Starting the Project

```bash
# Install dependencies
npm install

# Run in development mode (with hot-reload)
npm run dev
```

The app will start at:  
👉 `http://localhost:5000`

---

### ▶️ Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm run test __tests__/e2e/order.e2e.test.ts
```

---

## 📦 Database (PostgreSQL)

This project uses **PostgreSQL** with **Prisma ORM**.

### Running Migrations

```bash
npx prisma migrate dev
```

### Seeding Database

```bash
npx prisma db seed
```

(Seed data in `prisma/seed.ts`)

### Prisma Studio (DB GUI)

```bash
npx prisma studio
```

---

## 📐 Project Conventions

### 📦 Modular Structure

Each module (`orders`, `products`, etc.) includes:

- `moduleController.ts`
- `moduleService.ts`
- `moduleRoutes.ts`
- `moduleValidation.ts`

### 🔒 Middleware

Authentication & authorization are in `src/middlewares/authMiddleware.ts`.

```ts
router.get("/", protect, getUserOrders);
```

---

## 📚 External Dependencies

- **Prisma** → ORM (with PostgreSQL)
- **Express.js** → Web framework
- **Jest** → Testing

---

## 📌 Key Files

- `src/app.ts` → Application entry point
- `src/routes/index.ts` → Centralized route management
- `prisma/schema.prisma` → Database schema

---

## ⚙️ Environment Setup

The project uses **two `.env` files**:

### `.env` / `.env.test`

```ini
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/playverse"
PORT=5000
JWT_SECRET="yoursecretkey"
EXPIRATION="12h"
ADMIN_ID=1
USER_ID=2
ALLOWED_ORIGINS="http://localhost:3000"
NODE_ENV=development
```

---

## 📬 Postman Collection

Provide a **Postman Collection** to simplify testing.

### Files

- `postman/playverse-backend.postman_collection.json` → API requests
- `postman/playverse-backend.postman_environment.json` → Environment variables

### Environment Variables

The Postman **environment file** includes:

- `apiURL` → e.g., `http://localhost:5000`
- `token` → Admin JWT token
- `userToken` → User JWT token

### Usage

1. Import both files into Postman
2. Select the environment (`playverse-backend`)
3. Run requests directly

---

✅ With this setup, you can start the server, run DB migrations, seed sample data, and test endpoints via Postman immediately.

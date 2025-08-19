// __tests__/e2e/order.e2e.test.ts
import request from "supertest";
import app from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { config } from "../../src/config";
import { loadRoles, roleConfig } from "../../src/config/rolesConfig";
import mainRouter from "../../src/routes";
import jwt from "jsonwebtoken";

const ADMIN_ROLE_NAME = "admin";
const USER_ROLE_NAME = "user";

const prisma = new PrismaClient();

const generateToken = (userId: number, roleId: number) => {
  return jwt.sign({ userId, roleId }, config.JWT_SECRET, { expiresIn: "1h" });
};

describe("Order Module E2E Tests", () => {
  let adminToken: string;
  let userToken: string;
  let adminUserId: number;
  let regularUserId: number;
  let testProductId: number;
  let testOrderId: number;

  beforeAll(async () => {
    // Clean the DB first
    await prisma.order_items.deleteMany();
    await prisma.orders.deleteMany();
    await prisma.products.deleteMany();
    await prisma.product_types.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();

    // Reset sequences
    await prisma.$executeRaw`ALTER SEQUENCE "orders_order_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "order_items_order_item_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "products_product_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "product_types_product_type_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "users_user_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "roles_role_id_seq" RESTART WITH 1;`;

    // Create roles
    await prisma.roles.create({ data: { name: ADMIN_ROLE_NAME } });
    await prisma.roles.create({ data: { name: USER_ROLE_NAME } });

    // Load roles into roleConfig after creating them
    await loadRoles();

    // Create users
    const adminUser = await prisma.users.create({
      data: {
        name: "Admin",
        email: "admin@test.com",
        password_hash: "hashedpassword",
        role_id: roleConfig.roles.admin,
      },
    });
    const regularUser = await prisma.users.create({
      data: {
        name: "User",
        email: "user@test.com",
        password_hash: "hashedpassword",
        role_id: roleConfig.roles.user,
      },
    });
    adminUserId = adminUser.user_id;
    regularUserId = regularUser.user_id;

    // Create product type and product
    const productType = await prisma.product_types.create({
      data: { name: "game" },
    });
    const product = await prisma.products.create({
      data: {
        product_type_id: productType.product_type_id,
        name: "Test Product",
        sku: "TEST-SKU-001",
        slug: "test-product",
        price: 19.99,
        stock: 10,
        status: "instock",
      },
    });
    testProductId = product.product_id;

    // Create initial order for the regular user
    const initialOrder = await prisma.orders.create({
      data: { user_id: regularUserId, total: 19.99 },
    });
    testOrderId = initialOrder.order_id;
    await prisma.order_items.create({
      data: {
        order_id: testOrderId,
        product_id: testProductId,
        quantity: 1,
        price: 19.99,
      },
    });

    // Tokens
    adminToken = generateToken(adminUserId, roleConfig.roles.admin);
    userToken = generateToken(regularUserId, roleConfig.roles.user);

    // Mount routes AFTER roleConfig is loaded
    app.use("/api", mainRouter);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- Tests ---
  it("should allow an authenticated user to get their own orders", async () => {
    const res = await request(app)
      .get("/api/orders/my")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("order_id", testOrderId);
  });

  it("should allow an authenticated user to get a single order by ID", async () => {
    const res = await request(app)
      .get(`/api/orders/${testOrderId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("order_id", testOrderId);
  });

  it("should allow a user to create a new order", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ order_items: [{ product_id: testProductId, quantity: 2 }] });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Order created successfully");
  });

  it("should allow an admin to get all orders", async () => {
    const res = await request(app)
      .get("/api/orders/all")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should allow an admin to update an order status", async () => {
    const res = await request(app)
      .patch(`/api/orders/${testOrderId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "completed" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("completed");
  });

  it("should allow an admin to delete an order", async () => {
    const res = await request(app)
      .delete(`/api/orders/${testOrderId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it("should not allow an unauthenticated user to create an order", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ order_items: [{ product_id: testProductId, quantity: 1 }] });
    expect(res.status).toBe(401);
  });
});

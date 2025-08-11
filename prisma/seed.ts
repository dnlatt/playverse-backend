import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const main = async () => {
  // Clear existing data
  await prisma.order_items.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.cart_items.deleteMany();
  await prisma.carts.deleteMany();
  await prisma.product_tags.deleteMany();
  await prisma.product_images.deleteMany();
  await prisma.products.deleteMany();
  await prisma.product_types.deleteMany();
  await prisma.tags.deleteMany();
  await prisma.platforms.deleteMany();
  await prisma.brands.deleteMany();
  await prisma.users.deleteMany();
  await prisma.roles.deleteMany();

  console.log('Deleted existing data...');

  // Roles
  const adminRole = await prisma.roles.create({
    data: { name: 'admin' },
  });
  const userRole = await prisma.roles.create({
    data: { name: 'user' },
  });

  console.log('Created roles...');

  // Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user1 = await prisma.users.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@playverse.com',
      password_hash: hashedPassword,
      role_id: userRole.role_id,
    },
  });

  const user2 = await prisma.users.create({
    data: {
      name: 'Admin User',
      email: 'admin@playverse.com',
      password_hash: await bcrypt.hash('adminpassword', 10),
      role_id: adminRole.role_id,
    },
  });

  console.log('Created users...');

  // Brands
  const sony = await prisma.brands.create({
    data: { name: 'Sony', slug: 'sony' },
  });
  const microsoft = await prisma.brands.create({
    data: { name: 'Microsoft', slug: 'microsoft' },
  });
  const nintendo = await prisma.brands.create({
    data: { name: 'Nintendo', slug: 'nintendo' },
  });

  console.log('Created brands...');

  // Platforms
  const ps4 = await prisma.platforms.create({
    data: { name: 'PlayStation 4', slug: 'playstation-4' },
  });
  const ps5 = await prisma.platforms.create({
    data: { name: 'PlayStation 5', slug: 'playstation-5' },
  });
  const nintendo_switch = await prisma.platforms.create({
    data: { name: 'Nintendo Switch', slug: 'nintendo-switch' },
  });
  const switch2 = await prisma.platforms.create({
    data: { name: 'Nintendo Switch 2', slug: 'nintendo-switch2' },
  });
  const pc = await prisma.platforms.create({
    data: { name: 'PC', slug: 'pc' },
  });
  const xbox = await prisma.platforms.create({
    data: { name: 'Xbox', slug: 'xbox' },
  });

  console.log('Created platforms...');

  // Product Types
  const consoleType = await prisma.product_types.create({
    data: { name: 'Console', brand_id: null },
  });
  const gameType = await prisma.product_types.create({
    data: { name: 'Game', brand_id: null },
  });

  console.log('Created product types...');

  // Tags
  const newTag = await prisma.tags.create({ data: { name: 'New' } });
  const exclusiveTag = await prisma.tags.create({
    data: { name: 'Exclusive' },
  });

  console.log('Created tags...');

  // Products
  const ps5Console = await prisma.products.create({
    data: {
      name: 'Playstation 5',
      sku: 'PS5-CONSOLE-001',
      slug: 'playstation-5',
      price: 499.99,
      stock: 10,
      product_type_id: consoleType.product_type_id,
      brand_id: sony.brand_id,
      platform_id: ps5.platform_id,
    },
  });

  const ps4Console = await prisma.products.create({
    data: {
      name: 'Playstation 4',
      sku: 'PS4-CONSOLE-001',
      slug: 'playstation-4',
      price: 299.99,
      stock: 5,
      product_type_id: consoleType.product_type_id,
      brand_id: sony.brand_id,
      platform_id: ps4.platform_id,
    },
  });

  const switch2Console = await prisma.products.create({
    data: {
      name: 'Switch 2',
      sku: 'SWITCH2-CONSOLE-001',
      slug: 'switch-2',
      price: 399.99,
      stock: 8,
      product_type_id: consoleType.product_type_id,
      brand_id: nintendo.brand_id,
      platform_id: switch2.platform_id,
    },
  });

  const ghostOfYotei = await prisma.products.create({
    data: {
      name: 'Ghost of Yotei',
      sku: 'GHOST-OF-YOTEI-PS5',
      slug: 'ghost-of-yotei-ps5',
      price: 69.99,
      stock: 50,
      product_type_id: gameType.product_type_id,
      brand_id: sony.brand_id,
      platform_id: ps5.platform_id,
      released_date: new Date('2025-10-27T00:00:00.000Z'),
    },
  });

  const pokemonLegends = await prisma.products.create({
    data: {
      name: 'Pokemon Legends: Z-A',
      sku: 'POKEMON-Z-A-SWITCH2',
      slug: 'pokemon-legends-z-a-switch2',
      price: 59.99,
      stock: 40,
      product_type_id: gameType.product_type_id,
      brand_id: nintendo.brand_id,
      platform_id: switch2.platform_id,
      released_date: new Date('2025-10-27T00:00:00.000Z'),
    },
  });

  const eaSportsPc = await prisma.products.create({
    data: {
      name: 'EA Sports FC 26',
      sku: 'EAFC26-PC-001',
      slug: 'ea-sports-fc-26-pc',
      price: 59.99,
      stock: 60,
      product_type_id: gameType.product_type_id,
      brand_id: null,
      platform_id: pc.platform_id,
      released_date: new Date('2025-09-27T00:00:00.000Z'),
    },
  });

  const eaSportsXbox = await prisma.products.create({
    data: {
      name: 'EA Sports FC 26',
      sku: 'EAFC26-XBOX-001',
      slug: 'ea-sports-fc-26-xbox',
      price: 59.99,
      stock: 65,
      product_type_id: gameType.product_type_id,
      brand_id: null,
      platform_id: xbox.platform_id,
      released_date: new Date('2025-09-27T00:00:00.000Z'),
    },
  });

  console.log('Created products...');

  // Product Images
  await prisma.product_images.createMany({
    data: [
      {
        product_id: ps5Console.product_id,
        image_url: 'https://example.com/ps5-image1.jpg',
      },
      {
        product_id: ps4Console.product_id,
        image_url: 'https://example.com/ps4-image1.jpg',
      },
      {
        product_id: switch2Console.product_id,
        image_url: 'https://example.com/switch2-image1.jpg',
      },
      {
        product_id: ghostOfYotei.product_id,
        image_url: 'https://example.com/ghost-of-yotei-image1.jpg',
      },
      {
        product_id: pokemonLegends.product_id,
        image_url: 'https://example.com/pokemon-za-image1.jpg',
      },
      {
        product_id: eaSportsPc.product_id,
        image_url: 'https://example.com/eafc26-pc-image1.jpg',
      },
      {
        product_id: eaSportsXbox.product_id,
        image_url: 'https://example.com/eafc26-xbox-image1.jpg',
      },
    ],
  });

  console.log('Created product images...');

  // Product Tags (Many-to-Many)
  await prisma.product_tags.create({
    data: {
      product_id: ps5Console.product_id,
      tag_id: newTag.tag_id,
    },
  });

  await prisma.product_tags.create({
    data: {
      product_id: ps5Console.product_id,
      tag_id: exclusiveTag.tag_id,
    },
  });

  console.log('Created product tags...');

  // Carts (for user1)
  const user1Cart = await prisma.carts.create({
    data: {
      user_id: user1.user_id,
    },
  });

  // Cart Items (for user1)
  await prisma.cart_items.createMany({
    data: [
      {
        cart_id: user1Cart.cart_id,
        product_id: ps5Console.product_id,
        quantity: 1,
        price: ps5Console.price,
      },
      {
        cart_id: user1Cart.cart_id,
        product_id: eaSportsPc.product_id,
        quantity: 1,
        price: eaSportsPc.price,
      },
    ],
  });

  console.log('Created carts and cart items...');

  // Orders (for user1)
  const user1Order = await prisma.orders.create({
    data: {
      user_id: user1.user_id,
      status: 'completed',
      total: 559.98,
    },
  });

  // Order Items
  await prisma.order_items.createMany({
    data: [
      {
        order_id: user1Order.order_id,
        product_id: ps4Console.product_id,
        quantity: 1,
        price: ps4Console.price,
      },
      {
        order_id: user1Order.order_id,
        product_id: pokemonLegends.product_id,
        quantity: 2,
        price: pokemonLegends.price,
      },
    ],
  });

  console.log('Created orders and order items...');

  console.log('Seeding finished.');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

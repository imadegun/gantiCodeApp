import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@ceramic.app',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('Created admin user:', admin);

  // Create stock manager user
  const stockManagerPassword = await hashPassword('stock123');
  const stockManager = await prisma.user.upsert({
    where: { username: 'stockmanager' },
    update: {},
    create: {
      username: 'stockmanager',
      email: 'stock@ceramic.app',
      password: stockManagerPassword,
      name: 'Stock Manager',
      role: 'STOCK_MANAGER',
      isActive: true
    }
  });

  console.log('Created stock manager user:', stockManager);

  // Create product code manager user
  const productManagerPassword = await hashPassword('product123');
  const productManager = await prisma.user.upsert({
    where: { username: 'productmanager' },
    update: {},
    create: {
      username: 'productmanager',
      email: 'product@ceramic.app',
      password: productManagerPassword,
      name: 'Product Code Manager',
      role: 'PRODUCT_CODE_MANAGER',
      isActive: true
    }
  });

  console.log('Created product manager user:', productManager);

  // Create test client
  const client = await prisma.client.upsert({
    where: { clientCode: 'TEST001' },
    update: {},
    create: {
      clientCode: 'TEST001',
      name: 'Test Client',
      email: 'test@client.com',
      phone: '+1234567890',
      address: '123 Test Street, Test City',
      isActive: true
    }
  });

  console.log('Created test client:', client);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
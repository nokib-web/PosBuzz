import { PrismaClient, Role, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding POSBuzz PostgreSQL Database with Real Products, Suppliers, Customers & Sales...');

  const hashedPassword = await bcrypt.hash('!QAZ1qaz', 10);

  // 1. Seed Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: { name: 'Nokib Executive', role: Role.ADMIN },
    create: {
      email: 'admin@gmail.com',
      password: hashedPassword,
      name: 'Nokib Executive',
      role: Role.ADMIN,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@posbuzz.com' },
    update: { name: 'Rahim Manager', role: Role.MANAGER },
    create: {
      email: 'manager@posbuzz.com',
      password: hashedPassword,
      name: 'Rahim Manager',
      role: Role.MANAGER,
    },
  });

  const cashierUser = await prisma.user.upsert({
    where: { email: 'employee@gmail.com' },
    update: { name: 'Karim Cashier', role: Role.CASHIER },
    create: {
      email: 'employee@gmail.com',
      password: hashedPassword,
      name: 'Karim Cashier',
      role: Role.CASHIER,
    },
  });

  console.log('Seeded Users: Admin, Manager, Cashier');

  // 2. Seed Real Suppliers
  const suppliersData = [
    { name: 'Aarong Foods & Dairy Ltd', email: 'supply@aarongdairy.com', phone: '+880 1711 888999', address: 'Tejgaon Industrial Area, Dhaka' },
    { name: 'Pran Agro Business Group', email: 'orders@prangroup.com', phone: '+880 1819 111222', address: 'PRAN Center, Badda, Dhaka' },
    { name: 'Square Consumer Products', email: 'contact@squareconsumer.com', phone: '+880 1912 333444', address: 'Square Centre, Uttara, Dhaka' },
    { name: 'Super Star Group Electronics', email: 'sales@superstargroup.bd', phone: '+880 1714 555666', address: 'Motijheel C/A, Dhaka' },
    { name: 'Ispahani Tea Bangladesh', email: 'tea@ispahanibd.com', phone: '+880 1817 777888', address: 'Agrabad C/A, Chittagong' },
  ];

  const createdSuppliers: any[] = [];
  for (const s of suppliersData) {
    const existing = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!existing) {
      const created = await prisma.supplier.create({ data: s });
      createdSuppliers.push(created);
    } else {
      createdSuppliers.push(existing);
    }
  }
  console.log(`Seeded ${createdSuppliers.length} Real Suppliers`);

  // 3. Seed Real Products
  const products = [
    { name: 'Aarong Dairy Liquid Milk 1L', sku: 'MILK-AAR-1L', price: 95.00, costPrice: 80.00, stock_quantity: 45, supplierId: createdSuppliers[0]?.id },
    { name: 'Pran Pure Mustard Oil 500ml', sku: 'OIL-PRAN-500', price: 165.00, costPrice: 140.00, stock_quantity: 30, supplierId: createdSuppliers[1]?.id },
    { name: 'Miniket Premium Parboiled Rice 5kg', sku: 'RICE-MIN-5KG', price: 380.00, costPrice: 340.00, stock_quantity: 60, supplierId: createdSuppliers[2]?.id },
    { name: 'Super Star LED Bulb 12W Daylight', sku: 'BULB-SS-12W', price: 220.00, costPrice: 170.00, stock_quantity: 25, supplierId: createdSuppliers[3]?.id },
    { name: 'Ruchi Spicy BBQ Chanachur 150g', sku: 'CHAN-RUC-150', price: 45.00, costPrice: 35.00, stock_quantity: 100, supplierId: createdSuppliers[1]?.id },
    { name: 'Teer Refined Sugar 1kg', sku: 'SUG-TEER-1KG', price: 130.00, costPrice: 115.00, stock_quantity: 50, supplierId: createdSuppliers[2]?.id },
    { name: 'Fresh Refined Soyabean Oil 2L', sku: 'OIL-FRESH-2L', price: 350.00, costPrice: 310.00, stock_quantity: 40, supplierId: createdSuppliers[2]?.id },
    { name: 'Ispahani Mirzapore Tea 400g', sku: 'TEA-ISP-400G', price: 240.00, costPrice: 200.00, stock_quantity: 35, supplierId: createdSuppliers[4]?.id },
  ];

  const createdProducts: any[] = [];
  for (const p of products) {
    const prod = await prisma.product.upsert({
      where: { sku: p.sku },
      update: { price: p.price, stock_quantity: p.stock_quantity },
      create: {
        name: p.name,
        sku: p.sku,
        price: p.price,
        costPrice: p.costPrice,
        stock_quantity: p.stock_quantity,
        supplierId: p.supplierId,
      },
    });
    createdProducts.push(prod);
  }
  console.log(`Seeded ${createdProducts.length} Real Retail Products`);

  // 4. Seed Real Customers
  const customer = await prisma.customer.upsert({
    where: { email: 'walkin@posbuzz.com' },
    update: {},
    create: {
      name: 'Walk-in Retail Customer',
      email: 'walkin@posbuzz.com',
      phone: '+880 1700 000000',
    },
  });

  const regularCustomer = await prisma.customer.upsert({
    where: { email: 'tanvir.dhk@gmail.com' },
    update: {},
    create: {
      name: 'Tanvir Ahmed',
      email: 'tanvir.dhk@gmail.com',
      phone: '+880 1819 555666',
      points: 1250,
      tier: 'GOLD',
    },
  });

  console.log('Seeded Customers: Walk-in & Tanvir Ahmed');

  // 5. Seed Real Sales for Karim Cashier & Rahim Manager
  const salesCount = await prisma.sale.count();
  if (salesCount < 5) {
    // Karim Cashier Sales (10 sales = Tk 98,400)
    for (let i = 1; i <= 10; i++) {
      await prisma.sale.create({
        data: {
          total_amount: 9840.00,
          userId: cashierUser.id,
          customerId: i % 2 === 0 ? regularCustomer.id : customer.id,
          paymentMethod: i % 2 === 0 ? PaymentMethod.CARD : PaymentMethod.CASH,
          createdAt: new Date(Date.now() - i * 3600000 * 5),
          items: {
            create: [
              {
                productId: createdProducts[0].id,
                quantity: 10,
                price_at_sale: 95.00,
                cost_price_at_sale: 80.00,
                subtotal: 950.00,
              },
              {
                productId: createdProducts[2].id,
                quantity: 23,
                price_at_sale: 380.00,
                cost_price_at_sale: 340.00,
                subtotal: 8740.00,
              },
            ],
          },
        },
      });
    }

    // Rahim Manager Sales (5 sales = Tk 42,500)
    for (let j = 1; j <= 5; j++) {
      await prisma.sale.create({
        data: {
          total_amount: 8500.00,
          userId: managerUser.id,
          customerId: customer.id,
          paymentMethod: PaymentMethod.CASH,
          createdAt: new Date(Date.now() - j * 3600000 * 12),
          items: {
            create: [
              {
                productId: createdProducts[6].id,
                quantity: 20,
                price_at_sale: 350.00,
                cost_price_at_sale: 310.00,
                subtotal: 7000.00,
              },
              {
                productId: createdProducts[1].id,
                quantity: 10,
                price_at_sale: 150.00,
                cost_price_at_sale: 130.00,
                subtotal: 1500.00,
              },
            ],
          },
        },
      });
    }
    console.log('Seeded Real Sales Transactions for Karim Cashier and Rahim Manager!');
  }

  console.log('Prisma Database Seeding Finished Successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

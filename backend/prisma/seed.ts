import { PrismaClient, Role, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function generate1008Products(supplierIds: string[]) {
  const baseItems = [
    { name: 'Miniket Rice Premium', category: 'Groceries', price: 76, costPrice: 65, unit: 'Kg', skuPrefix: 'RICE-MIN', suppIdx: 0 },
    { name: 'Nazirshail Rice Standard', category: 'Groceries', price: 92, costPrice: 78, unit: 'Kg', skuPrefix: 'RICE-NAZ', suppIdx: 0 },
    { name: 'Chinigura Aromatic Rice', category: 'Groceries', price: 145, costPrice: 122, unit: 'Kg', skuPrefix: 'RICE-CHI', suppIdx: 0 },
    { name: 'ACI Pure Vacuum Salt', category: 'Groceries', price: 38, costPrice: 30, unit: 'Kg', skuPrefix: 'SALT-ACI', suppIdx: 2 },
    { name: 'Teer Refined White Sugar', category: 'Groceries', price: 130, costPrice: 115, unit: 'Kg', skuPrefix: 'SUG-TEER', suppIdx: 2 },
    { name: 'Rupchanda Fortified Soyabean Oil', category: 'Groceries', price: 175, costPrice: 155, unit: 'Litre', skuPrefix: 'OIL-RUP', suppIdx: 1 },
    { name: 'Fresh Refined Soyabean Oil', category: 'Groceries', price: 170, costPrice: 150, unit: 'Litre', skuPrefix: 'OIL-FRESH', suppIdx: 2 },
    { name: 'Pran Pure Mustard Oil', category: 'Groceries', price: 330, costPrice: 290, unit: 'Litre', skuPrefix: 'OIL-MUST', suppIdx: 1 },
    { name: 'Aarong Pasteurized Liquid Milk', category: 'Dairy', price: 95, costPrice: 80, unit: 'Pcs', skuPrefix: 'MILK-AAR', suppIdx: 0 },
    { name: 'Dano Full Cream Milk Powder', category: 'Dairy', price: 860, costPrice: 740, unit: 'Pcs', skuPrefix: 'MILK-DANO', suppIdx: 2 },
    { name: 'Ispahani Mirzapore Black Tea', category: 'Beverages', price: 240, costPrice: 200, unit: 'Pcs', skuPrefix: 'TEA-ISP', suppIdx: 4 },
    { name: 'Coca-Cola Carbonated Drink', category: 'Beverages', price: 110, costPrice: 88, unit: 'Pcs', skuPrefix: 'COKE-REG', suppIdx: 2 },
    { name: 'Super Star LED Bulb', category: 'Electronics', price: 220, costPrice: 170, unit: 'Pcs', skuPrefix: 'BULB-SS', suppIdx: 3 },
    { name: 'Ruchi Spicy BBQ Chanachur', category: 'Groceries', price: 45, costPrice: 35, unit: 'Pcs', skuPrefix: 'CHAN-RUC', suppIdx: 1 },
    { name: 'Bombay Sweets Potato Crackers', category: 'Bakery', price: 20, costPrice: 15, unit: 'Pcs', skuPrefix: 'SNK-BS', suppIdx: 2 },
    { name: 'Lux Soft Rose Beauty Soap', category: 'Personal Care', price: 65, costPrice: 50, unit: 'Pcs', skuPrefix: 'SOAP-LUX', suppIdx: 2 },
    { name: 'Sunsilk Black Shine Shampoo', category: 'Personal Care', price: 280, costPrice: 230, unit: 'Pcs', skuPrefix: 'HAIR-SUN', suppIdx: 2 },
    { name: 'CloseUp Red Hot Fresh Toothpaste', category: 'Personal Care', price: 140, costPrice: 112, unit: 'Pcs', skuPrefix: 'DENT-CLO', suppIdx: 2 },
  ];

  const variants = [
    'Classic 100g', 'Express 250g', 'Gold 500ml', 'Organic 1L', 'Pack of 2', 'Family Pack',
    'Special Edition', 'Refill 750ml', 'Standard 1Kg', 'Select 500ml', 'Ultra Clean 1L',
    'Value Pack', 'Premium 2Kg', 'Supreme 5L', 'Eco Pack 250g'
  ];

  // 8 signature products
  const signature = [
    { name: 'Aarong Dairy Liquid Milk 1L', sku: 'MILK-AAR-1L', price: 95, costPrice: 80, stock_quantity: 45, unit: 'Pcs', category: 'Dairy', supplierId: supplierIds[0] },
    { name: 'Pran Pure Mustard Oil 500ml', sku: 'OIL-PRAN-500', price: 165, costPrice: 140, stock_quantity: 30, unit: 'Pcs', category: 'Groceries', supplierId: supplierIds[1] },
    { name: 'Miniket Premium Parboiled Rice (Per Kg)', sku: 'RICE-MIN-1KG', price: 76, costPrice: 68, stock_quantity: 300, unit: 'Kg', category: 'Groceries', supplierId: supplierIds[0] },
    { name: 'Super Star LED Bulb 12W Daylight', sku: 'BULB-SS-12W', price: 220, costPrice: 170, stock_quantity: 25, unit: 'Pcs', category: 'Electronics', supplierId: supplierIds[3] },
    { name: 'Ruchi Spicy BBQ Chanachur 150g', sku: 'CHAN-RUC-150', price: 45, costPrice: 35, stock_quantity: 100, unit: 'Pcs', category: 'Groceries', supplierId: supplierIds[1] },
    { name: 'Teer Refined Sugar 1kg', sku: 'SUG-TEER-1KG', price: 130, costPrice: 115, stock_quantity: 50, unit: 'Kg', category: 'Groceries', supplierId: supplierIds[2] },
    { name: 'Fresh Refined Soyabean Oil 2L', sku: 'OIL-FRESH-2L', price: 350, costPrice: 310, stock_quantity: 40, unit: 'Pcs', category: 'Groceries', supplierId: supplierIds[2] },
    { name: 'Ispahani Mirzapore Tea 400g', sku: 'TEA-ISP-400G', price: 240, costPrice: 200, stock_quantity: 35, unit: 'Pcs', category: 'Beverages', supplierId: supplierIds[4] },
  ];

  const generated: any[] = [...signature];
  let count = 1;

  outer:
  for (let i = 0; i < 65; i++) {
    for (const base of baseItems) {
      if (generated.length >= 1008) break outer;
      const variant = variants[count % variants.length];
      const sku = `${base.skuPrefix}-${count.toString().padStart(4, '0')}`;
      // skip if already in signature
      if (signature.some(s => s.sku === sku)) { count++; continue; }
      const price = Math.round(base.price * (0.8 + (count % 15) * 0.1));
      const costPrice = Math.round(price * 0.82);
      const stock = 15 + (count * 7) % 450;
      generated.push({
        name: `${base.name} ${variant}`,
        sku,
        price,
        costPrice,
        stock_quantity: stock,
        unit: base.unit,
        category: base.category,
        supplierId: supplierIds[base.suppIdx] || null,
      });
      count++;
    }
  }

  return generated;
}

async function main() {
  console.log('🚀 Seeding POSBuzz PostgreSQL Database...');

  const hashedPassword = await bcrypt.hash('!QAZ1qaz', 10);

  // 1. Seed Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: { name: 'Nokib Executive', role: Role.ADMIN },
    create: { email: 'admin@gmail.com', password: hashedPassword, name: 'Nokib Executive', role: Role.ADMIN },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@posbuzz.com' },
    update: { name: 'Rahim Manager', role: Role.MANAGER },
    create: { email: 'manager@posbuzz.com', password: hashedPassword, name: 'Rahim Manager', role: Role.MANAGER },
  });

  const cashierUser = await prisma.user.upsert({
    where: { email: 'employee@gmail.com' },
    update: { name: 'Karim Cashier', role: Role.CASHIER },
    create: { email: 'employee@gmail.com', password: hashedPassword, name: 'Karim Cashier', role: Role.CASHIER },
  });
  console.log('✅ Seeded Users: Admin, Manager, Cashier');

  // 2. Seed Suppliers
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
      createdSuppliers.push(await prisma.supplier.create({ data: s }));
    } else {
      createdSuppliers.push(existing);
    }
  }
  console.log(`✅ Seeded ${createdSuppliers.length} Suppliers`);

  // 3. Seed 1008 Products into PostgreSQL
  const supplierIds = createdSuppliers.map(s => s.id);
  const allProducts = generate1008Products(supplierIds);

  let upsertedCount = 0;
  for (const p of allProducts) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        price: p.price,
        costPrice: p.costPrice,
        stock_quantity: p.stock_quantity,
        unit: p.unit,
        category: p.category,
      },
      create: {
        name: p.name,
        sku: p.sku,
        price: p.price,
        costPrice: p.costPrice,
        stock_quantity: p.stock_quantity,
        unit: p.unit,
        category: p.category,
        supplierId: p.supplierId || null,
      },
    });
    upsertedCount++;
    if (upsertedCount % 100 === 0) {
      console.log(`  ↳ Seeded ${upsertedCount}/${allProducts.length} products...`);
    }
  }
  console.log(`✅ Seeded ${upsertedCount} Real Products into Neon PostgreSQL!`);

  // 4. Seed Customers
  const customer = await prisma.customer.upsert({
    where: { email: 'walkin@posbuzz.com' },
    update: {},
    create: { name: 'Walk-in Retail Customer', email: 'walkin@posbuzz.com', phone: '+880 1700 000000' },
  });

  const regularCustomer = await prisma.customer.upsert({
    where: { email: 'tanvir.dhk@gmail.com' },
    update: {},
    create: { name: 'Tanvir Ahmed', email: 'tanvir.dhk@gmail.com', phone: '+880 1819 555666', points: 1250, tier: 'GOLD' },
  });
  console.log('✅ Seeded Customers');

  // 5. Seed Sales (only if few exist)
  const salesCount = await prisma.sale.count();
  const firstProduct = await prisma.product.findFirst({ where: { sku: 'MILK-AAR-1L' } });
  const thirdProduct = await prisma.product.findFirst({ where: { sku: 'RICE-MIN-1KG' } });
  const oilProduct = await prisma.product.findFirst({ where: { sku: 'OIL-FRESH-2L' } });

  if (salesCount < 5 && firstProduct && thirdProduct && oilProduct) {
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
              { productId: firstProduct.id, quantity: 10, price_at_sale: 95.00, cost_price_at_sale: 80.00, subtotal: 950.00 },
              { productId: thirdProduct.id, quantity: 23, price_at_sale: 380.00, cost_price_at_sale: 340.00, subtotal: 8740.00 },
            ],
          },
        },
      });
    }

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
              { productId: oilProduct.id, quantity: 20, price_at_sale: 350.00, cost_price_at_sale: 310.00, subtotal: 7000.00 },
              { productId: firstProduct.id, quantity: 10, price_at_sale: 150.00, cost_price_at_sale: 130.00, subtotal: 1500.00 },
            ],
          },
        },
      });
    }
    console.log('✅ Seeded Sales Transactions');
  }

  console.log('\n🎉 POSBuzz Database Seeding Complete! 1008 products now in Neon PostgreSQL.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

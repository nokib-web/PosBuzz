import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Admin
    const adminEmail = 'admin@gmail.com';
    const adminPass = '!QAZ1qaz';
    const adminHash = await bcrypt.hash(adminPass, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: adminHash, role: Role.ADMIN },
        create: { email: adminEmail, password: adminHash, role: Role.ADMIN, name: 'Admin User' }
    });
    console.log(`Admin set up: ${admin.email}`);

    // Employee
    const empEmail = 'employee@gmail.com';
    const empPass = '!QAZ1qaz';
    const empHash = await bcrypt.hash(empPass, 10);

    const employee = await prisma.user.upsert({
        where: { email: empEmail },
        update: { password: empHash, role: Role.CASHIER },
        create: { email: empEmail, password: empHash, role: Role.CASHIER, name: 'Demo Employee' }
    });
    console.log(`Employee set up: ${employee.email}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

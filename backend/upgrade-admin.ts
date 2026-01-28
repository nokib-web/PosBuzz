import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting manual admin upgrade...');
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@gmail.com' },
        });

        if (!user) {
            console.log('User admin@gmail.com not found.');
            return;
        }

        console.log(`User found: ${user.email}, Role: ${user.role}`);

        const updated = await prisma.user.update({
            where: { email: 'admin@gmail.com' },
            data: { role: 'ADMIN' }, // Use constant, or string "ADMIN"
        });

        console.log(`User updated to: ${updated.role}`);
    } catch (error) {
        console.error('Error upgrading user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

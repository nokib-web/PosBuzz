import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SaleService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Process a new sale with atomic stock management and profit tracking
     */
    async create(userId: string, dto: CreateSaleDto) {
        return this.prisma.$transaction(async (tx) => {
            let total_amount = 0;
            const saleItemsToCreate: any[] = [];

            // 1. Process each item
            for (const item of dto.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new NotFoundException(`Product with ID ${item.productId} not found`);
                }

                // 2. Check stock
                if (product.stock_quantity < item.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for product: ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`,
                    );
                }

                // 3. Deduct stock atomically
                await tx.product.update({
                    where: { id: product.id },
                    data: {
                        stock_quantity: { decrement: item.quantity },
                    },
                });

                const subtotal = Number(product.price) * item.quantity;
                total_amount += subtotal;

                saleItemsToCreate.push({
                    productId: product.id,
                    quantity: item.quantity,
                    price_at_sale: product.price,
                    cost_price_at_sale: product.costPrice,
                    subtotal: subtotal,
                });
            }

            // 4. Update Customer Points if customerId is provided
            if (dto.customerId) {
                const pointsEarned = Math.floor(total_amount / 10);
                if (pointsEarned > 0) {
                    await tx.customer.update({
                        where: { id: dto.customerId },
                        data: {
                            points: { increment: pointsEarned },
                        },
                    });
                }
            }

            // 5. Create Sale
            const sale = await tx.sale.create({
                data: {
                    userId,
                    customerId: dto.customerId,
                    total_amount,
                    // @ts-ignore - Prisma client needs regeneration
                    paymentMethod: (dto.paymentMethod as any) || 'CASH',
                    items: {
                        create: saleItemsToCreate,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    customer: true,
                },
            });

            return sale;
        });
    }

    /**
     * List all sales for a user with pagination
     */
    async findAll(userId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.sale.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { items: true },
                    },
                },
            }),
            this.prisma.sale.count({ where: { userId } }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get a single sale with detailed information
     */
    async findOne(userId: string, id: string) {
        const sale = await this.prisma.sale.findFirst({
            where: { id, userId },
            include: {
                user: {
                    select: { id: true, email: true },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!sale) {
            throw new NotFoundException(`Sale with ID ${id} not found`);
        }

        return sale;
    }
}

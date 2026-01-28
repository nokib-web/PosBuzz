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

            const customer: any = dto.customerId ? await tx.customer.findUnique({ where: { id: dto.customerId } }) : null;

            // 1. Process each item
            for (const item of dto.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new NotFoundException(`Product with ID ${item.productId} not found`);
                }

                if (product.stock_quantity < item.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for product: ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`,
                    );
                }

                await tx.product.update({
                    where: { id: product.id },
                    data: { stock_quantity: { decrement: item.quantity } },
                });

                // Log inventory - cast tx as any if inventoryLog is not yet recognized
                await (tx as any).inventoryLog.create({
                    data: {
                        productId: product.id,
                        type: 'SALE',
                        quantity: -item.quantity,
                        notes: `Sale processed by user ${userId}`
                    }
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

            // 2. Promotion Logic
            let discount = 0;
            if (dto.promotionId) {
                const promo: any = await (tx as any).promotion.findUnique({ where: { id: dto.promotionId } });
                if (promo && promo.active && new Date() >= promo.startDate && new Date() <= promo.endDate) {
                    if (!promo.minSpend || total_amount >= Number(promo.minSpend)) {
                        if (promo.type === 'PERCENTAGE') {
                            discount = total_amount * (Number(promo.value) / 100);
                        } else if (promo.type === 'FIXED_AMOUNT') {
                            discount = Math.min(total_amount, Number(promo.value));
                        }
                    }
                }
            }

            const final_amount = total_amount - discount;

            // 3. Update Customer Points & Tier
            if (customer) {
                // Loyalty Multiplier based on tier
                let multiplier = 1;
                if (customer.tier === 'SILVER') multiplier = 1.2;
                else if (customer.tier === 'GOLD') multiplier = 1.5;
                else if (customer.tier === 'PLATINUM') multiplier = 2;

                const pointsEarned = Math.floor((final_amount / 10) * multiplier);

                // Update Points
                const updatedCustomer: any = await tx.customer.update({
                    where: { id: customer.id },
                    data: { points: { increment: pointsEarned } }
                });

                // Auto Tier Upgrade
                let newTier = updatedCustomer.tier;
                if (updatedCustomer.points >= 5000) newTier = 'PLATINUM';
                else if (updatedCustomer.points >= 2000) newTier = 'GOLD';
                else if (updatedCustomer.points >= 500) newTier = 'SILVER';

                if (newTier !== updatedCustomer.tier) {
                    await tx.customer.update({
                        where: { id: updatedCustomer.id },
                        data: { tier: newTier }
                    });
                }
            }

            // 5. Create Sale
            const sale = await (tx as any).sale.create({
                data: {
                    userId,
                    customerId: dto.customerId,
                    promotionId: dto.promotionId,
                    total_amount: final_amount,
                    discount,
                    paymentMethod: (dto.paymentMethod as any) || 'CASH',
                    items: {
                        create: saleItemsToCreate,
                    },
                },
                include: {
                    items: {
                        include: { product: true },
                    },
                    customer: true,
                },
            });

            return sale;
        });
    }

    async getSales(page: number = 1, limit: number = 10) {
        const [items, total] = await Promise.all([
            this.prisma.sale.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: { product: true },
                    },
                    customer: true,
                    user: {
                        select: { email: true }
                    }
                },
            }),
            this.prisma.sale.count(),
        ]);

        return {
            data: items,
            total,
            page,
            limit,
        };
    }

    async getSaleById(id: string) {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: true },
                },
                customer: true,
                user: {
                    select: { email: true }
                }
            },
        });

        if (!sale) {
            throw new NotFoundException(`Sale with ID ${id} not found`);
        }

        return sale;
    }
}

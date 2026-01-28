import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import dayjs from 'dayjs';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getSummary() {
        const sales = await this.prisma.sale.findMany({
            include: {
                items: true,
            },
        });

        let totalRevenue = 0;
        let totalProfit = 0;
        let totalSalesCount = sales.length;

        sales.forEach((sale) => {
            totalRevenue += Number(sale.total_amount);
            sale.items.forEach((item) => {
                const revenue = Number(item.subtotal);
                const cost = Number(item.cost_price_at_sale) * item.quantity;
                totalProfit += (revenue - cost);
            });
        });

        return {
            totalRevenue,
            totalProfit,
            totalSalesCount,
        };
    }

    async getSalesTrend(days: number = 7) {
        const startDate = dayjs().subtract(days, 'day').startOf('day').toDate();

        const sales = await this.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                total_amount: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Group by day
        const trend = new Map();
        for (let i = 0; i < days; i++) {
            const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
            trend.set(date, 0);
        }

        sales.forEach((sale) => {
            const date = dayjs(sale.createdAt).format('YYYY-MM-DD');
            if (trend.has(date)) {
                trend.set(date, trend.get(date) + Number(sale.total_amount));
            }
        });

        return Array.from(trend.entries())
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    async getTopSellingProducts(limit: number = 5) {
        const topProducts = await (this.prisma as any).saleItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
                subtotal: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: limit,
        });

        const products = await Promise.all(
            topProducts.map(async (item: any) => {
                const product = await this.prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true, sku: true },
                });
                return {
                    ...product,
                    totalQuantity: item._sum.quantity,
                    totalRevenue: item._sum.subtotal,
                };
            }),
        );

        return products;
    }

    async getStaffPerformance() {
        const performance = await (this.prisma as any).sale.groupBy({
            by: ['userId'],
            _sum: {
                total_amount: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                _sum: {
                    total_amount: 'desc',
                },
            },
        });

        const staffData = await Promise.all(
            performance.map(async (p: any) => {
                const user = await (this.prisma as any).user.findUnique({
                    where: { id: p.userId },
                    select: { email: true, name: true },
                });
                return {
                    ...user,
                    totalSales: p._sum.total_amount,
                    transactionCount: p._count.id,
                };
            }),
        );

        return staffData;
    }
}

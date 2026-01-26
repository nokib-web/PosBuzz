import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import Redis from 'ioredis';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductService {
    private readonly CACHE_TTL = 300; // 5 minutes in seconds

    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) { }

    async create(dto: CreateProductDto) {
        const existingSku = await this.prisma.product.findUnique({
            where: { sku: dto.sku },
        });

        if (existingSku) {
            throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
        }

        const product = await this.prisma.product.create({
            data: dto,
        });

        await this.clearListCache();
        return product;
    }

    async findAll(query: QueryProductDto) {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;
        const cacheKey = `products:page:${page}:limit:${limit}:search:${search || 'none'}`;

        // Try to get from cache
        const cachedData = await this.redis.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        // Prepare where clause
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { sku: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        // Get data from DB
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);

        const result = {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };

        // Save to cache
        await this.redis.set(cacheKey, JSON.stringify(result), 'EX', this.CACHE_TTL);

        return result;
    }

    async findOne(id: string) {
        const cacheKey = `product:${id}`;

        // Try cache
        const cachedProduct = await this.redis.get(cacheKey);
        if (cachedProduct) {
            return JSON.parse(cachedProduct);
        }

        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Save cache
        await this.redis.set(cacheKey, JSON.stringify(product), 'EX', this.CACHE_TTL);

        return product;
    }

    async update(id: string, dto: UpdateProductDto) {
        // Check if product exists
        await this.findOne(id);

        // If SKU is being updated, check for duplicates
        if (dto.sku) {
            const existingSku = await this.prisma.product.findFirst({
                where: { sku: dto.sku, id: { not: id } },
            });
            if (existingSku) {
                throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
            }
        }

        const product = await this.prisma.product.update({
            where: { id },
            data: dto,
        });

        // Invalidate caches
        await this.clearProductCache(id);
        await this.clearListCache();

        return product;
    }

    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.product.delete({
            where: { id },
        });

        // Invalidate caches
        await this.clearProductCache(id);
        await this.clearListCache();

        return { message: 'Product deleted successfully' };
    }

    // --- Cache Invalidation Helpers ---

    private async clearListCache() {
        // Clear all keys matching products:*
        const keys = await this.redis.keys('products:*');
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }

    private async clearProductCache(id: string) {
        await this.redis.del(`product:${id}`);
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreatePromotionDto) {
        return this.prisma.promotion.create({
            data: {
                ...dto,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
            }
        });
    }

    async findAll() {
        return this.prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async findActive() {
        const now = new Date();
        return this.prisma.promotion.findMany({
            where: {
                active: true,
                startDate: { lte: now },
                endDate: { gte: now }
            }
        });
    }

    async findOne(id: string) {
        const promotion = await this.prisma.promotion.findUnique({ where: { id } });
        if (!promotion) throw new NotFoundException('Promotion not found');
        return promotion;
    }

    async update(id: string, dto: any) {
        return this.prisma.promotion.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.startDate && { startDate: new Date(dto.startDate) }),
                ...(dto.endDate && { endDate: new Date(dto.endDate) }),
            }
        });
    }

    async remove(id: string) {
        return this.prisma.promotion.delete({ where: { id } });
    }
}

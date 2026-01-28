import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SupplierService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateSupplierDto) {
        return this.prisma.supplier.create({ data: dto });
    }

    async findAll() {
        return this.prisma.supplier.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }

    async findOne(id: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: {
                products: true,
                purchaseOrders: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!supplier) throw new NotFoundException('Supplier not found');
        return supplier;
    }

    async update(id: string, dto: any) {
        return this.prisma.supplier.update({
            where: { id },
            data: dto
        });
    }

    async remove(id: string) {
        return this.prisma.supplier.delete({ where: { id } });
    }
}

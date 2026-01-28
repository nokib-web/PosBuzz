import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCustomerDto) {
        if (dto.email) {
            const existing = await this.prisma.customer.findUnique({
                where: { email: dto.email },
            });
            if (existing) {
                throw new ConflictException('Customer with this email already exists');
            }
        }

        return this.prisma.customer.create({
            data: dto,
        });
    }

    async findAll() {
        return this.prisma.customer.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                sales: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return customer;
    }

    async update(id: string, dto: any) {
        await this.findOne(id);
        return this.prisma.customer.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.customer.delete({
            where: { id },
        });
    }
}

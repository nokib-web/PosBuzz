import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() dto: CreateSupplierDto) {
        return this.supplierService.create(dto);
    }

    @Get()
    findAll() {
        return this.supplierService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.supplierService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() dto: any) {
        return this.supplierService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.supplierService.remove(id);
    }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) { }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() dto: CreatePromotionDto) {
        return this.promotionService.create(dto);
    }

    @Get()
    findAll() {
        return this.promotionService.findAll();
    }

    @Get('active')
    findActive() {
        return this.promotionService.findActive();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.promotionService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() dto: any) {
        return this.promotionService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.promotionService.remove(id);
    }
}

import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SaleController {
    constructor(private readonly saleService: SaleService) { }

    @Post()
    create(@Req() req, @Body() createSaleDto: CreateSaleDto) {
        // req.user is populated by JwtAuthGuard's strategy validation
        return this.saleService.create(req.user.id, createSaleDto);
    }

    @Get()
    async getSales(
        @Req() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        return this.saleService.getSales(page, limit);
    }

    @Get(':id')
    async getSaleById(@Req() req, @Param('id') id: string) {
        return this.saleService.getSaleById(id);
    }
}

import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { ProductModule } from '../product/product.module';

@Module({
    imports: [ProductModule],
    controllers: [SaleController],
    providers: [SaleService],
})
export class SaleModule { }

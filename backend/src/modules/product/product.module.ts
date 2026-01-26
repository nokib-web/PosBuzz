import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
    imports: [RedisModule],
    controllers: [ProductController],
    providers: [ProductService],
})
export class ProductModule { }

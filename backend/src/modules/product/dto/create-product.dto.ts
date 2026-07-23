import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name: string;

    @IsString()
    @IsNotEmpty()
    sku: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    price: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    stock_quantity: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    costPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    lowStockThreshold?: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    supplierId?: string;
}

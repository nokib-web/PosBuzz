import { IsNotEmpty, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsNumber()
    @Min(0.01)
    price: number;

    @IsNumber()
    @Min(0)
    stock_quantity: number;
}

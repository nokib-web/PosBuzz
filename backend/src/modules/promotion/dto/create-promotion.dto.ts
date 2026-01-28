import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { PromoType } from '@prisma/client';

export class CreatePromotionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(PromoType)
    type: PromoType;

    @IsNumber()
    value: number;

    @IsNumber()
    @IsOptional()
    minSpend?: number;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}

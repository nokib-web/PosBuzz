import { Product } from './product.types';

export interface SaleItem {
    id: string;
    saleId: string;
    productId: string;
    product: Product;
    quantity: number;
    price_at_sale: number;
    subtotal: number;
}

export interface Sale {
    id: string;
    total_amount: number;
    userId: string;
    createdAt: string;
    items: SaleItem[];
    _count?: {
        items: number;
    };
}

export interface CreateSaleItemDto {
    productId: string;
    quantity: number;
}

export interface CreateSaleDto {
    items: CreateSaleItemDto[];
}

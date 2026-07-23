export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    costPrice?: number;
    stock_quantity: number;
    unit?: string;
    category?: string;
    lowStockThreshold?: number;
    supplierId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDto {
    name: string;
    sku: string;
    price: number;
    costPrice?: number;
    stock_quantity: number;
    unit?: string;
    category?: string;
    lowStockThreshold?: number;
    supplierId?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

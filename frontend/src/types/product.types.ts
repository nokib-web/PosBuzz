export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDto {
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

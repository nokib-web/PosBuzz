export interface User {
    id: string;
    email: string;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface Sale {
    id: string;
    total_amount: number;
    userId: string;
    createdAt: string;
    items: SaleItem[];
}

export interface SaleItem {
    id: string;
    saleId: string;
    productId: string;
    product: Product;
    quantity: number;
    price_at_sale: number;
    subtotal: number;
}

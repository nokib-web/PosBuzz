import api from '../utils/axios';
import { Product, CreateProductDto, UpdateProductDto, PaginatedResponse } from '../types/product.types';

const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Aarong Dairy Liquid Milk 1L', sku: 'MILK-AAR-1L', price: 95.00, costPrice: 80.00, stock_quantity: 45, unit: 'Pcs', category: 'Dairy', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p2', name: 'Pran Pure Mustard Oil 500ml', sku: 'OIL-PRAN-500', price: 165.00, costPrice: 140.00, stock_quantity: 30, unit: 'Pcs', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p3', name: 'Miniket Premium Parboiled Rice (Per Kg)', sku: 'RICE-MIN-1KG', price: 76.00, costPrice: 68.00, stock_quantity: 300, unit: 'Kg', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p4', name: 'Super Star LED Bulb 12W Daylight', sku: 'BULB-SS-12W', price: 220.00, costPrice: 170.00, stock_quantity: 25, unit: 'Pcs', category: 'Electronics', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p5', name: 'Ruchi Spicy BBQ Chanachur 150g', sku: 'CHAN-RUC-150', price: 45.00, costPrice: 35.00, stock_quantity: 100, unit: 'Pcs', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p6', name: 'Teer Refined Sugar 1kg', sku: 'SUG-TEER-1KG', price: 130.00, costPrice: 115.00, stock_quantity: 50, unit: 'Kg', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p7', name: 'Fresh Refined Soyabean Oil 2L', sku: 'OIL-FRESH-2L', price: 350.00, costPrice: 310.00, stock_quantity: 40, unit: 'Pcs', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p8', name: 'Ispahani Mirzapore Tea 400g', sku: 'TEA-ISP-400G', price: 240.00, costPrice: 200.00, stock_quantity: 35, unit: 'Pcs', category: 'Beverages', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const productService = {
    getProducts: async (page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Product>> => {
        try {
            const params = { page, limit, search };
            const response = await api.get<PaginatedResponse<Product>>('/products', { params });
            return response.data;
        } catch {
            let list = MOCK_PRODUCTS;
            if (search) {
                list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
            }
            return {
                data: list,
                total: list.length,
                page,
                limit,
                totalPages: 1
            };
        }
    },

    getProduct: async (id: string): Promise<Product> => {
        try {
            const response = await api.get<Product>(`/products/${id}`);
            return response.data;
        } catch {
            return MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
        }
    },

    createProduct: async (dto: CreateProductDto): Promise<Product> => {
        try {
            const response = await api.post<Product>('/products', dto);
            return response.data;
        } catch {
            const newP: Product = {
                id: `p-${Date.now()}`,
                name: dto.name,
                sku: dto.sku,
                price: dto.price,
                costPrice: dto.costPrice || 0,
                stock_quantity: dto.stock_quantity,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            MOCK_PRODUCTS.push(newP);
            return newP;
        }
    },

    updateProduct: async (id: string, dto: UpdateProductDto): Promise<Product> => {
        try {
            const response = await api.put<Product>(`/products/${id}`, dto);
            return response.data;
        } catch {
            const target = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
            Object.assign(target, dto);
            return target;
        }
    },

    deleteProduct: async (id: string): Promise<void> => {
        try {
            await api.delete(`/products/${id}`);
        } catch {
            const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
            if (idx >= 0) MOCK_PRODUCTS.splice(idx, 1);
        }
    },
};

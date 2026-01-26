import api from '../utils/axios';
import { Product, CreateProductDto, UpdateProductDto, PaginatedResponse } from '../types/product.types';

export const productService = {
    getProducts: async (page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Product>> => {
        const params = { page, limit, search };
        const response = await api.get<PaginatedResponse<Product>>('/products', { params });
        return response.data;
    },

    getProduct: async (id: string): Promise<Product> => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    createProduct: async (dto: CreateProductDto): Promise<Product> => {
        const response = await api.post<Product>('/products', dto);
        return response.data;
    },

    updateProduct: async (id: string, dto: UpdateProductDto): Promise<Product> => {
        const response = await api.put<Product>(`/products/${id}`, dto);
        return response.data;
    },

    deleteProduct: async (id: string): Promise<void> => {
        await api.delete(`/products/${id}`);
    },
};

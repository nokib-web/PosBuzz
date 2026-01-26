import api from '../utils/axios';
import { Sale, CreateSaleDto } from '../types/sale.types';
import { PaginatedResponse } from '../types/product.types';

export const saleService = {
    getSales: async (page = 1, limit = 10): Promise<PaginatedResponse<Sale>> => {
        const params = { page, limit };
        const response = await api.get<PaginatedResponse<Sale>>('/sales', { params });
        return response.data;
    },

    getSale: async (id: string): Promise<Sale> => {
        const response = await api.get<Sale>(`/sales/${id}`);
        return response.data;
    },

    createSale: async (dto: CreateSaleDto): Promise<Sale> => {
        const response = await api.post<Sale>('/sales', dto);
        return response.data;
    },
};

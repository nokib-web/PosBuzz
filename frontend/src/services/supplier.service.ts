import api from '../utils/axios';

export const supplierService = {
    async getAll() {
        const response = await api.get('/suppliers');
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/suppliers/${id}`);
        return response.data;
    },

    async create(supplierData: any) {
        const response = await api.post('/suppliers', supplierData);
        return response.data;
    },

    async update(id: string, supplierData: any) {
        const response = await api.patch(`/suppliers/${id}`, supplierData);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/suppliers/${id}`);
        return response.data;
    }
};

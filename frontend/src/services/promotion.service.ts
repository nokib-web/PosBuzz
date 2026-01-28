import api from '../utils/axios';

export const promotionService = {
    async getAll() {
        const response = await api.get('/promotions');
        return response.data;
    },

    async getActive() {
        const response = await api.get('/promotions/active');
        return response.data;
    },

    async create(promoData: any) {
        const response = await api.post('/promotions', promoData);
        return response.data;
    },

    async update(id: string, promoData: any) {
        const response = await api.patch(`/promotions/${id}`, promoData);
        return response.data;
    }
};

import api from '../utils/axios';

export const analyticsService = {
    getSummary: async () => {
        const response = await api.get('/analytics/summary');
        return response.data;
    },

    getTrend: async (days: number = 7) => {
        const response = await api.get('/analytics/trend', {
            params: { days },
        });
        return response.data;
    },

    getTopProducts: async (limit: number = 5) => {
        const response = await api.get('/analytics/top-products', {
            params: { limit },
        });
        return response.data;
    },

    getStaffPerformance: async () => {
        const response = await api.get('/analytics/staff-performance');
        return response.data;
    },
};

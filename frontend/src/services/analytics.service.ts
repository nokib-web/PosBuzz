import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const analyticsService = {
    getSummary: async () => {
        const response = await axios.get(`${API_URL}/analytics/summary`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    getTrend: async (days: number = 7) => {
        const response = await axios.get(`${API_URL}/analytics/trend`, {
            params: { days },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    getTopProducts: async (limit: number = 5) => {
        const response = await axios.get(`${API_URL}/analytics/top-products`, {
            params: { limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    getStaffPerformance: async () => {
        const response = await axios.get(`${API_URL}/analytics/staff-performance`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },
};

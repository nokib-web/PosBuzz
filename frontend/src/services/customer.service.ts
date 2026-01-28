import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const customerService = {
    getCustomers: async () => {
        const response = await axios.get(`${API_URL}/customers`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    getCustomer: async (id: string) => {
        const response = await axios.get(`${API_URL}/customers/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    createCustomer: async (data: any) => {
        const response = await axios.post(`${API_URL}/customers`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    updateCustomer: async (id: string, data: any) => {
        const response = await axios.patch(`${API_URL}/customers/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },

    deleteCustomer: async (id: string) => {
        const response = await axios.delete(`${API_URL}/customers/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    },
};

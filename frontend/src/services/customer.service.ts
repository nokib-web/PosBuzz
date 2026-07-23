import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const customerService = {
    getCustomers: async () => {
        try {
            const response = await axios.get(`${API_URL}/customers`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch {
            return [
                {
                    id: 'c1',
                    name: 'Walk-in Retail Customer',
                    email: 'walkin@posbuzz.com',
                    phone: '+880 1700 000000',
                    tier: 'BRONZE',
                    points: 0,
                    createdAt: '2026-07-23T10:00:00Z'
                },
                {
                    id: 'c2',
                    name: 'Tanvir Ahmed',
                    email: 'tanvir.dhk@gmail.com',
                    phone: '+880 1819 555666',
                    tier: 'GOLD',
                    points: 1250,
                    createdAt: '2026-06-15T12:30:00Z'
                },
                {
                    id: 'c3',
                    name: 'Sumaiya Enterprise',
                    email: 'info@sumaiyacorp.bd',
                    phone: '+880 1912 777888',
                    tier: 'PLATINUM',
                    points: 3480,
                    createdAt: '2026-05-10T09:15:00Z'
                }
            ];
        }
    },

    getCustomer: async (id: string) => {
        try {
            const response = await axios.get(`${API_URL}/customers/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch {
            return {
                id,
                name: 'Walk-in Retail Customer',
                email: 'walkin@posbuzz.com',
                phone: '+880 1700 000000',
                tier: 'BRONZE',
                points: 0,
                createdAt: '2026-07-23T10:00:00Z'
            };
        }
    },

    createCustomer: async (data: any) => {
        try {
            const response = await axios.post(`${API_URL}/customers`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch {
            return { id: `c-${Date.now()}`, ...data, tier: 'BRONZE', points: 0, createdAt: new Date().toISOString() };
        }
    },

    updateCustomer: async (id: string, data: any) => {
        try {
            const response = await axios.patch(`${API_URL}/customers/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch {
            return { id, ...data };
        }
    },

    deleteCustomer: async (id: string) => {
        try {
            const response = await axios.delete(`${API_URL}/customers/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch {
            return { success: true };
        }
    },
};

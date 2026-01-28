const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const promotionService = {
    async getAll() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/promotions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch promotions');
        return response.json();
    },

    async getActive() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/promotions/active`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch active promotions');
        return response.json();
    },

    async create(promoData: any) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/promotions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(promoData)
        });
        if (!response.ok) throw new Error('Failed to create promotion');
        return response.json();
    },

    async update(id: string, promoData: any) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/promotions/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(promoData)
        });
        if (!response.ok) throw new Error('Failed to update promotion');
        return response.json();
    }
};

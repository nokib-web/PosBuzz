const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const supplierService = {
    async getAll() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/suppliers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch suppliers');
        return response.json();
    },

    async getById(id: string) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch supplier details');
        return response.json();
    },

    async create(supplierData: any) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/suppliers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(supplierData)
        });
        if (!response.ok) throw new Error('Failed to create supplier');
        return response.json();
    },

    async update(id: string, supplierData: any) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(supplierData)
        });
        if (!response.ok) throw new Error('Failed to update supplier');
        return response.json();
    },

    async delete(id: string) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete supplier');
        return response.json();
    }
};

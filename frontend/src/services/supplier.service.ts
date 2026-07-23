import api from '../utils/axios';

const MOCK_SUPPLIERS = [
    { id: 's1', name: 'Aarong Foods & Dairy Ltd', email: 'supply@aarongdairy.com', phone: '+880 1711 888999', address: 'Tejgaon Industrial Area, Dhaka', createdAt: '2026-01-10T10:00:00Z' },
    { id: 's2', name: 'Pran Agro Business Group', email: 'orders@prangroup.com', phone: '+880 1819 111222', address: 'PRAN Center, Badda, Dhaka', createdAt: '2026-02-15T12:00:00Z' },
    { id: 's3', name: 'Square Consumer Products', email: 'contact@squareconsumer.com', phone: '+880 1912 333444', address: 'Square Centre, Uttara, Dhaka', createdAt: '2026-03-01T09:00:00Z' },
    { id: 's4', name: 'Super Star Group Electronics', email: 'sales@superstargroup.bd', phone: '+880 1714 555666', address: 'Motijheel C/A, Dhaka', createdAt: '2026-04-10T11:00:00Z' },
    { id: 's5', name: 'Ispahani Tea Bangladesh', email: 'tea@ispahanibd.com', phone: '+880 1817 777888', address: 'Agrabad C/A, Chittagong', createdAt: '2026-05-05T14:00:00Z' },
];

export const supplierService = {
    async getAll() {
        try {
            const response = await api.get('/suppliers');
            return response.data;
        } catch {
            return MOCK_SUPPLIERS;
        }
    },

    async getById(id: string) {
        try {
            const response = await api.get(`/suppliers/${id}`);
            return response.data;
        } catch {
            return MOCK_SUPPLIERS.find(s => s.id === id) || MOCK_SUPPLIERS[0];
        }
    },

    async create(supplierData: any) {
        try {
            const response = await api.post('/suppliers', supplierData);
            return response.data;
        } catch {
            const newS = { id: `s-${Date.now()}`, ...supplierData, createdAt: new Date().toISOString() };
            MOCK_SUPPLIERS.push(newS);
            return newS;
        }
    },

    async update(id: string, supplierData: any) {
        try {
            const response = await api.patch(`/suppliers/${id}`, supplierData);
            return response.data;
        } catch {
            const target = MOCK_SUPPLIERS.find(s => s.id === id) || MOCK_SUPPLIERS[0];
            Object.assign(target, supplierData);
            return target;
        }
    },

    async delete(id: string) {
        try {
            const response = await api.delete(`/suppliers/${id}`);
            return response.data;
        } catch {
            const idx = MOCK_SUPPLIERS.findIndex(s => s.id === id);
            if (idx >= 0) MOCK_SUPPLIERS.splice(idx, 1);
            return { success: true };
        }
    }
};

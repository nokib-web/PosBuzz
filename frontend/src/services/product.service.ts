import api from '../utils/axios';
import { Product, CreateProductDto, UpdateProductDto, PaginatedResponse } from '../types/product.types';

const INITIAL_MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Aarong Dairy Liquid Milk 1L', sku: 'MILK-AAR-1L', price: 95.00, costPrice: 80.00, stock_quantity: 45, unit: 'Pcs', category: 'Dairy', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p2', name: 'Pran Pure Mustard Oil 500ml', sku: 'OIL-PRAN-500', price: 165.00, costPrice: 140.00, stock_quantity: 30, unit: 'Pcs', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p3', name: 'Miniket Premium Parboiled Rice (Per Kg)', sku: 'RICE-MIN-1KG', price: 76.00, costPrice: 68.00, stock_quantity: 300, unit: 'Kg', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p4', name: 'Super Star LED Bulb 12W Daylight', sku: 'BULB-SS-12W', price: 220.00, costPrice: 170.00, stock_quantity: 25, unit: 'Pcs', category: 'Electronics', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p5', name: 'Ruchi Spicy BBQ Chanachur 150g', sku: 'CHAN-RUC-150', price: 45.00, costPrice: 35.00, stock_quantity: 100, unit: 'Pcs', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p6', name: 'Teer Refined Sugar 1kg', sku: 'SUG-TEER-1KG', price: 130.00, costPrice: 115.00, stock_quantity: 50, unit: 'Kg', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p7', name: 'Fresh Refined Soyabean Oil 2L', sku: 'OIL-FRESH-2L', price: 350.00, costPrice: 310.00, stock_quantity: 40, unit: 'Pcs', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p8', name: 'Ispahani Mirzapore Tea 400g', sku: 'TEA-ISP-400G', price: 240.00, costPrice: 200.00, stock_quantity: 35, unit: 'Pcs', category: 'Beverages', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const getStoredProducts = (): Product[] => {
    try {
        const saved = localStorage.getItem('posbuzz_products_store');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {}
    return [...INITIAL_MOCK_PRODUCTS];
};

const saveProductsToStorage = (products: Product[]) => {
    try {
        localStorage.setItem('posbuzz_products_store', JSON.stringify(products));
    } catch {}
};

let liveProductsStore: Product[] = getStoredProducts();

export const productService = {
    getProducts: async (page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Product>> => {
        try {
            const params = { page, limit, search };
            const response = await api.get<PaginatedResponse<Product>>('/products', { params });
            if (response.data && response.data.data && response.data.data.length > 0) {
                return response.data;
            }
            return productService.getPaginatedLocalProducts(page, limit, search);
        } catch {
            return productService.getPaginatedLocalProducts(page, limit, search);
        }
    },

    getPaginatedLocalProducts: (page = 1, limit = 10, search?: string): PaginatedResponse<Product> => {
        let list = [...liveProductsStore];
        if (search) {
            const term = search.toLowerCase().trim();
            list = list.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
        }

        const startIndex = (page - 1) * limit;
        const pageData = list.slice(startIndex, startIndex + limit);

        return {
            data: pageData,
            total: list.length,
            page,
            limit,
            totalPages: Math.ceil(list.length / limit) || 1
        };
    },

    getProduct: async (id: string): Promise<Product> => {
        try {
            const response = await api.get<Product>(`/products/${id}`);
            return response.data;
        } catch {
            return liveProductsStore.find(p => p.id === id) || liveProductsStore[0];
        }
    },

    createProduct: async (dto: CreateProductDto): Promise<Product> => {
        const newP: Product = {
            id: `p-${Date.now()}`,
            name: dto.name,
            sku: dto.sku || `SKU-${Date.now().toString().slice(-4)}`,
            price: Number(dto.price || 0),
            costPrice: Number(dto.costPrice || 0),
            stock_quantity: Number(dto.stock_quantity || 0),
            unit: dto.unit || 'Pcs',
            category: dto.category || 'General',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            const response = await api.post<Product>('/products', dto);
            const created = response.data || newP;
            liveProductsStore.unshift(created);
            saveProductsToStorage(liveProductsStore);
            return created;
        } catch {
            liveProductsStore.unshift(newP);
            saveProductsToStorage(liveProductsStore);
            return newP;
        }
    },

    updateProduct: async (id: string, dto: UpdateProductDto): Promise<Product> => {
        try {
            const response = await api.put<Product>(`/products/${id}`, dto);
            const target = liveProductsStore.find(p => p.id === id);
            if (target) Object.assign(target, dto);
            saveProductsToStorage(liveProductsStore);
            return response.data || target || (dto as any);
        } catch {
            const target = liveProductsStore.find(p => p.id === id) || liveProductsStore[0];
            Object.assign(target, dto);
            saveProductsToStorage(liveProductsStore);
            return target;
        }
    },

    deleteProduct: async (id: string): Promise<void> => {
        try {
            await api.delete(`/products/${id}`);
        } catch {}
        const idx = liveProductsStore.findIndex(p => p.id === id);
        if (idx >= 0) liveProductsStore.splice(idx, 1);
        saveProductsToStorage(liveProductsStore);
    },

    bulkImportProducts: async (dtos: CreateProductDto[]): Promise<number> => {
        const newItems: Product[] = dtos.map((dto, index) => ({
            id: `bulk-${Date.now()}-${index}`,
            name: dto.name,
            sku: dto.sku || `SKU-${index + 100}`,
            price: Number(dto.price || 100),
            costPrice: Number(dto.costPrice || 80),
            stock_quantity: Number(dto.stock_quantity || 10),
            unit: dto.unit || 'Pcs',
            category: dto.category || 'General',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));

        try {
            await api.post('/products/bulk', { items: dtos });
        } catch {}

        liveProductsStore.unshift(...newItems);
        saveProductsToStorage(liveProductsStore);
        return dtos.length;
    }
};

import api from '../utils/axios';
import { Product, CreateProductDto, UpdateProductDto, PaginatedResponse } from '../types/product.types';

// ─── Local fallback store ────────────────────────────────────────────────────
const STORAGE_KEY = 'posbuzz_products_store';
const CLEARED_FLAG_KEY = 'posbuzz_products_cleared';

const getLocalProducts = (): Product[] => {
    try {
        if (localStorage.getItem(CLEARED_FLAG_KEY) === 'true') return [];
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {}
    return [];
};

const saveLocalProducts = (products: Product[]) => {
    try {
        if (products.length > 0) localStorage.removeItem(CLEARED_FLAG_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {}
};

// In-memory cache
let localCache: Product[] = getLocalProducts();

// ─── Public Service ──────────────────────────────────────────────────────────

export const productService = {

    /**
     * Fetch paginated products.
     * Tries backend API first, falls back to localCache if unavailable.
     */
    getProducts: async (page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Product>> => {
        try {
            const params: Record<string, unknown> = { page, limit };
            if (search) params.search = search;

            const response = await api.get<PaginatedResponse<Product>>('/products', { params, timeout: 8000 });
            const data = response.data;

            if (data && Array.isArray(data.data)) {
                    if (page === 1 && !search) {
                    localCache = data.data;
                    saveLocalProducts(localCache);
                }
                return data;
            }
            throw new Error('Invalid API response');
        } catch {
            return productService._getPaginatedLocal(page, limit, search);
        }
    },

    _getPaginatedLocal: (page = 1, limit = 10, search?: string): PaginatedResponse<Product> => {
        let list = [...localCache];
        if (search) {
            const term = search.toLowerCase().trim();
            list = list.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.sku.toLowerCase().includes(term) ||
                (p.category || '').toLowerCase().includes(term)
            );
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
            const response = await api.get<Product>(`/products/${id}`, { timeout: 6000 });
            return response.data;
        } catch {
            return localCache.find(p => p.id === id) || localCache[0];
        }
    },

    /**
     * Create a single product.
     * Saves to backend DB first, falls back to localStorage if offline.
     */
    createProduct: async (dto: CreateProductDto): Promise<Product> => {
        try {
            const response = await api.post<Product>('/products', dto, { timeout: 10000 });
            const created = response.data;
            localCache.unshift(created);
            saveLocalProducts(localCache);
            return created;
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr?.response?.status === 409) throw err;

            const newP: Product = {
                id: `local-${Date.now()}`,
                name: dto.name,
                sku: dto.sku || `SKU-${Date.now().toString().slice(-5)}`,
                price: Number(dto.price || 0),
                costPrice: Number(dto.costPrice || 0),
                stock_quantity: Number(dto.stock_quantity || 0),
                unit: dto.unit || 'Pcs',
                category: dto.category || 'General',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            localCache.unshift(newP);
            saveLocalProducts(localCache);
            return newP;
        }
    },

    updateProduct: async (id: string, dto: UpdateProductDto): Promise<Product> => {
        try {
            const response = await api.put<Product>(`/products/${id}`, dto, { timeout: 10000 });
            const idx = localCache.findIndex(p => p.id === id);
            if (idx >= 0) Object.assign(localCache[idx], dto);
            saveLocalProducts(localCache);
            return response.data;
        } catch {
            const target = localCache.find(p => p.id === id);
            if (target) Object.assign(target, dto);
            saveLocalProducts(localCache);
            return target || (dto as unknown as Product);
        }
    },

    deleteProduct: async (id: string): Promise<void> => {
        try {
            await api.delete(`/products/${id}`, { timeout: 8000 });
        } catch {
        }
        const idx = localCache.findIndex(p => p.id === id);
        if (idx >= 0) localCache.splice(idx, 1);
        saveLocalProducts(localCache);
    },

    /**
     * Bulk import products from CSV.
     * Sends ALL products in a SINGLE request → POST /products/bulk
     * Backend uses prisma.createMany() — one SQL query.
     */
    bulkImportProducts: async (dtos: CreateProductDto[]): Promise<number> => {
        if (dtos.length === 0) return 0;

        try {
            const response = await api.post<{ inserted: number; skipped: number; total: number }>(
                '/products/bulk',
                { items: dtos },
                { timeout: 120000 }
            );

            const inserted = response.data?.inserted ?? 0;

            if (inserted > 0) {
                localCache = [];
                localStorage.removeItem(STORAGE_KEY);
            }

            return inserted;
        } catch {

            // Offline fallback
            const newItems: Product[] = dtos.map((dto, index) => ({
                id: `local-bulk-${Date.now()}-${index}`,
                name: dto.name,
                sku: dto.sku || `SKU-${Date.now()}-${index}`,
                price: Number(dto.price || 100),
                costPrice: Number(dto.costPrice || 80),
                stock_quantity: Number(dto.stock_quantity || 10),
                unit: dto.unit || 'Pcs',
                category: dto.category || 'General',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }));
            localCache.unshift(...newItems);
            saveLocalProducts(localCache);
            return dtos.length;
        }
    },

    clearAllProducts: (): void => {
        localCache = [];
        try {
            localStorage.setItem(CLEARED_FLAG_KEY, 'true');
            localStorage.removeItem(STORAGE_KEY);
        } catch {}
    },

};

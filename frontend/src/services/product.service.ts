import api from '../utils/axios';
import { Product, CreateProductDto, UpdateProductDto, PaginatedResponse } from '../types/product.types';

// ─── Local fallback store (used only when backend is unreachable) ───────────
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

// In-memory cache (refreshed from API on each getProducts call)
let localCache: Product[] = getLocalProducts();

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Check if the backend API is reachable */
let _backendAvailable: boolean | null = null;

const isBackendAvailable = async (): Promise<boolean> => {
    if (_backendAvailable !== null) return _backendAvailable;
    try {
        await api.get('/health', { timeout: 5000 });
        _backendAvailable = true;
    } catch {
        _backendAvailable = false;
    }
    return _backendAvailable;
};

// ─── Public Service ──────────────────────────────────────────────────────────

export const productService = {

    /**
     * Fetch paginated products.
     * → Tries backend API first.
     * → Falls back to localCache only if API is unavailable.
     */
    getProducts: async (page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Product>> => {
        try {
            const params: any = { page, limit };
            if (search) params.search = search;

            const response = await api.get<PaginatedResponse<Product>>('/products', { params, timeout: 8000 });
            const data = response.data;

            if (data && Array.isArray(data.data)) {
                // Refresh local cache with fresh API data
                if (page === 1 && !search) {
                    // On first page load without search, sync local cache
                    localCache = data.data;
                    saveLocalProducts(localCache);
                }
                _backendAvailable = true;
                return data;
            }
            throw new Error('Invalid API response');
        } catch {
            _backendAvailable = false;
            // Fallback to local cache
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
     * → Saves to backend database first.
     * → Falls back to localStorage if offline.
     */
    createProduct: async (dto: CreateProductDto): Promise<Product> => {
        try {
            const response = await api.post<Product>('/products', dto, { timeout: 10000 });
            const created = response.data;
            _backendAvailable = true;
            // Also update local cache
            localCache.unshift(created);
            saveLocalProducts(localCache);
            return created;
        } catch (err: any) {
            // Conflict (duplicate SKU) — re-throw so UI can show proper error
            if (err?.response?.status === 409) throw err;

            _backendAvailable = false;
            // Offline fallback: save to localStorage
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
            _backendAvailable = true;
            // Update local cache
            const idx = localCache.findIndex(p => p.id === id);
            if (idx >= 0) Object.assign(localCache[idx], dto);
            saveLocalProducts(localCache);
            return response.data;
        } catch {
            _backendAvailable = false;
            const target = localCache.find(p => p.id === id);
            if (target) Object.assign(target, dto);
            saveLocalProducts(localCache);
            return target || (dto as any);
        }
    },

    deleteProduct: async (id: string): Promise<void> => {
        try {
            await api.delete(`/products/${id}`, { timeout: 8000 });
            _backendAvailable = true;
        } catch {
            _backendAvailable = false;
        }
        // Always remove from local cache
        const idx = localCache.findIndex(p => p.id === id);
        if (idx >= 0) localCache.splice(idx, 1);
        saveLocalProducts(localCache);
    },

    /**
     * Bulk import products from CSV.
     * → Sends to backend one by one (batched).
     * → Falls back to localStorage if offline.
     * Returns count of successfully imported products.
     */
    bulkImportProducts: async (dtos: CreateProductDto[]): Promise<number> => {
        const useBackend = await isBackendAvailable();

        if (useBackend) {
            let successCount = 0;
            // Process in batches of 10 to avoid overwhelming the server
            const BATCH_SIZE = 10;
            for (let i = 0; i < dtos.length; i += BATCH_SIZE) {
                const batch = dtos.slice(i, i + BATCH_SIZE);
                await Promise.allSettled(
                    batch.map(async (dto) => {
                        try {
                            const response = await api.post<Product>('/products', dto, { timeout: 15000 });
                            localCache.unshift(response.data);
                            successCount++;
                        } catch {
                            // SKU duplicate or other error — skip
                        }
                    })
                );
            }
            saveLocalProducts(localCache);
            return successCount;
        } else {
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

    /** Force reset the backend availability cache (call after reconnecting) */
    resetAvailabilityCache: () => {
        _backendAvailable = null;
    },
};

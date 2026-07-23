import api from '../utils/axios';
import { Product, CreateProductDto, UpdateProductDto, PaginatedResponse } from '../types/product.types';

const generate1000SuperstoreProducts = (): Product[] => {
    const signature8: Product[] = [
        { id: 'p-sig-1', name: 'Aarong Dairy Liquid Milk 1L', sku: 'MILK-AAR-1L', price: 95.00, costPrice: 80.00, stock_quantity: 45, unit: 'Pcs', category: 'Dairy', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'p-sig-2', name: 'Pran Pure Mustard Oil 500ml', sku: 'OIL-PRAN-500', price: 165.00, costPrice: 140.00, stock_quantity: 30, unit: 'Pcs', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'p-sig-3', name: 'Miniket Premium Parboiled Rice (Per Kg)', sku: 'RICE-MIN-1KG', price: 76.00, costPrice: 68.00, stock_quantity: 300, unit: 'Kg', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'p-sig-4', name: 'Super Star LED Bulb 12W Daylight', sku: 'BULB-SS-12W', price: 220.00, costPrice: 170.00, stock_quantity: 25, unit: 'Pcs', category: 'Electronics', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'p-sig-5', name: 'Ruchi Spicy BBQ Chanachur 150g', sku: 'CHAN-RUC-150', price: 45.00, costPrice: 35.00, stock_quantity: 100, unit: 'Pcs', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'p-sig-6', name: 'Teer Refined Sugar 1kg', sku: 'SUG-TEER-1KG', price: 130.00, costPrice: 115.00, stock_quantity: 50, unit: 'Kg', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'p-sig-7', name: 'Fresh Refined Soyabean Oil 2L', sku: 'OIL-FRESH-2L', price: 350.00, costPrice: 310.00, stock_quantity: 40, unit: 'Pcs', category: 'Groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'p-sig-8', name: 'Ispahani Mirzapore Tea 400g', sku: 'TEA-ISP-400G', price: 240.00, costPrice: 200.00, stock_quantity: 35, unit: 'Pcs', category: 'Beverages', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    const baseItems = [
        { name: 'Miniket Rice Premium', category: 'Groceries', price: 76, unit: 'Kg', skuPrefix: 'RICE-MIN' },
        { name: 'Nazirshail Rice Standard', category: 'Groceries', price: 92, unit: 'Kg', skuPrefix: 'RICE-NAZ' },
        { name: 'Chinigura Aromatic Rice', category: 'Groceries', price: 145, unit: 'Kg', skuPrefix: 'RICE-CHI' },
        { name: 'ACI Pure Vacuum Salt', category: 'Groceries', price: 38, unit: 'Kg', skuPrefix: 'SALT-ACI' },
        { name: 'Teer Refined White Sugar', category: 'Groceries', price: 130, unit: 'Kg', skuPrefix: 'SUG-TEER' },
        { name: 'Rupchanda Fortified Soyabean Oil', category: 'Groceries', price: 175, unit: 'Litre', skuPrefix: 'OIL-RUP' },
        { name: 'Fresh Refined Soyabean Oil', category: 'Groceries', price: 170, unit: 'Litre', skuPrefix: 'OIL-FRESH' },
        { name: 'Pran Pure Mustard Oil', category: 'Groceries', price: 330, unit: 'Litre', skuPrefix: 'OIL-MUST' },
        { name: 'Aarong Pasteurized Liquid Milk', category: 'Dairy', price: 95, unit: 'Pcs', skuPrefix: 'MILK-AAR' },
        { name: 'Dano Full Cream Milk Powder', category: 'Dairy', price: 860, unit: 'Pcs', skuPrefix: 'MILK-DANO' },
        { name: 'Ispahani Mirzapore Black Tea', category: 'Beverages', price: 240, unit: 'Pcs', skuPrefix: 'TEA-ISP' },
        { name: 'Coca-Cola Refreshing Carbonated Drink', category: 'Beverages', price: 110, unit: 'Pcs', skuPrefix: 'COKE-REG' },
        { name: 'Super Star High Energy LED Bulb', category: 'Electronics', price: 220, unit: 'Pcs', skuPrefix: 'BULB-SS' },
        { name: 'Ruchi Spicy Crispy BBQ Chanachur', category: 'Groceries', price: 45, unit: 'Pcs', skuPrefix: 'CHAN-RUC' },
        { name: 'Bombay Sweets Potato Crackers', category: 'Bakery', price: 20, unit: 'Pcs', skuPrefix: 'SNK-BS' },
        { name: 'Lux Soft Rose Beauty Soap', category: 'Personal Care', price: 65, unit: 'Pcs', skuPrefix: 'SOAP-LUX' },
        { name: 'Sunsilk Black Shine Shampoo', category: 'Personal Care', price: 280, unit: 'Pcs', skuPrefix: 'HAIR-SUN' },
        { name: 'CloseUp Red Hot Fresh Toothpaste', category: 'Personal Care', price: 140, unit: 'Pcs', skuPrefix: 'DENT-CLO' },
    ];

    const variants = [
        'Classic 100g', 'Express 250g', 'Gold 500ml', 'Organic 1L', 'Pack of 2', 'Family Pack', 'Special Edition', 'Refill 750ml',
        'Standard 1Kg', 'Select 500ml', 'Ultra Clean 1L', 'Value Pack', 'Premium 2Kg', 'Supreme 5L', 'Eco Pack 250g'
    ];

    const products: Product[] = [...signature8];

    let count = 1;
    for (let i = 0; i < 65; i++) {
        for (const base of baseItems) {
            if (count > 1000) break;
            const variant = variants[count % variants.length];
            const pId = `p-${count}`;
            const sku = `${base.skuPrefix}-${count.toString().padStart(4, '0')}`;
            const price = Math.round(base.price * (0.8 + (count % 15) * 0.1));
            const costPrice = Math.round(price * 0.82);
            const stock = Math.round(15 + (count * 7) % 450);

            products.push({
                id: pId,
                name: `${base.name} ${variant}`,
                sku: sku,
                price: price,
                costPrice: costPrice,
                stock_quantity: stock,
                unit: base.unit,
                category: base.category,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            count++;
        }
    }
    return products;
};

const INITIAL_MOCK_PRODUCTS: Product[] = generate1000SuperstoreProducts();

const getStoredProducts = (): Product[] => {
    try {
        const saved = localStorage.getItem('posbuzz_products_store');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length >= 1000) return parsed;
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
            if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 50) {
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

        liveProductsStore.unshift(...newItems);
        saveProductsToStorage(liveProductsStore);
        return dtos.length;
    },

    clearAllProducts: (): void => {
        liveProductsStore = [];
        try {
            localStorage.removeItem('posbuzz_products_store');
        } catch {}
    }
};

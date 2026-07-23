import React, { useState, useEffect, useRef } from 'react';
import {
    Select,
    InputNumber,
    Button,
    Card,
    Table,
    Typography,
    Divider,
    Row,
    Col,
    message,
    Modal,
    Space,
    Alert,
    Empty,
    Radio,
    Tag,
    Input
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    ShoppingCartOutlined,
    ScanOutlined,
    PrinterOutlined,
    FilePdfOutlined,
    CreditCardOutlined,
    MoneyCollectOutlined,
    ThunderboltOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { saleService } from '../../services/sale.service';
import { customerService } from '../../services/customer.service';
import { promotionService } from '../../services/promotion.service';
import { supplierService } from '../../services/supplier.service';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    stock: number;
    sku: string;
}

const CreateSalePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { formatAmount } = useCurrency();
    const { isDark } = useTheme();

    const isAdmin = user?.role === 'ADMIN';

    if (isAdmin) {
        return (
            <Card style={{ borderRadius: 16, textAlign: 'center', padding: '60px 20px' }}>
                <Alert
                    message="Admin Executive View"
                    description="POS Terminal Checkout is reserved for Front Desk Cashiers. As Admin, manage Staff Access Accounts, Store Outlets, and view Enterprise Sales History."
                    type="info"
                    showIcon
                    style={{ borderRadius: 12, marginBottom: 24, textAlign: 'left', maxWidth: 600, margin: '0 auto 24px' }}
                />
                <Space size="middle">
                    <Button
                        type="primary"
                        onClick={() => navigate('/dashboard')}
                        size="large"
                        style={{ borderRadius: 10 }}
                    >
                        Go to Analytics Dashboard
                    </Button>
                    <Button
                        size="large"
                        onClick={() => navigate('/users')}
                        style={{ borderRadius: 10 }}
                    >
                        Manage Staff & User Access
                    </Button>
                </Space>
            </Card>
        );
    }

    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
    const [selectedPromotionId, setSelectedPromotionId] = useState<string | undefined>(undefined);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'OTHER'>('CASH');
    const [customDiscountType, setCustomDiscountType] = useState<'PERCENT' | 'FIXED'>('FIXED');
    const [customDiscountValue, setCustomDiscountValue] = useState<number>(0);
    const [cashReceived, setCashReceived] = useState<number | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isHotkeysModalOpen, setIsHotkeysModalOpen] = useState(false);
    const searchInputRef = useRef<any>(null);
    const customerSelectRef = useRef<any>(null);

    // Hardware Barcode Scanner Buffer
    const barcodeBuffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);

    // Fetch products
    const { data: productsData } = useQuery({
        queryKey: ['products-all'],
        queryFn: () => productService.getProducts(1, 1000),
    });

    // Fetch customers
    const { data: customersData } = useQuery({
        queryKey: ['customers-all'],
        queryFn: customerService.getCustomers,
    });

    // Fetch active promotions
    const { data: activePromos } = useQuery({
        queryKey: ['promotions-active'],
        queryFn: promotionService.getActive,
    });

    // Fetch suppliers
    const { data: suppliers } = useQuery({
        queryKey: ['suppliers'],
        queryFn: supplierService.getAll,
    });

    const rawProducts = productsData?.data || [];
    const products = rawProducts.map(p => {
        if (p.name?.toLowerCase().includes('rice 5kg') || p.sku === 'RICE-MIN-5KG' || (p.name?.toLowerCase().includes('rice') && Number(p.price) > 200)) {
            return {
                ...p,
                name: 'Miniket Premium Parboiled Rice (Per Kg)',
                sku: 'RICE-MIN-1KG',
                price: 76.00,
                unit: 'Kg',
                stock_quantity: 300
            };
        }
        return p;
    });

    // Smart Category Inference for seeded products
    const getProductCategory = (p: any) => {
        const name = (p.name || '').toLowerCase();
        if (name.includes('rice') || name.includes('oil') || name.includes('sugar') || name.includes('chanachur') || name.includes('salt')) return 'Groceries';
        if (name.includes('milk') || name.includes('dairy')) return 'Dairy';
        if (name.includes('bulb') || name.includes('headphone') || name.includes('led') || name.includes('electronics')) return 'Electronics';
        if (name.includes('tea') || name.includes('juice') || name.includes('water') || name.includes('coke') || name.includes('beverage')) return 'Beverages';
        if (name.includes('bread') || name.includes('biscuit') || name.includes('cake') || name.includes('bakery')) return 'Bakery';
        return p.category || 'Groceries';
    };

    // Filter products by Search, Supplier, and Category
    const filteredProducts = products.filter(p => {
        const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSupplier = !selectedSupplierId || p.supplierId === selectedSupplierId;
        const pCategory = getProductCategory(p);
        const matchesCategory = activeCategory === 'All' || pCategory.toLowerCase() === activeCategory.toLowerCase();
        return matchesSearch && matchesSupplier && matchesCategory;
    });

    // Full POS Counter Keyboard Listener & Barcode Buffer
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Function Key Shortcuts for POS Desk
            if (e.key === 'F1') {
                e.preventDefault();
                searchInputRef.current?.focus();
                message.info('F1: Search box focused');
            } else if (e.key === 'F2') {
                e.preventDefault();
                resetSaleForm();
                message.info('F2: Active cart cleared');
            } else if (e.key === 'F3') {
                e.preventDefault();
                customerSelectRef.current?.focus();
                message.info('F3: Customer select focused');
            } else if (e.key === 'F4') {
                e.preventDefault();
                setPaymentMethod('CASH');
                message.info('F4: Payment mode set to CASH');
            } else if (e.key === 'F5') {
                e.preventDefault();
                setPaymentMethod('CARD');
                message.info('F5: Payment mode set to CARD');
            } else if (e.key === 'F6') {
                e.preventDefault();
                setPaymentMethod('OTHER');
                message.info('F6: Payment mode set to MOBILE/OTHER');
            } else if (e.key === 'F8') {
                e.preventDefault();
                setCashReceived(1000);
                message.info('F8: Cash tendered set to Tk 1000');
            } else if (e.key === 'F9') {
                e.preventDefault();
                handleCompleteSale();
            } else if (e.key === 'F10') {
                e.preventDefault();
                setIsScannerOpen(true);
            } else if (e.key === 'Escape') {
                resetSaleForm();
                message.info('ESC: Active cart reset');
            }

            // Hardware Barcode Scanner Buffer
            const now = Date.now();
            if (now - lastKeyTime.current > 100) {
                barcodeBuffer.current = '';
            }
            if (e.key === 'Enter' && !e.ctrlKey) {
                if (barcodeBuffer.current.length > 2) {
                    const product = products.find(p => p.sku === barcodeBuffer.current);
                    if (product) {
                        handleAddToCartByProduct(product);
                        message.success(`Scanned: ${product.name}`);
                    } else {
                        message.warning(`Unknown SKU: ${barcodeBuffer.current}`);
                    }
                    barcodeBuffer.current = '';
                }
            } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                barcodeBuffer.current += e.key;
            }
            lastKeyTime.current = now;
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [products, cart, paymentMethod]);

    // Mutation for creating sale
    const saleMutation = useMutation({
        mutationFn: saleService.createSale,
        onSuccess: (data) => {
            message.success('Sale completed successfully!');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });

            Modal.success({
                title: 'Transaction Successful & Receipt Ready',
                width: 480,
                content: (
                    <div style={{ padding: '10px 0' }}>
                        <Alert message={`Invoice ID: #${(data.id || 'POS').slice(-6).toUpperCase()}`} type="success" showIcon style={{ marginBottom: 12, borderRadius: 8 }} />
                        <p>Total Paid: <strong style={{ fontSize: 16, color: '#85861b' }}>{formatAmount(Number(data.total_amount))}</strong></p>
                        <p>Payment Method: <Tag color="blue">{paymentMethod}</Tag></p>
                        {cashReceived && cashReceived > Number(data.total_amount) && (
                            <p style={{ color: '#16a34a', fontWeight: 700 }}>Change Return: {formatAmount(cashReceived - Number(data.total_amount))}</p>
                        )}
                        <Space style={{ marginTop: 16 }}>
                            <Button type="primary" className="btn-purple-primary" icon={<PrinterOutlined />} onClick={() => printThermalReceipt(data)}>Print Receipt</Button>
                            <Button icon={<FilePdfOutlined />} onClick={() => generatePDFReceipt(data)}>PDF Memo</Button>
                        </Space>
                    </div>
                ),
                onOk: () => {
                    resetSaleForm();
                }
            });

            resetSaleForm();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to complete sale');
        },
    });

    const resetSaleForm = () => {
        setCart([]);
        setSelectedCustomerId(undefined);
        setSelectedPromotionId(undefined);
        setCustomDiscountValue(0);
        setCashReceived(null);
    };

    const handleAddToCartByProduct = (product: any) => {
        if (product.stock_quantity < 1) {
            message.error(`Insufficient stock for ${product.name}`);
            return;
        }

        const existingIndex = cart.findIndex(item => item.productId === product.id);
        if (existingIndex !== -1) {
            const newQuantity = cart[existingIndex].quantity + 1;
            if (newQuantity > product.stock_quantity) {
                message.error(`Exceeds available stock limit (${product.stock_quantity} Pcs)`);
                return;
            }
            const newCart = [...cart];
            newCart[existingIndex].quantity = newQuantity;
            setCart(newCart);
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: 1,
                stock: product.stock_quantity,
                sku: product.sku
            }]);
        }
        message.success(`Added ${product.name} to cart`);
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        const item = cart.find(i => i.productId === productId);
        if (item && quantity > item.stock) {
            message.error(`Only ${item.stock} units available!`);
            return;
        }
        setCart(cart.map(i => i.productId === productId ? { ...i, quantity } : i));
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculatePromoDiscount = () => {
        if (!selectedPromotionId || !activePromos) return 0;
        const promo = activePromos.find((p: any) => p.id === selectedPromotionId);
        if (!promo) return 0;

        const subtotal = calculateSubtotal();
        if (promo.minSpend && subtotal < Number(promo.minSpend)) return 0;

        if (promo.type === 'PERCENTAGE') {
            return subtotal * (Number(promo.value) / 100);
        } else if (promo.type === 'FIXED_AMOUNT') {
            return Math.min(subtotal, Number(promo.value));
        }
        return 0;
    };

    const calculateCustomDiscount = () => {
        const subtotal = calculateSubtotal();
        if (customDiscountType === 'PERCENT') {
            return subtotal * (customDiscountValue / 100);
        }
        return Math.min(subtotal, customDiscountValue);
    };

    const calculateTotalDiscount = () => {
        return calculatePromoDiscount() + calculateCustomDiscount();
    };

    const calculateTotal = () => {
        return Math.max(0, calculateSubtotal() - calculateTotalDiscount());
    };

    const changeDue = cashReceived !== null ? Math.max(0, cashReceived - calculateTotal()) : 0;

    const handleCompleteSale = () => {
        if (cart.length === 0) {
            message.warning('Your cart is empty. Add products to process checkout.');
            return;
        }

        if (paymentMethod === 'CARD') {
            Modal.info({
                title: 'Card Terminal Processing',
                content: (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <CreditCardOutlined style={{ fontSize: 48, color: '#85861b', marginBottom: 16 }} />
                        <p style={{ fontSize: 16 }}>Total Charge: <strong>{formatAmount(calculateTotal())}</strong></p>
                        <Text type="secondary" style={{ fontSize: 12 }}>Please swipe/insert card or scan QR on POS terminal device...</Text>
                        <br />
                        <Button type="primary" className="btn-purple-primary" style={{ marginTop: 16 }} onClick={() => {
                            Modal.destroyAll();
                            submitSale();
                        }}>Confirm Payment Success</Button>
                    </div>
                ),
                footer: null,
                maskClosable: false
            });
        } else {
            submitSale();
        }
    };

    const submitSale = () => {
        const saleDto = {
            items: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
            customerId: selectedCustomerId,
            promotionId: selectedPromotionId,
            paymentMethod
        };
        saleMutation.mutate(saleDto);
    };

    const printThermalReceipt = (sale: any) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const itemsHtml = (sale.items || []).map((item: any) => `
            <tr>
                <td style="padding: 2px 0;">${item.product?.name || 'Retail Item'}<br/><small>${item.quantity} x ${formatAmount(Number(item.price_at_sale || item.price || 0))}</small></td>
                <td style="text-align: right; vertical-align: bottom;">${formatAmount(Number(item.subtotal || 0))}</td>
            </tr>
        `).join('');

        const content = `
            <html>
                <head>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 10px; font-size: 12px; }
                        .center { text-align: center; }
                        .bold { font-weight: bold; }
                        .hr { border-bottom: 1px dashed #000; margin: 5px 0; }
                        table { width: 100%; border-collapse: collapse; }
                        .total { font-size: 16px; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="center">
                        <h2 style="margin: 0;">POSBuzz Store Outlet</h2>
                        <p>Gulshan-2, Dhaka, Bangladesh<br/>Tel: +880 1711 000111</p>
                        <div class="hr"></div>
                        <p class="bold">OFFICIAL POS RECEIPT</p>
                    </div>
                    <p>Date: ${dayjs(sale.createdAt).format('DD/MM/YYYY HH:mm')}<br/>
                       Invoice #: ${(sale.id || 'INV').slice(-6).toUpperCase()}<br/>
                       Cashier: ${user?.name || 'Cashier Desk'}</p>
                    <div class="hr"></div>
                    <table>
                        ${itemsHtml}
                    </table>
                    <div class="hr"></div>
                    <table class="total bold">
                        <tr>
                            <td>TOTAL PAID</td>
                            <td style="text-align: right;">${formatAmount(Number(sale.total_amount))}</td>
                        </tr>
                    </table>
                    <p>Payment Method: ${paymentMethod}</p>
                    <div class="hr" style="margin-top: 20px;"></div>
                    <div class="center" style="margin-top: 10px;">
                        <p>Thank you for shopping with POSBuzz!<br/>Please visit again.</p>
                    </div>
                </body>
            </html>
        `;

        iframe.contentWindow?.document.open();
        iframe.contentWindow?.document.write(content);
        iframe.contentWindow?.document.close();

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    };

    const generatePDFReceipt = (sale: any) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('POSBuzz Retail Invoice', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Date: ${dayjs(sale.createdAt).format('YYYY-MM-DD HH:mm:ss')}`, 20, 35);
        doc.text(`Invoice ID: ${sale.id}`, 20, 40);
        doc.text(`Customer: ${sale.customer?.name || 'Walk-in Customer'}`, 20, 45);

        const tableData = (sale.items || []).map((item: any) => [
            item.product?.name || 'Retail Product Item',
            item.quantity,
            formatAmount(Number(item.price_at_sale || 0)),
            formatAmount(Number(item.subtotal || 0))
        ]);

        autoTable(doc, {
            startY: 55,
            head: [['Product Item', 'Qty', 'Unit Price', 'Subtotal']],
            body: tableData,
            foot: [['', '', 'Total Paid', formatAmount(Number(sale.total_amount))]],
        });

        doc.save(`posbuzz-receipt-${sale.id}.pdf`);
    };

    const cartColumns = [
        {
            title: 'Product Item',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: CartItem) => (
                <div>
                    <Text strong style={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: '13px' }}>{text}</Text>
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block', color: isDark ? '#a1a1aa' : '#64748b' }}>SKU: {record.sku}</Text>
                </div>
            )
        },
        {
            title: 'Unit Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => <Text style={{ fontWeight: 600, color: isDark ? '#d6d750' : '#85861b' }}>{formatAmount(price)}</Text>,
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number, record: CartItem) => (
                <InputNumber
                    min={0.1}
                    step={0.5}
                    precision={2}
                    max={record.stock}
                    value={quantity}
                    onChange={(val) => updateQuantity(record.productId, val || 1)}
                    size="small"
                    style={{ width: 72, borderRadius: 8 }}
                />
            ),
        },
        {
            title: 'Subtotal',
            key: 'subtotal',
            render: (_: any, record: CartItem) => (
                <Text strong style={{ color: isDark ? '#d6d750' : '#85861b', fontSize: '14px' }}>
                    {formatAmount(record.price * record.quantity)}
                </Text>
            ),
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: CartItem) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(record.productId)} />
            ),
        },
    ];

    return (
        <Row gutter={[20, 20]}>
            {/* Left Main Column: Product Catalogue Touch Grid & Hardware Barcode */}
            <Col xs={24} lg={15}>
                <Card
                    style={{ borderRadius: 16, border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7', background: isDark ? '#141416' : '#ffffff' }}
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            <Space align="center" size="small">
                                <ShoppingCartOutlined style={{ fontSize: '22px', color: '#d6d750' }} />
                                <Title level={4} style={{ margin: 0, fontWeight: 800, color: isDark ? '#ffffff' : '#09090b', fontSize: 18 }}>
                                    POS Product Catalogue
                                </Title>
                            </Space>

                            <Space wrap size="small">
                                <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontWeight: 800, borderRadius: 6, padding: '2px 8px' }}>
                                    Hardware Scanner Listener Active
                                </Tag>
                                <Button
                                    icon={<ScanOutlined />}
                                    onClick={() => setIsScannerOpen(true)}
                                    style={{ borderRadius: 8, fontWeight: 700 }}
                                >
                                    Camera Scan
                                </Button>
                                <Button
                                    onClick={() => setIsHotkeysModalOpen(true)}
                                    style={{ borderRadius: 8, fontWeight: 700, background: '#d6d750', color: '#000', borderColor: '#d6d750' }}
                                >
                                    ⌨️ Shortcuts (F1-F10)
                                </Button>
                            </Space>
                        </div>
                    }
                >
                    {/* Top Multi-Filter Control Bar (Search, Supplier & Category Pills) */}
                    <div style={{ background: isDark ? '#1f1f23' : '#fafafa', padding: 16, borderRadius: 14, marginBottom: 20, border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}` }}>
                        <Row gutter={[12, 12]}>
                            <Col xs={24} sm={14}>
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Quick Search Product Name or Barcode SKU... (Press F1)"
                                    prefix={<SearchOutlined style={{ color: '#85861b' }} />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    allowClear
                                    size="large"
                                    style={{ borderRadius: 10 }}
                                />
                            </Col>
                            <Col xs={24} sm={10}>
                                <Select
                                    placeholder="Filter by Supplier / Vendor"
                                    style={{ width: '100%' }}
                                    value={selectedSupplierId}
                                    onChange={setSelectedSupplierId}
                                    allowClear
                                    size="large"
                                    options={suppliers?.map((s: any) => ({ value: s.id, label: `🏭 ${s.name}` }))}
                                />
                            </Col>
                        </Row>

                        {/* Category Pills Filter */}
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                            {['All', 'Groceries', 'Electronics', 'Dairy', 'Beverages', 'Bakery'].map(cat => (
                                <Button
                                    key={cat}
                                    type={activeCategory === cat ? 'primary' : 'default'}
                                    className={activeCategory === cat ? 'btn-purple-primary' : ''}
                                    size="small"
                                    style={{ borderRadius: 8, fontWeight: 700, padding: '0 14px' }}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat === 'All' ? '📦 All Items' : cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Touch Card Product Selection Grid */}
                    <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4, marginBottom: 20 }}>
                        <Row gutter={[12, 12]}>
                            {filteredProducts.map((p: any) => (
                                <Col xs={12} sm={8} md={6} key={p.id}>
                                    <div
                                        onClick={() => handleAddToCartByProduct(p)}
                                        style={{
                                            padding: 12,
                                            borderRadius: 12,
                                            border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
                                            background: isDark ? '#1f1f23' : '#ffffff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            height: '100%',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                        }}
                                        className="product-touch-card"
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 800, fontSize: 10, margin: 0 }}>
                                                    {p.sku}
                                                </Tag>
                                                <Tag color={p.stock_quantity < 10 ? 'red' : 'green'} style={{ borderRadius: 6, fontWeight: 700, fontSize: 10, margin: 0 }}>
                                                    {p.stock_quantity} Pcs
                                                </Tag>
                                            </div>
                                            <Text strong style={{ display: 'block', fontSize: 13, color: isDark ? '#ffffff' : '#09090b', lineHeight: 1.3, marginBottom: 6 }}>
                                                {p.name}
                                            </Text>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                            <Text strong style={{ color: isDark ? '#d6d750' : '#85861b', fontSize: 13 }}>
                                                {formatAmount(Number(p.price))} <span style={{ fontSize: 10, color: isDark ? '#a1a1aa' : '#64748b' }}>/ {p.unit || 'Pcs'}</span>
                                            </Text>
                                            <Button type="primary" size="small" icon={<PlusOutlined />} className="btn-purple-primary" style={{ borderRadius: 6 }}>
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    {/* Active Cart Items Table */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text strong style={{ fontSize: 15, color: isDark ? '#ffffff' : '#09090b' }}>
                                🛒 Active Order Cart ({cart.length} items)
                            </Text>
                            {cart.length > 0 && (
                                <Button danger type="link" size="small" onClick={() => setCart([])}>
                                    Clear Cart <Tag color="red" style={{ marginLeft: 4, fontWeight: 900 }}>F2</Tag>
                                </Button>
                            )}
                        </div>
                        <Table
                            className="incircle-table"
                            columns={cartColumns}
                            dataSource={cart}
                            rowKey="productId"
                            pagination={false}
                            size="small"
                            locale={{ emptyText: <Empty description="Click product cards above or scan barcode to add items to cart." /> }}
                        />
                    </div>
                </Card>
            </Col>

            {/* Right Column: Checkout Details & Discounts (Formatted in BDT Tk!) */}
            <Col xs={24} lg={9}>
                <Card
                    style={{ borderRadius: 16, border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7', background: isDark ? '#141416' : '#ffffff' }}
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <DollarOutlined style={{ fontSize: '20px', color: '#d6d750' }} />
                            <Title level={4} style={{ margin: 0, fontWeight: 800, color: isDark ? '#ffffff' : '#09090b', fontSize: 18 }}>
                                Checkout & Payment Details
                            </Title>
                        </div>
                    }
                >
                    {/* Customer Selection */}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Text strong style={{ fontSize: 12, color: isDark ? '#a1a1aa' : '#52525b' }}>
                                👤 Select Customer Account (Optional)
                            </Text>
                            <Tag color="purple" style={{ fontWeight: 800, borderRadius: 4, fontSize: 10 }}>F3</Tag>
                        </div>
                        <Select
                            ref={customerSelectRef}
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Link Customer (Name / Phone)"
                            value={selectedCustomerId}
                            onChange={setSelectedCustomerId}
                            allowClear
                            size="large"
                            options={customersData?.map((c: any) => ({
                                value: c.id,
                                label: `${c.name} (${c.phone || c.email}) - ${c.points || 0} pts`
                            }))}
                        />
                    </div>

                    {/* Promotion / Coupon Dropdown */}
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 12, color: isDark ? '#a1a1aa' : '#52525b', display: 'block', marginBottom: 6 }}>
                            🎁 Active Promotion / Coupon Offer
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Apply Store Promotion Offer"
                            value={selectedPromotionId}
                            onChange={setSelectedPromotionId}
                            allowClear
                            size="large"
                            options={activePromos?.map((p: any) => ({
                                value: p.id,
                                label: `🎉 ${p.name} (${p.type === 'PERCENTAGE' ? `${p.value}% Off` : `${formatAmount(Number(p.value))} Off`})`
                            }))}
                        />
                    </div>

                    {/* Custom Discount Input (% or Tk) */}
                    <div style={{ marginBottom: 16, background: isDark ? '#1f1f23' : '#fafafa', padding: 12, borderRadius: 10, border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text strong style={{ fontSize: 12, color: isDark ? '#a1a1aa' : '#52525b' }}>
                                🏷️ Additional Manual Discount
                            </Text>
                            <Radio.Group
                                value={customDiscountType}
                                onChange={e => setCustomDiscountType(e.target.value)}
                                size="small"
                                optionType="button"
                                buttonStyle="solid"
                            >
                                <Radio.Button value="FIXED">Tk</Radio.Button>
                                <Radio.Button value="PERCENT">%</Radio.Button>
                            </Radio.Group>
                        </div>
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            size="middle"
                            value={customDiscountValue}
                            onChange={(val) => setCustomDiscountValue(val || 0)}
                            prefix={customDiscountType === 'FIXED' ? 'Tk ' : '% '}
                            placeholder="Enter discount value"
                        />
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    {/* Payment Method Tabs */}
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 12, color: isDark ? '#a1a1aa' : '#52525b', display: 'block', marginBottom: 8 }}>
                            💳 Payment Method
                        </Text>
                        <Radio.Group
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            style={{ width: '100%' }}
                            optionType="button"
                            buttonStyle="solid"
                            size="large"
                        >
                            <Radio.Button value="CASH" style={{ width: '33.3%', textAlign: 'center', fontWeight: 700 }}>
                                <MoneyCollectOutlined /> Cash <Tag color="gold" style={{ fontSize: 10, margin: '0 0 0 2px', fontWeight: 900 }}>F4</Tag>
                            </Radio.Button>
                            <Radio.Button value="CARD" style={{ width: '33.3%', textAlign: 'center', fontWeight: 700 }}>
                                <CreditCardOutlined /> Card <Tag color="blue" style={{ fontSize: 10, margin: '0 0 0 2px', fontWeight: 900 }}>F5</Tag>
                            </Radio.Button>
                            <Radio.Button value="OTHER" style={{ width: '33.3%', textAlign: 'center', fontWeight: 700 }}>
                                Mobile <Tag color="green" style={{ fontSize: 10, margin: '0 0 0 2px', fontWeight: 900 }}>F6</Tag>
                            </Radio.Button>
                        </Radio.Group>
                    </div>

                    {/* Quick Cash Presets & Change Return Calculator */}
                    {paymentMethod === 'CASH' && (
                        <div style={{ marginBottom: 16, background: isDark ? '#1f1f23' : '#fafafa', padding: 12, borderRadius: 10, border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}` }}>
                            <Text strong style={{ fontSize: 12, color: isDark ? '#a1a1aa' : '#52525b', display: 'block', marginBottom: 8 }}>
                                💵 Cash Tendered & Change Return
                            </Text>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                {[100, 500, 1000].map(amt => (
                                    <Button
                                        key={amt}
                                        size="small"
                                        style={{ borderRadius: 6, fontWeight: 700 }}
                                        onClick={() => setCashReceived(amt)}
                                    >
                                        Tk {amt}
                                    </Button>
                                ))}
                                <Button
                                    size="small"
                                    style={{ borderRadius: 6, fontWeight: 700 }}
                                    onClick={() => setCashReceived(calculateTotal())}
                                >
                                    Exact
                                </Button>
                            </div>
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Enter cash received from customer"
                                value={cashReceived}
                                onChange={val => setCashReceived(val)}
                                prefix="Tk "
                            />
                            {cashReceived !== null && cashReceived >= calculateTotal() && (
                                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>Change Due Return:</Text>
                                    <Text strong style={{ fontSize: 16, color: '#16a34a' }}>{formatAmount(changeDue)}</Text>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Total Summary Box - Fully Formatted in BDT Tk! */}
                    <div style={{
                        background: isDark ? 'linear-gradient(135deg, #1f1f23 0%, #141416 100%)' : '#fafafa',
                        padding: 16,
                        borderRadius: 14,
                        border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={{ color: isDark ? '#a1a1aa' : '#71717a', fontSize: 13 }}>Subtotal</Text>
                            <Text strong style={{ color: isDark ? '#ffffff' : '#09090b', fontSize: 14 }}>{formatAmount(calculateSubtotal())}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <Text style={{ color: isDark ? '#a1a1aa' : '#71717a', fontSize: 13 }}>Total Discount</Text>
                            <Text strong style={{ color: '#ef4444', fontSize: 14 }}>-{formatAmount(calculateTotalDiscount())}</Text>
                        </div>

                        <Divider style={{ margin: '10px 0', borderColor: isDark ? '#27272a' : '#e4e4e7' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Title level={4} style={{ margin: 0, color: isDark ? '#ffffff' : '#09090b', fontWeight: 800 }}>Total Pay</Title>
                            <div style={{ fontSize: '26px', fontWeight: 900, color: isDark ? '#d6d750' : '#85861b', letterSpacing: '-0.5px' }}>
                                {formatAmount(calculateTotal())}
                            </div>
                        </div>

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                className="btn-purple-primary"
                                size="large"
                                block
                                icon={<ThunderboltOutlined />}
                                onClick={handleCompleteSale}
                                loading={saleMutation.isPending}
                                disabled={cart.length === 0}
                                style={{
                                    height: 50,
                                    fontSize: 16,
                                    fontWeight: 900,
                                    borderRadius: 12,
                                }}
                            >
                                Process Payment (F9) — {formatAmount(calculateTotal())}
                            </Button>
                            <Button
                                block
                                danger
                                icon={<DeleteOutlined />}
                                onClick={resetSaleForm}
                                disabled={cart.length === 0}
                                style={{ borderRadius: 10, fontWeight: 600 }}
                            >
                                Reset / Clear Cart (F2)
                            </Button>
                        </Space>
                    </div>
                </Card>
            </Col>

            <Modal title="Camera Barcode Scanner" open={isScannerOpen} onCancel={() => setIsScannerOpen(false)} footer={null} destroyOnClose>
                <div id="reader" style={{ width: '100%' }}></div>
            </Modal>

            <Modal
                title={<span style={{ fontWeight: 800 }}>⌨️ Cashier Counter POS Keyboard Shortcuts</span>}
                open={isHotkeysModalOpen}
                onCancel={() => setIsHotkeysModalOpen(false)}
                footer={[<Button key="ok" type="primary" className="btn-purple-primary" onClick={() => setIsHotkeysModalOpen(false)}>Got It</Button>]}
            >
                <div style={{ padding: '10px 0' }}>
                    <Alert
                        message="High-Speed Counter Billing Shortcuts"
                        description="Press function keys F1 to F10 on any physical keyboard for instant counter operation without touching the mouse."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 10 }}
                    />
                    <Table
                        pagination={false}
                        size="small"
                        rowKey="key"
                        dataSource={[
                            { key: 'F1', shortcut: 'F1', desc: 'Focus Product & Barcode Search Box' },
                            { key: 'F2', shortcut: 'F2', desc: 'Clear / Reset Active Order Cart' },
                            { key: 'F3', shortcut: 'F3', desc: 'Focus Customer Account Selection' },
                            { key: 'F4', shortcut: 'F4', desc: 'Select Payment Method to CASH' },
                            { key: 'F5', shortcut: 'F5', desc: 'Select Payment Method to CARD' },
                            { key: 'F6', shortcut: 'F6', desc: 'Select Payment Method to MOBILE / OTHER' },
                            { key: 'F8', shortcut: 'F8', desc: 'Quick Cash Preset (Tk 1000)' },
                            { key: 'F9', shortcut: 'F9', desc: 'Process & Complete Payment Receipt' },
                            { key: 'F10', shortcut: 'F10', desc: 'Open Camera Barcode Scanner' },
                            { key: 'ESC', shortcut: 'ESC', desc: 'Reset Active Cart Order' },
                            { key: 'Barcode Scanner', shortcut: 'USB / Bluetooth Gun', desc: 'Auto Scan & Direct Add Item to Cart' },
                        ]}
                        columns={[
                            { title: 'Hotkey', dataIndex: 'shortcut', key: 'shortcut', render: (text) => <Tag color="purple" style={{ fontWeight: 900, borderRadius: 6, padding: '2px 8px' }}>{text}</Tag> },
                            { title: 'Action / Description', dataIndex: 'desc', key: 'desc', render: (text) => <Text style={{ fontWeight: 600 }}>{text}</Text> },
                        ]}
                    />
                </div>
            </Modal>
        </Row>
    );
};

export default CreateSalePage;

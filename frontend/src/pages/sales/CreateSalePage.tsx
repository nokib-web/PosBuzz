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
    Space as AntSpace,
    Empty,
    Radio,
    Tag
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    ShoppingCartOutlined,
    ScanOutlined,
    PrinterOutlined,
    FilePdfOutlined,
    CreditCardOutlined,
    MoneyCollectOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { saleService } from '../../services/sale.service';
import { customerService } from '../../services/customer.service';
import { promotionService } from '../../services/promotion.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Html5QrcodeScanner } from 'html5-qrcode';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    stock: number;
    sku: string;
}

const CreateSalePage: React.FC = () => {
    const queryClient = useQueryClient();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
    const [selectedPromotionId, setSelectedPromotionId] = useState<string | undefined>(undefined);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'OTHER'>('CASH');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Hardware Barcode Scanner Buffer
    const barcodeBuffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);

    // Fetch products
    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
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

    const selectedProduct = productsData?.data.find(p => p.id === selectedProductId);

    // Hardware Scanner Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const now = Date.now();

            // Barcode scanners usually type very fast (< 30ms between keys)
            if (now - lastKeyTime.current > 100) {
                barcodeBuffer.current = '';
            }

            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 2) {
                    const product = productsData?.data.find(p => p.sku === barcodeBuffer.current);
                    if (product) {
                        handleAddToCartByProduct(product);
                        message.success(`Scanned: ${product.name}`);
                    } else {
                        message.warning(`Unknown SKU: ${barcodeBuffer.current}`);
                    }
                    barcodeBuffer.current = '';
                }
            } else if (e.key.length === 1) {
                barcodeBuffer.current += e.key;
            }

            lastKeyTime.current = now;
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [productsData, cart]);

    // Mutation for creating sale
    const saleMutation = useMutation({
        mutationFn: saleService.createSale,
        onSuccess: (data) => {
            message.success('Sale completed successfully!');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });

            Modal.success({
                title: 'Transaction Successful',
                content: (
                    <div>
                        <p>Total Amount: <strong>${Number(data.total_amount).toFixed(2)}</strong></p>
                        <p>Payment Method: <Tag color="blue">{paymentMethod}</Tag></p>
                        <AntSpace style={{ marginTop: 16 }}>
                            <Button type="primary" icon={<PrinterOutlined />} onClick={() => printThermalReceipt(data)}>Print Thermal Memo</Button>
                            <Button icon={<FilePdfOutlined />} onClick={() => generatePDFReceipt(data)}>Download PDF</Button>
                        </AntSpace>
                    </div>
                ),
                onOk: () => {
                    setCart([]);
                    setSelectedCustomerId(undefined);
                }
            });

            setCart([]);
            setSelectedCustomerId(undefined);
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to complete sale');
        },
    });

    // Barcode Scanner logic
    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;
        if (isScannerOpen) {
            scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render((decodedText) => {
                const product = productsData?.data.find(p => p.sku === decodedText);
                if (product) {
                    handleAddToCartByProduct(product);
                    setIsScannerOpen(false);
                    scanner?.clear();
                } else {
                    message.error(`Product with SKU ${decodedText} not found`);
                }
            }, undefined);
        }
        return () => {
            if (scanner) {
                scanner.clear().catch(console.error);
            }
        };
    }, [isScannerOpen]);

    const handleAddToCartByProduct = (product: any) => {
        if (product.stock_quantity < 1) {
            message.error(`Insufficient stock for ${product.name}`);
            return;
        }

        const existingIndex = cart.findIndex(item => item.productId === product.id);
        if (existingIndex !== -1) {
            const newQuantity = cart[existingIndex].quantity + 1;
            if (newQuantity > product.stock_quantity) {
                message.error(`Exceeds stock limit`);
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
        message.success(`Added ${product.name}`);
    };

    const addToCart = () => {
        if (!selectedProduct) return;
        handleAddToCartByProduct({ ...selectedProduct, quantity: selectedQuantity });
        setSelectedProductId(undefined);
        setSelectedQuantity(1);
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

    const calculateDiscount = () => {
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

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscount();
    };

    const handleCompleteSale = () => {
        if (cart.length === 0) {
            message.warning('Your cart is empty');
            return;
        }

        // Simulating Card Payment Device Integration
        if (paymentMethod === 'CARD') {
            Modal.info({
                title: 'Card Terminal Processing',
                content: (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <CreditCardOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
                        <p>Total: <strong>${calculateTotal().toFixed(2)}</strong></p>
                        <p>Please swipe/insert card on the physical terminal...</p>
                        <Button type="primary" onClick={() => {
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

        const itemsHtml = sale.items.map((item: any) => `
            <tr>
                <td style="padding: 2px 0;">${item.product.name}<br/><small>${item.quantity} x $${Number(item.price_at_sale).toFixed(2)}</small></td>
                <td style="text-align: right; vertical-align: bottom;">$${Number(item.subtotal).toFixed(2)}</td>
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
                        <h2 style="margin: 0;">POSBuzz</h2>
                        <p>123 POS Street, Tech City<br/>Tel: +1 234 567 890</p>
                        <div class="hr"></div>
                        <p class="bold">RECEIPT</p>
                    </div>
                    <p>Date: ${dayjs(sale.createdAt).format('DD/MM/YYYY HH:mm')}<br/>
                       Sale ID: #${sale.id.slice(-6).toUpperCase()}<br/>
                       Cashier: ${sale.userId.slice(-4)}</p>
                    <div class="hr"></div>
                    <table>
                        ${itemsHtml}
                    </table>
                    <div class="hr"></div>
                    <table class="total bold">
                        <tr>
                            <td>TOTAL</td>
                            <td style="text-align: right;">$${Number(sale.total_amount).toFixed(2)}</td>
                        </tr>
                    </table>
                    <p>Payment: ${paymentMethod}</p>
                    <div class="hr" style="margin-top: 20px;"></div>
                    <div class="center" style="margin-top: 10px;">
                        <p>Thank you for shopping!<br/>Please visit again.</p>
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

        // Header
        doc.setFontSize(22);
        doc.text('POSBuzz - Receipt', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Date: ${dayjs(sale.createdAt).format('YYYY-MM-DD HH:mm:ss')}`, 20, 35);
        doc.text(`Sale ID: ${sale.id}`, 20, 40);
        doc.text(`Customer: ${sale.customer?.name || 'Walk-in Customer'}`, 20, 45);

        // Table
        const tableData = sale.items.map((item: any) => [
            item.product.name,
            item.quantity,
            `$${Number(item.price_at_sale).toFixed(2)}`,
            `$${Number(item.subtotal).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: 55,
            head: [['Product', 'Qty', 'Price', 'Subtotal']],
            body: tableData,
            foot: [['', '', 'Total', `$${Number(sale.total_amount).toFixed(2)}`]],
        });

        doc.setFontSize(12);
        doc.text('Thank you for your business!', 105, (doc as any).lastAutoTable.finalY + 20, { align: 'center' });

        doc.save(`receipt-${sale.id}.pdf`);
    };

    const columns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: CartItem) => (
                <div>
                    <div>{text}</div>
                    <Text type="secondary" style={{ fontSize: '11px' }}>SKU: {record.sku}</Text>
                </div>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `$${price.toFixed(2)}`,
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number, record: CartItem) => (
                <InputNumber
                    min={1}
                    max={record.stock}
                    value={quantity}
                    onChange={(val) => updateQuantity(record.productId, val || 1)}
                    size="small"
                    style={{ width: 60 }}
                />
            ),
        },
        {
            title: 'Subtotal',
            key: 'subtotal',
            render: (_: any, record: CartItem) => <strong>${(record.price * record.quantity).toFixed(2)}</strong>,
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
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
                <Card
                    title={<span><ShoppingCartOutlined /> New Transaction</span>}
                    extra={
                        <AntSpace>
                            <Tag color="cyan">Hardware Scanner Active</Tag>
                            <Button icon={<ScanOutlined />} onClick={() => setIsScannerOpen(true)}>Camera Scan</Button>
                        </AntSpace>
                    }
                >
                    <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                        <Row gutter={16} align="bottom">
                            <Col flex="auto">
                                <Text strong>Quick Search / SKU Input</Text>
                                <Select
                                    showSearch
                                    placeholder="Search Name or SKU"
                                    style={{ width: '100%', marginTop: '4px' }}
                                    optionFilterProp="children"
                                    value={selectedProductId}
                                    onChange={setSelectedProductId}
                                    loading={isLoadingProducts}
                                    autoFocus
                                >
                                    {productsData?.data.map(p => (
                                        <Option key={p.id} value={p.id} label={p.name}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{p.name} <Text type="secondary">({p.sku})</Text></span>
                                                <Text type={p.stock_quantity < 5 ? 'danger' : 'secondary'}>Stock: {p.stock_quantity}</Text>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={4}>
                                <Text strong>Qty</Text>
                                <InputNumber
                                    min={1}
                                    max={selectedProduct?.stock_quantity}
                                    value={selectedQuantity}
                                    onChange={(val) => setSelectedQuantity(val || 1)}
                                    style={{ width: '100%', marginTop: '4px' }}
                                />
                            </Col>
                            <Col>
                                <Button type="primary" icon={<PlusOutlined />} onClick={addToCart} disabled={!selectedProductId}>Add</Button>
                            </Col>
                        </Row>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={cart}
                        rowKey="productId"
                        pagination={false}
                        size="small"
                        locale={{ emptyText: <Empty description="Cart is empty. Use hardware scanner or search above." /> }}
                    />
                </Card>
            </Col>

            <Col xs={24} lg={8}>
                <Card title="Checkout Details" headStyle={{ background: '#1677ff', color: '#fff' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <Text strong>Customer</Text>
                        <Select
                            showSearch
                            style={{ width: '100%', marginTop: '8px' }}
                            placeholder="Link Customer (Optional)"
                            value={selectedCustomerId}
                            onChange={setSelectedCustomerId}
                            allowClear
                        >
                            {customersData?.map((c: any) => (
                                <Option key={c.id} value={c.id}>{c.name} ({c.phone || c.email})</Option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <Text strong>Promotion / Coupon</Text>
                        <Select
                            style={{ width: '100%', marginTop: '8px' }}
                            placeholder="Select Active Offer"
                            value={selectedPromotionId}
                            onChange={setSelectedPromotionId}
                            allowClear
                        >
                            {activePromos?.map((p: any) => (
                                <Option key={p.id} value={p.id}>
                                    {p.name} ({p.type === 'PERCENTAGE' ? `${p.value}% Off` : `$${p.value} Off`})
                                </Option>
                            ))}
                        </Select>
                        {selectedPromotionId && (
                            <div style={{ marginTop: 4 }}>
                                <Tag color="orange" visible={calculateDiscount() === 0}>
                                    Min spend not met
                                </Tag>
                            </div>
                        )}
                    </div>

                    <Divider />

                    <div style={{ marginBottom: '20px' }}>
                        <Text strong>Payment Method</Text>
                        <Radio.Group
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            style={{ width: '100%', marginTop: '8px' }}
                            optionType="button"
                            buttonStyle="solid"
                        >
                            <Radio.Button value="CASH" style={{ width: '33.3%' }}><MoneyCollectOutlined /> Cash</Radio.Button>
                            <Radio.Button value="CARD" style={{ width: '33.3%' }}><CreditCardOutlined /> Card</Radio.Button>
                            <Radio.Button value="OTHER" style={{ width: '33.3%' }}>Other</Radio.Button>
                        </Radio.Group>
                    </div>

                    <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Text type="secondary">Subtotal</Text>
                            <Text strong>${calculateSubtotal().toFixed(2)}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Text type="secondary">Discount Applied</Text>
                            <Text strong style={{ color: '#f5222d' }}>-${calculateDiscount().toFixed(2)}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <Title level={4} style={{ margin: 0 }}>Total Pay</Title>
                            <Title level={3} style={{ margin: 0, color: '#1677ff' }}>${calculateTotal().toFixed(2)}</Title>
                        </div>

                        <AntSpace direction="vertical" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<ShoppingCartOutlined />}
                                onClick={handleCompleteSale}
                                loading={saleMutation.isPending}
                                disabled={cart.length === 0}
                                style={{ height: 60, fontSize: 18 }}
                            >
                                Process Payment
                            </Button>
                            <Button block danger icon={<DeleteOutlined />} onClick={() => setCart([])} disabled={cart.length === 0}>
                                Reset Transaction
                            </Button>
                        </AntSpace>
                    </div>
                </Card>

                <Card title="Tips" style={{ marginTop: '24px' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        • Hardware Barcode Scanner is auto-detected.<br />
                        • For Card payments, confirm transaction on device before final check.<br />
                        • You can print thermal receipts after completion.
                    </Text>
                </Card>
            </Col>

            <Modal title="Camera Scanner" open={isScannerOpen} onCancel={() => setIsScannerOpen(false)} footer={null} destroyOnClose>
                <div id="reader" style={{ width: '100%' }}></div>
            </Modal>
        </Row>
    );
};

export default CreateSalePage;

import React, { useState } from 'react';
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
    Tag
} from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { saleService } from '../../services/sale.service';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

    // Fetch products for dropdown search
    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products-all'],
        queryFn: () => productService.getProducts(1, 1000), // Get all products for searching
    });

    const selectedProduct = productsData?.data.find(p => p.id === selectedProductId);

    // Mutation for creating sale
    const saleMutation = useMutation({
        mutationFn: saleService.createSale,
        onSuccess: () => {
            message.success('Sale completed successfully!');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setCart([]);
            navigate('/sales');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to complete sale');
        },
    });

    const addToCart = () => {
        if (!selectedProduct) return;

        // Check if enough stock
        if (selectedProduct.stock_quantity < selectedQuantity) {
            message.error(`Insufficient stock! Only ${selectedProduct.stock_quantity} available.`);
            return;
        }

        // Check if product already in cart
        const existingIndex = cart.findIndex(item => item.productId === selectedProduct.id);

        if (existingIndex !== -1) {
            const newQuantity = cart[existingIndex].quantity + selectedQuantity;
            if (newQuantity > selectedProduct.stock_quantity) {
                message.error(`Cannot add more. Exceeds total stock (${selectedProduct.stock_quantity})`);
                return;
            }
            const newCart = [...cart];
            newCart[existingIndex].quantity = newQuantity;
            setCart(newCart);
        } else {
            setCart([...cart, {
                productId: selectedProduct.id,
                name: selectedProduct.name,
                price: Number(selectedProduct.price),
                quantity: selectedQuantity,
                stock: selectedProduct.stock_quantity,
                sku: selectedProduct.sku
            }]);
        }

        setSelectedProductId(undefined);
        setSelectedQuantity(1);
        message.success('Item added to cart');
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

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleCompleteSale = () => {
        if (cart.length === 0) {
            message.warning('Your cart is empty');
            return;
        }

        const saleDto = {
            items: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }))
        };

        saleMutation.mutate(saleDto);
    };

    const columns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: CartItem) => (
                <div>
                    <div>{text}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>SKU: {record.sku}</Text>
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
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number, record: CartItem) => (
                <InputNumber
                    min={1}
                    max={record.stock}
                    value={quantity}
                    onChange={(val) => updateQuantity(record.productId, val || 1)}
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
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromCart(record.productId)}
                />
            ),
        },
    ];

    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
                <Card title={<span><ShoppingCartOutlined /> New Transaction</span>}>
                    <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                        <Row gutter={16} align="bottom">
                            <Col flex="auto">
                                <Text strong>Select Product</Text>
                                <Select
                                    showSearch
                                    placeholder="Scan SKU or Search Name"
                                    style={{ width: '100%', marginTop: '8px' }}
                                    optionFilterProp="children"
                                    value={selectedProductId}
                                    onChange={setSelectedProductId}
                                    loading={isLoadingProducts}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {productsData?.data.map(p => (
                                        <Option key={p.id} value={p.id} label={`${p.name} (${p.sku})`}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{p.name} <Text type="secondary">({p.sku})</Text></span>
                                                <Text type={p.stock_quantity < 5 ? 'danger' : 'secondary'}>
                                                    Stock: {p.stock_quantity}
                                                </Text>
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
                                    style={{ width: '100%', marginTop: '8px' }}
                                />
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={addToCart}
                                    disabled={!selectedProductId}
                                    style={{ marginTop: '8px' }}
                                >
                                    Add
                                </Button>
                            </Col>
                        </Row>
                        {selectedProduct && (
                            <div style={{ marginTop: '12px' }}>
                                <Tag color="blue">Price: ${Number(selectedProduct.price).toFixed(2)}</Tag>
                                <Tag color={selectedProduct.stock_quantity < 10 ? 'red' : 'green'}>
                                    Available: {selectedProduct.stock_quantity}
                                </Tag>
                            </div>
                        )}
                    </div>

                    <Table
                        columns={columns}
                        dataSource={cart}
                        rowKey="productId"
                        pagination={false}
                        locale={{ emptyText: 'No items in cart' }}
                    />
                </Card>
            </Col>

            <Col xs={24} lg={8}>
                <Card title="Summary">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <Text type="secondary">Subtotal</Text>
                        <Text strong>${calculateTotal().toFixed(2)}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <Text type="secondary">Tax (0%)</Text>
                        <Text strong>$0.00</Text>
                    </div>
                    <Divider />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <Title level={4} style={{ margin: 0 }}>Total Amount</Title>
                        <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
                            ${calculateTotal().toFixed(2)}
                        </Title>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        block
                        icon={<ShoppingCartOutlined />}
                        onClick={handleCompleteSale}
                        loading={saleMutation.isPending}
                        disabled={cart.length === 0}
                    >
                        Complete Sale
                    </Button>

                    <Button
                        block
                        style={{ marginTop: '12px' }}
                        onClick={() => setCart([])}
                        disabled={cart.length === 0}
                    >
                        Clear Cart
                    </Button>
                </Card>

                <Card title="Quick Info" style={{ marginTop: '24px' }}>
                    <Text type="secondary">
                        Ensure you have confirmed the quantity with the customer before completing the sale. Stock will be updated automatically.
                    </Text>
                </Card>
            </Col>
        </Row>
    );
};

export default CreateSalePage;

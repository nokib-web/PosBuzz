import React, { useState } from 'react';
import { Table, Button, Input, Space, Card, Typography, Popconfirm, message, Tag, Modal, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product.types';
import ProductFormModal from '../../components/products/ProductFormModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProductListPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Fetch products
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['products', page, limit, search],
        queryFn: () => productService.getProducts(page, limit, search),
    });

    // Delete product mutation
    const deleteMutation = useMutation({
        mutationFn: productService.deleteProduct,
        onSuccess: () => {
            message.success('Product deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to delete product');
        },
    });

    const restockMutation = useMutation({
        mutationFn: ({ id, stock }: { id: string; stock: number }) =>
            productService.updateProduct(id, { stock_quantity: stock }),
        onSuccess: () => {
            message.success('Stock updated successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const handleQuickRestock = (id: string, newStock: number) => {
        restockMutation.mutate({ id, stock: newStock });
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalVisible(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            render: (sku: string) => <Tag color="blue">{sku}</Tag>,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `$${Number(price).toFixed(2)}`,
        },
        {
            title: 'Stock',
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            render: (stock: number) => (
                <Tag color={stock < 10 ? 'red' : 'green'}>
                    {stock} units
                </Tag>
            ),
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => dayjs(date).format('MMM D, YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Product) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        ghost
                        icon={<ArrowUpOutlined />}
                        onClick={() => {
                            Modal.confirm({
                                title: `Restock ${record.name}`,
                                content: (
                                    <div style={{ marginTop: 16 }}>
                                        <Text>Current Stock: {record.stock_quantity}</Text>
                                        <br />
                                        <Text>How many units are you adding?</Text>
                                        <InputNumber
                                            autoFocus
                                            min={1}
                                            style={{ width: '100%', marginTop: 8 }}
                                            onPressEnter={(e: any) => {
                                                const val = parseInt(e.target.value);
                                                if (val > 0) handleQuickRestock(record.id, record.stock_quantity + val);
                                                Modal.destroyAll();
                                            }}
                                        />
                                    </div>
                                ),
                                onOk: () => {
                                    // This is handled by onPressEnter for speed, but standard onOk works too
                                }
                            });
                        }}
                    >
                        Restock
                    </Button>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        style={{ color: '#1677ff' }}
                    />
                    <Popconfirm
                        title="Delete the product"
                        description="Are you sure you want to delete this product?"
                        onConfirm={() => deleteMutation.mutate(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Products</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Product
                </Button>
            </div>

            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search by name or SKU..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1); // Reset to first page on search
                    }}
                    style={{ width: 300 }}
                    allowClear
                />
            </div>

            <Table
                columns={columns}
                dataSource={data?.data}
                rowKey="id"
                loading={isLoading || isFetching}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total: data?.total,
                    onChange: (p, s) => {
                        setPage(p);
                        setLimit(s);
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
            />

            <ProductFormModal
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                product={editingProduct}
            />
        </Card>
    );
};

export default ProductListPage;

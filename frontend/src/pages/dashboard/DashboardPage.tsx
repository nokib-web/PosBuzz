import React from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Space, Tag, Empty } from 'antd';
import {
    ShoppingOutlined,
    WarningOutlined,
    DollarOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { saleService } from '../../services/sale.service';
import { useAuth } from '../../hooks/useAuth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    // Fetch products for total and low stock stats
    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products', 'dashboard-stats'],
        queryFn: () => productService.getProducts(1, 1000),
    });

    // Fetch recent sales
    const { data: salesData, isLoading: isLoadingSales } = useQuery({
        queryKey: ['sales', 'recent'],
        queryFn: () => saleService.getSales(1, 5),
    });

    const products = productsData?.data || [];
    const lowStockCount = products.filter(p => p.stock_quantity < 10).length;
    const totalStockValue = products.reduce((acc, p) => acc + (Number(p.price) * p.stock_quantity), 0);
    const recentSales = salesData?.data || [];

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('MMM D, YYYY HH:mm'),
        },
        {
            title: 'Items',
            dataIndex: ['_count', 'items'],
            key: 'items',
        },
        {
            title: 'Total',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount: number) => <Text strong>${Number(amount).toFixed(2)}</Text>,
        },
        {
            title: 'Status',
            key: 'status',
            render: () => <Tag color="green">Completed</Tag>,
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
                <Title level={2}>Welcome back, {user?.email.split('@')[0]}!</Title>
                <Text type="secondary">Here's what's happening with your store today.</Text>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} loading={isLoadingProducts}>
                        <Statistic
                            title="Total Products"
                            value={products.length}
                            prefix={<ShoppingOutlined style={{ color: '#1677ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} loading={isLoadingProducts}>
                        <Statistic
                            title="Low Stock Alert"
                            value={lowStockCount}
                            valueStyle={{ color: lowStockCount > 0 ? '#cf1322' : '#3f8600' }}
                            prefix={<WarningOutlined />}
                            suffix={lowStockCount === 1 ? 'item' : 'items'}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} loading={isLoadingProducts}>
                        <Statistic
                            title="Inventory Value"
                            value={totalStockValue}
                            precision={2}
                            prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} loading={isLoadingSales}>
                        <Statistic
                            title="Recent Sales"
                            value={recentSales.length}
                            prefix={<HistoryOutlined style={{ color: '#722ed1' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Recent Transactions" bordered={false}>
                        {recentSales.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={recentSales}
                                rowKey="id"
                                pagination={false}
                                loading={isLoadingSales}
                            />
                        ) : (
                            <Empty description="No recent transactions found" />
                        )}
                    </Card>
                </Col>
            </Row>
        </Space>
    );
};

export default DashboardPage;

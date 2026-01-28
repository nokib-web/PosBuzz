import React from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Space, Tag, Empty, Spin } from 'antd';
import {
    ShoppingOutlined,
    WarningOutlined,
    DollarOutlined,
    HistoryOutlined,
    LineChartOutlined,
    BarChartOutlined,
    RiseOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { saleService } from '../../services/sale.service';
import { analyticsService } from '../../services/analytics.service';
import { useAuth } from '../../hooks/useAuth';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    // Stats Summary
    const { data: summary, isLoading: isLoadingSummary } = useQuery({
        queryKey: ['analytics-summary'],
        queryFn: () => analyticsService.getSummary(),
    });

    // Sales Trend
    const { data: trend, isLoading: isLoadingTrend } = useQuery({
        queryKey: ['analytics-trend'],
        queryFn: () => analyticsService.getTrend(7),
    });

    // Top Products
    const { data: topProducts, isLoading: isLoadingTop } = useQuery({
        queryKey: ['analytics-top-products'],
        queryFn: () => analyticsService.getTopProducts(5),
    });

    // Recent Sales
    const { data: salesData, isLoading: isLoadingSales } = useQuery({
        queryKey: ['sales', 'recent'],
        queryFn: () => saleService.getSales(1, 5),
    });

    // Low stock count (from products)
    const { data: productsData } = useQuery({
        queryKey: ['products', 'low-stock'],
        queryFn: () => productService.getProducts(1, 1000),
    });

    const lowStockCount = productsData?.data?.filter((p: any) => p.stock_quantity <= p.lowStockThreshold).length || 0;
    const recentSales = salesData?.data || [];

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('MMM D, HH:mm'),
        },
        {
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
            render: (name: string) => name || 'Walk-in',
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
    ];

    if (isLoadingSummary || isLoadingTrend || isLoadingTop) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
                <Title level={2}>Dashboard Overview</Title>
                <Text type="secondary">Welcome back, {user?.email.split('@')[0]}! Here is your business status.</Text>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total Revenue"
                            value={summary?.totalRevenue || 0}
                            precision={2}
                            prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total Profit"
                            value={summary?.totalProfit || 0}
                            precision={2}
                            prefix={<DollarOutlined style={{ color: '#1677ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Low Stock Alert"
                            value={lowStockCount}
                            valueStyle={{ color: lowStockCount > 0 ? '#cf1322' : '#3f8600' }}
                            prefix={<WarningOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total Sales"
                            value={summary?.totalSalesCount || 0}
                            prefix={<HistoryOutlined style={{ color: '#722ed1' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title={<span><LineChartOutlined /> Sales Trend (Last 7 Days)</span>} bordered={false}>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <LineChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(val) => dayjs(val).format('MMM D')} />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
                                    <Line type="monotone" dataKey="amount" stroke="#1677ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title={<span><BarChartOutlined /> Top Products</span>} bordered={false}>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={topProducts} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="totalQuantity" fill="#52c41a" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
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

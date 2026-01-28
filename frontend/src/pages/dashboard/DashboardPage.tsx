import React from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Space, Empty, Spin } from 'antd';
import {
    WarningOutlined,
    DollarOutlined,
    HistoryOutlined,
    LineChartOutlined,
    BarChartOutlined,
    RiseOutlined,
    TrophyOutlined,
    StarOutlined,
    BulbOutlined,
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

    // Staff Performance
    const { data: staffPerformance } = useQuery({
        queryKey: ['analytics-staff'],
        queryFn: () => analyticsService.getStaffPerformance(),
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
                                    <YAxis tickFormatter={(val) => `$${val}`} />
                                    <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
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
                {/* Staff Leaderboard */}
                <Col xs={24} lg={8}>
                    <Card title={<span><TrophyOutlined style={{ color: '#faad14' }} /> Employee Leaderboard</span>} bordered={false} className="glass-card">
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                            {staffPerformance?.map((staff: any, index: number) => (
                                <div key={staff.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: index < staffPerformance.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                    <Space>
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            color: index < 3 ? 'white' : 'black'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <Text strong>{staff.email.split('@')[0]}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>{staff.transactionCount} transactions</Text>
                                        </div>
                                    </Space>
                                    <Text strong style={{ color: '#52c41a' }}>${Number(staff.totalSales).toLocaleString()}</Text>
                                </div>
                            ))}
                            {(!staffPerformance || staffPerformance.length === 0) && <Empty description="No performance data yet" />}
                        </div>
                    </Card>
                </Col>

                {/* Smart Insights */}
                <Col xs={24} lg={16}>
                    <Card title={<span><BulbOutlined style={{ color: '#1890ff' }} /> Smart Insights & Recommendations</span>} bordered={false} className="glass-card">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <div style={{ padding: '16px', background: '#e6f7ff', borderRadius: '8px', marginBottom: '16px' }}>
                                    <Text strong><StarOutlined style={{ color: '#1890ff' }} /> Best Seller Performance</Text>
                                    <div style={{ marginTop: '8px' }}>
                                        {topProducts && topProducts[0] ? (
                                            <Text>Your "{topProducts[0].name}" is the top item. Consider running a bundle promotion to increase its cross-sales.</Text>
                                        ) : (
                                            <Text>Add products to see performance insights.</Text>
                                        )}
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ padding: '16px', background: '#f6ffed', borderRadius: '8px', marginBottom: '16px' }}>
                                    <Text strong><RiseOutlined style={{ color: '#52c41a' }} /> Revenue Growth</Text>
                                    <div style={{ marginTop: '8px' }}>
                                        <Text>Daily revenue is stable. The {dayjs().format('dddd')} surge suggests higher weekend footfall.</Text>
                                    </div>
                                </div>
                            </Col>
                            {lowStockCount > 0 && (
                                <Col span={24}>
                                    <div style={{ padding: '16px', background: '#fff1f0', borderRadius: '8px' }}>
                                        <Text strong><WarningOutlined style={{ color: '#cf1322' }} /> Inventory Risk</Text>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text>You have {lowStockCount} items below threshold. We recommend reordering from your <b>Top Suppliers</b> soon to avoid lost sales.</Text>
                                        </div>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </Card>

                    <Card title="Recent Transactions" bordered={false} style={{ marginTop: 16 }}>
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

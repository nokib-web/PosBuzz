import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Space, Empty, Spin, Button, Tag, Avatar, Segmented } from 'antd';
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
    PlusOutlined,
    ShoppingOutlined,
    ThunderboltOutlined,
    ArrowUpOutlined,
    CheckCircleOutlined,
    UserOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { saleService } from '../../services/sale.service';
import { analyticsService } from '../../services/analytics.service';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [trendDays, setTrendDays] = useState<number>(7);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Stats Summary
    const { data: summary, isLoading: isLoadingSummary } = useQuery({
        queryKey: ['analytics-summary'],
        queryFn: () => analyticsService.getSummary(),
    });

    // Sales Trend
    const { data: trend, isLoading: isLoadingTrend } = useQuery({
        queryKey: ['analytics-trend', trendDays],
        queryFn: () => analyticsService.getTrend(trendDays),
    });

    // Top Products
    const { data: topProducts, isLoading: isLoadingTop } = useQuery({
        queryKey: ['analytics-top-products'],
        queryFn: () => analyticsService.getTopProducts(5),
    });

    // Recent Sales
    const { data: salesData, isLoading: isLoadingSales } = useQuery({
        queryKey: ['sales', 'recent'],
        queryFn: () => saleService.getSales(1, 6),
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

    const lowStockItems = productsData?.data?.filter((p: any) => p.stock_quantity <= p.lowStockThreshold) || [];
    const lowStockCount = lowStockItems.length;
    const recentSales = salesData?.data || [];

    // Calculate revenue stats
    const totalRevenue = summary?.totalRevenue || 0;
    const totalProfit = summary?.totalProfit || 0;
    const totalSalesCount = summary?.totalSalesCount || 0;
    const avgOrderValue = totalSalesCount > 0 ? (totalRevenue / totalSalesCount).toFixed(2) : '0.00';

    const columns = [
        {
            title: 'Transaction Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => (
                <div>
                    <Text strong style={{ display: 'block', fontSize: '13px' }}>{dayjs(date).format('MMM D, YYYY')}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>{dayjs(date).format('HH:mm A')}</Text>
                </div>
            ),
        },
        {
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
            render: (name: string) => (
                <Space>
                    <Avatar size="small" style={{ backgroundColor: '#e2e8f0', color: '#475569' }} icon={<UserOutlined />} />
                    <Text strong style={{ fontSize: '13px' }}>{name || 'Walk-in Customer'}</Text>
                </Space>
            ),
        },
        {
            title: 'Payment Method',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method: string) => (
                <Tag color={method === 'CASH' ? 'green' : method === 'CARD' ? 'blue' : 'purple'} style={{ borderRadius: 6, fontWeight: 600 }}>
                    {method || 'CASH'}
                </Tag>
            ),
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right' as const,
            render: (amount: number) => (
                <Text strong style={{ color: '#10b981', fontSize: '14px' }}>
                    ${Number(amount).toFixed(2)}
                </Text>
            ),
        },
    ];

    if (isLoadingSummary || isLoadingTrend || isLoadingTop) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
                <Spin size="large" />
                <Text type="secondary">Loading real-time POS analytics...</Text>
            </div>
        );
    }

    const BAR_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Hero Header Banner */}
            <div className="dashboard-hero-banner">
                <Row align="middle" justify="space-between" gutter={[16, 16]}>
                    <Col xs={24} md={14}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <Tag color="rgba(255,255,255,0.2)" style={{ color: '#fff', border: 'none', borderRadius: 999, padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>
                                <CheckCircleOutlined style={{ color: '#10b981' }} /> Store Operational • Neon Cloud DB
                            </Tag>
                        </div>
                        <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                            Welcome back, {user?.email?.split('@')[0] || 'Manager'}! 👋
                        </Title>
                        <Text style={{ color: '#c7d2fe', fontSize: '14px', marginTop: 4, display: 'block' }}>
                            Here is an overview of your store's sales performance, inventory status, and staff metrics.
                        </Text>
                    </Col>
                    <Col xs={24} md={10} style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <Space wrap size="middle">
                            <Button
                                type="primary"
                                size="large"
                                icon={<ThunderboltOutlined />}
                                onClick={() => navigate('/sales/new')}
                                style={{
                                    background: '#ffffff',
                                    color: '#4f46e5',
                                    fontWeight: 700,
                                    border: 'none',
                                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                                    borderRadius: 12
                                }}
                            >
                                New POS Sale
                            </Button>
                            <Button
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/products')}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    fontWeight: 600,
                                    borderRadius: 12
                                }}
                            >
                                Add Product
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>

            {/* Top 4 KPI Metrics */}
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="pos-card pos-card-interactive" bordered={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Gross Revenue
                                </Text>
                                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: 4, letterSpacing: '-0.5px' }}>
                                    ${Number(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                    <Tag color="emerald" style={{ background: '#ecfdf5', color: '#059669', border: 'none', borderRadius: 999, fontWeight: 700, fontSize: '11px' }}>
                                        <ArrowUpOutlined /> +14.5% vs last week
                                    </Tag>
                                </div>
                            </div>
                            <div className="kpi-icon-box kpi-icon-emerald">
                                <DollarOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="pos-card pos-card-interactive" bordered={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Net Profit
                                </Text>
                                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: 4, letterSpacing: '-0.5px' }}>
                                    ${Number(totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                    <Tag color="indigo" style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: 999, fontWeight: 700, fontSize: '11px' }}>
                                        <RiseOutlined /> Estimated Margin 24%
                                    </Tag>
                                </div>
                            </div>
                            <div className="kpi-icon-box kpi-icon-indigo">
                                <RiseOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="pos-card pos-card-interactive" bordered={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Completed Sales
                                </Text>
                                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: 4, letterSpacing: '-0.5px' }}>
                                    {totalSalesCount} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>orders</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        Avg Order: <strong style={{ color: '#0f172a' }}>${avgOrderValue}</strong>
                                    </Text>
                                </div>
                            </div>
                            <div className="kpi-icon-box kpi-icon-violet">
                                <ShoppingOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="pos-card pos-card-interactive" bordered={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Inventory Risk
                                </Text>
                                <div style={{ fontSize: '26px', fontWeight: 800, color: lowStockCount > 0 ? '#dc2626' : '#16a34a', marginTop: 4, letterSpacing: '-0.5px' }}>
                                    {lowStockCount} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>items low</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                    <Tag color={lowStockCount > 0 ? 'red' : 'green'} style={{ border: 'none', borderRadius: 999, fontWeight: 700, fontSize: '11px' }}>
                                        {lowStockCount > 0 ? 'Action Recommended' : 'Optimal Stock Levels'}
                                    </Tag>
                                </div>
                            </div>
                            <div className="kpi-icon-box kpi-icon-amber">
                                <WarningOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[20, 20]}>
                {/* Sales Revenue Trend Chart */}
                <Col xs={24} lg={16}>
                    <Card
                        className="pos-card"
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Space align="center">
                                    <LineChartOutlined style={{ color: '#4f46e5', fontSize: '18px' }} />
                                    <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Sales Revenue Trend</span>
                                </Space>
                                <Segmented
                                    options={[
                                        { label: '7 Days', value: 7 },
                                        { label: '30 Days', value: 30 },
                                    ]}
                                    value={trendDays}
                                    onChange={(value) => setTrendDays(Number(value))}
                                />
                            </div>
                        }
                        bordered={false}
                    >
                        <div style={{ width: '100%', height: 320, marginTop: 10 }}>
                            <ResponsiveContainer>
                                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(val) => dayjs(val).format('MMM D')} stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis tickFormatter={(val) => `$${val}`} stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                                        itemStyle={{ color: '#818cf8', fontWeight: 700 }}
                                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                                        labelFormatter={(label) => dayjs(label).format('MMMM D, YYYY')}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 7, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Top Selling Products */}
                <Col xs={24} lg={8}>
                    <Card
                        className="pos-card"
                        title={
                            <Space align="center">
                                <BarChartOutlined style={{ color: '#10b981', fontSize: '18px' }} />
                                <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Top Selling Products</span>
                            </Space>
                        }
                        bordered={false}
                    >
                        <div style={{ width: '100%', height: 320 }}>
                            {topProducts && topProducts.length > 0 ? (
                                <ResponsiveContainer>
                                    <BarChart data={topProducts} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff' }}
                                            formatter={(value: any) => [`${value} units`, 'Quantity Sold']}
                                        />
                                        <Bar dataKey="totalQuantity" radius={[0, 8, 8, 0]}>
                                            {topProducts.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                    <Empty description="No product sales recorded yet" />
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Bottom 3 Grid Columns */}
            <Row gutter={[20, 20]}>
                {/* Employee Leaderboard */}
                <Col xs={24} lg={8}>
                    <Card
                        className="pos-card"
                        title={
                            <Space align="center">
                                <TrophyOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />
                                <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Staff Leaderboard</span>
                            </Space>
                        }
                        bordered={false}
                        style={{ height: '100%' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {staffPerformance?.map((staff: any, index: number) => {
                                const rankColor = index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#d97706' : '#e2e8f0';
                                return (
                                    <div
                                        key={staff.email}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 14px',
                                            background: index === 0 ? '#fffbeb' : '#f8fafc',
                                            borderRadius: 12,
                                            border: index === 0 ? '1px solid #fde68a' : '1px solid #f1f5f9'
                                        }}
                                    >
                                        <Space size="middle">
                                            <div style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: '50%',
                                                background: rankColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 800,
                                                color: index < 3 ? '#ffffff' : '#475569',
                                                fontSize: '14px'
                                            }}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <Text strong style={{ display: 'block', fontSize: '14px' }}>{staff.name || staff.email.split('@')[0]}</Text>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>{staff.transactionCount} total sales</Text>
                                            </div>
                                        </Space>
                                        <Text strong style={{ color: '#10b981', fontSize: '14px' }}>
                                            ${Number(staff.totalSales).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </Text>
                                    </div>
                                );
                            })}
                            {(!staffPerformance || staffPerformance.length === 0) && (
                                <Empty description="No staff performance recorded yet" />
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Recent Transactions & Smart Insights */}
                <Col xs={24} lg={16}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Smart AI Recommendations */}
                        <Card
                            className="pos-card"
                            title={
                                <Space align="center">
                                    <BulbOutlined style={{ color: '#6366f1', fontSize: '18px' }} />
                                    <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Smart AI Insights & Recommendations</span>
                                </Space>
                            }
                            bordered={false}
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <div style={{ padding: '16px', background: '#eef2ff', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
                                        <Space style={{ marginBottom: 6 }}>
                                            <StarOutlined style={{ color: '#4f46e5', fontSize: '16px' }} />
                                            <Text strong style={{ color: '#312e81' }}>Top Selling Strategy</Text>
                                        </Space>
                                        <Text style={{ display: 'block', fontSize: '13px', color: '#4338ca' }}>
                                            {topProducts && topProducts[0] ? (
                                                <><strong>"{topProducts[0].name}"</strong> is your highest demand item. Consider creating bundle packages to boost cart totals.</>
                                            ) : (
                                                "Start processing checkout orders to view automated cross-selling insights."
                                            )}
                                        </Text>
                                    </div>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                                        <Space style={{ marginBottom: 6 }}>
                                            <RiseOutlined style={{ color: '#059669', fontSize: '16px' }} />
                                            <Text strong style={{ color: '#064e3b' }}>Peak Sales Hours</Text>
                                        </Space>
                                        <Text style={{ display: 'block', fontSize: '13px', color: '#047857' }}>
                                            Store revenue surges during afternoons. Ensure cashier terminals are fully staffed during peak checkout hours.
                                        </Text>
                                    </div>
                                </Col>
                                {lowStockCount > 0 && (
                                    <Col span={24}>
                                        <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                            <div>
                                                <Space style={{ marginBottom: 4 }}>
                                                    <WarningOutlined style={{ color: '#dc2626', fontSize: '16px' }} />
                                                    <Text strong style={{ color: '#991b1b' }}>Inventory Replenishment Alert</Text>
                                                </Space>
                                                <Text style={{ display: 'block', fontSize: '13px', color: '#b91c1c' }}>
                                                    You have <strong>{lowStockCount} items</strong> below safety threshold. Restock now to prevent lost retail orders.
                                                </Text>
                                            </div>
                                            <Button type="primary" danger size="small" onClick={() => navigate('/products')} icon={<RightOutlined />}>
                                                Restock Products
                                            </Button>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Card>

                        {/* Recent Transactions Table */}
                        <Card
                            className="pos-card"
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space align="center">
                                        <HistoryOutlined style={{ color: '#4f46e5', fontSize: '18px' }} />
                                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Recent Sales Activity</span>
                                    </Space>
                                    <Button type="link" onClick={() => navigate('/sales')} style={{ fontWeight: 600, padding: 0 }}>
                                        View All Sales <RightOutlined />
                                    </Button>
                                </div>
                            }
                            bordered={false}
                        >
                            {recentSales.length > 0 ? (
                                <Table
                                    className="pos-table"
                                    columns={columns}
                                    dataSource={recentSales}
                                    rowKey="id"
                                    pagination={false}
                                    loading={isLoadingSales}
                                />
                            ) : (
                                <Empty description="No recent sales recorded yet. Use POS Checkout to process orders!" />
                            )}
                        </Card>
                    </Space>
                </Col>
            </Row>
        </Space>
    );
};

export default DashboardPage;

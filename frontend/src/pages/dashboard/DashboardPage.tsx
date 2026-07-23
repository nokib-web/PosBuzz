import React, { useState } from 'react';
import { Row, Col, Card, Typography, Table, Space, Empty, Spin, Button, Input, Select, Checkbox, Avatar } from 'antd';
import {
    RiseOutlined,
    FallOutlined,
    SearchOutlined,
    FilterOutlined,
    MoreOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { saleService } from '../../services/sale.service';
import { analyticsService } from '../../services/analytics.service';
import { useNavigate } from 'react-router-dom';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar,
    Cell,
    Tooltip as RechartsTooltip,
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeKpi, setActiveKpi] = useState<number>(0);
    const [, setAnalyticsTimeframe] = useState<string>('week');
    const [, setPerformanceTimeframe] = useState<string>('year');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Fetch Stats Summary
    const { data: summary, isLoading: isLoadingSummary } = useQuery({
        queryKey: ['analytics-summary'],
        queryFn: () => analyticsService.getSummary(),
    });

    // Fetch Trend Data
    const { data: trend, isLoading: isLoadingTrend } = useQuery({
        queryKey: ['analytics-trend'],
        queryFn: () => analyticsService.getTrend(7),
    });

    // Fetch Recent Sales
    const { data: salesData, isLoading: isLoadingSales } = useQuery({
        queryKey: ['sales', 'recent-list'],
        queryFn: () => saleService.getSales(1, 8),
    });

    // Process metric figures
    const grossRevenue = summary?.totalRevenue || 2427;
    const totalOrders = summary?.totalSalesCount || 2427;
    const avgOrderValue = totalOrders > 0 ? (grossRevenue / totalOrders).toFixed(2) : '227.28';
    const totalProfit = summary?.totalProfit || 2427;

    const recentSales = salesData?.data || [];

    // Filter sales by search term if typed
    const filteredSales = recentSales.filter((sale: any) => {
        if (!searchTerm) return true;
        const name = sale.customer?.name || 'Walk-in';
        const id = sale.id || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || id.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Custom Tooltip for Order Analytics Chart matching #d6d750
    const CustomAnalyticsTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: '#09090b',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(9, 9, 11, 0.3)',
                    border: '1px solid #27272a',
                    textAlign: 'center',
                    color: '#ffffff'
                }}>
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: 2, color: '#a1a1aa' }}>
                        {dayjs(label).format('ddd, MMM D')}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d6d750' }}></div>
                        <Text strong style={{ fontSize: '14px', color: '#d6d750' }}>
                            ${Number(payload[0].value).toFixed(2)}
                        </Text>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Performance bar chart mock data
    const performanceData = [
        { day: 'Mon', value: 35 },
        { day: 'Tue', value: 65 },
        { day: 'Wed', value: 90 },
        { day: 'Wed', value: 125, active: true },
        { day: 'Wed', value: 45 },
        { day: 'Wed', value: 60 },
        { day: 'Wed', value: 80 },
    ];

    const columns = [
        {
            title: '',
            dataIndex: 'checkbox',
            key: 'checkbox',
            width: 40,
            render: () => <Checkbox />,
        },
        {
            title: 'CUSTOMER ID',
            dataIndex: 'customer',
            key: 'customer',
            render: (_: any, record: any) => {
                const customerName = record.customer?.name || 'Walk-in Customer';
                const idNum = (record.id || '706682356556').substring(0, 12);
                const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.id || 'customer'}`;
                return (
                    <Space size="middle">
                        <Avatar src={avatarUrl} size={36} style={{ background: '#f9fae6', border: '1px solid #ecee91' }} />
                        <div>
                            <Text strong style={{ display: 'block', fontSize: '13px', color: '#09090b' }}>
                                ID: {idNum}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px', color: '#71717a' }}>{customerName}</Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'ORDER DATE',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => (
                <Text style={{ color: '#52525b', fontSize: '13px' }}>
                    {dayjs(date).format('D MMM, YYYY')}
                </Text>
            ),
        },
        {
            title: 'PRODUCT NAME',
            dataIndex: 'items',
            key: 'productName',
            render: (items: any[]) => {
                const productName = items && items[0]?.product?.name ? items[0].product.name : 'Retail Product Items';
                return (
                    <Text strong style={{ color: '#09090b', fontSize: '13px' }}>
                        {productName.length > 22 ? `${productName.substring(0, 22)}...` : productName}
                    </Text>
                );
            },
        },
        {
            title: 'QUANTITY',
            dataIndex: 'items',
            key: 'quantity',
            render: (items: any[]) => {
                const totalQty = items ? items.reduce((acc, item) => acc + (item.quantity || 1), 0) : 1;
                return <Text style={{ color: '#52525b', fontSize: '13px', fontWeight: 600 }}>{totalQty}</Text>;
            },
        },
        {
            title: 'AMOUNTS',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount: number) => (
                <Text strong style={{ color: '#09090b', fontSize: '14px' }}>
                    $ {Number(amount).toFixed(0)}
                </Text>
            ),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (_: any, __: any, index: number) => {
                const statuses = [
                    { label: 'ON DELIVERY', class: 'status-pill-delivery' },
                    { label: 'PENDING', class: 'status-pill-pending' },
                    { label: 'REMOVED', class: 'status-pill-removed' },
                ];
                const currentStatus = statuses[index % 3];
                return (
                    <span className={`status-pill ${currentStatus.class}`}>
                        {currentStatus.label}
                    </span>
                );
            },
        },
        {
            title: '',
            key: 'action',
            width: 40,
            render: () => <MoreOutlined style={{ fontSize: '18px', color: '#a1a1aa', cursor: 'pointer' }} />,
        },
    ];

    if (isLoadingSummary || isLoadingTrend) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
                <Spin size="large" />
                <Text type="secondary">Loading Incircle POS Analytics...</Text>
            </div>
        );
    }

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Top Page Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#09090b', fontSize: '28px', letterSpacing: '-0.5px' }}>
                    Order
                </Title>
                <Button
                    type="primary"
                    className="btn-purple-primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/sales/new')}
                    style={{ height: 44, padding: '0 24px' }}
                >
                    Create Order
                </Button>
            </div>

            {/* Top 4 KPI Metrics Row with #d6d750 active underline */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <div
                        className={`incircle-card ${activeKpi === 0 ? 'incircle-card-active' : ''}`}
                        onClick={() => setActiveKpi(0)}
                        style={{ padding: '20px', cursor: 'pointer', background: '#ffffff', borderRadius: '16px' }}
                    >
                        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, display: 'block', color: '#71717a' }}>
                            Gross Revenue
                        </Text>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#09090b', margin: '4px 0 8px', letterSpacing: '-0.5px' }}>
                            ${Number(grossRevenue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <RiseOutlined style={{ color: '#16a34a', fontSize: '12px' }} />
                            <Text style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700 }}>5.54%</Text>
                            <Text type="secondary" style={{ fontSize: '12px', color: '#a1a1aa' }}>From last month</Text>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <div
                        className={`incircle-card ${activeKpi === 1 ? 'incircle-card-active' : ''}`}
                        onClick={() => setActiveKpi(1)}
                        style={{ padding: '20px', cursor: 'pointer', background: '#ffffff', borderRadius: '16px' }}
                    >
                        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, display: 'block', color: '#71717a' }}>
                            Avg.Order Value
                        </Text>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#09090b', margin: '4px 0 8px', letterSpacing: '-0.5px' }}>
                            ${avgOrderValue}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <RiseOutlined style={{ color: '#16a34a', fontSize: '12px' }} />
                            <Text style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700 }}>5.54%</Text>
                            <Text type="secondary" style={{ fontSize: '12px', color: '#a1a1aa' }}>From last month</Text>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <div
                        className={`incircle-card ${activeKpi === 2 ? 'incircle-card-active' : ''}`}
                        onClick={() => setActiveKpi(2)}
                        style={{ padding: '20px', cursor: 'pointer', background: '#ffffff', borderRadius: '16px' }}
                    >
                        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, display: 'block', color: '#71717a' }}>
                            Total Orders
                        </Text>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#09090b', margin: '4px 0 8px', letterSpacing: '-0.5px' }}>
                            {Number(totalOrders).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FallOutlined style={{ color: '#dc2626', fontSize: '12px' }} />
                            <Text style={{ color: '#dc2626', fontSize: '12px', fontWeight: 700 }}>1.20%</Text>
                            <Text type="secondary" style={{ fontSize: '12px', color: '#a1a1aa' }}>From last month</Text>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <div
                        className={`incircle-card ${activeKpi === 3 ? 'incircle-card-active' : ''}`}
                        onClick={() => setActiveKpi(3)}
                        style={{ padding: '20px', cursor: 'pointer', background: '#ffffff', borderRadius: '16px' }}
                    >
                        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, display: 'block', color: '#71717a' }}>
                            Lifetime value
                        </Text>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#09090b', margin: '4px 0 8px', letterSpacing: '-0.5px' }}>
                            ${Number(totalProfit).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <RiseOutlined style={{ color: '#16a34a', fontSize: '12px' }} />
                            <Text style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700 }}>5.54%</Text>
                            <Text type="secondary" style={{ fontSize: '12px', color: '#a1a1aa' }}>From last month</Text>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[20, 20]}>
                {/* Order Analytics Smooth Lime Area Chart */}
                <Col xs={24} lg={16}>
                    <Card
                        className="incircle-card"
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text strong style={{ fontSize: '18px', color: '#09090b', fontWeight: 700 }}>
                                    Order Analytics
                                </Text>
                                <Select
                                    defaultValue="This Week"
                                    style={{ width: 120 }}
                                    options={[
                                        { value: 'week', label: 'This Week' },
                                        { value: 'month', label: 'This Month' },
                                    ]}
                                    onChange={(value) => setAnalyticsTimeframe(value)}
                                />
                            </div>
                        }
                        bordered={false}
                    >
                        <div style={{ width: '100%', height: 280, marginTop: 10 }}>
                            <ResponsiveContainer>
                                <AreaChart data={trend} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorLime" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d6d750" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#d6d750" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(val) => dayjs(val).format('ddd')} stroke="#a1a1aa" fontSize={12} tickLine={false} />
                                    <YAxis tickFormatter={(val) => `$${val}`} stroke="#a1a1aa" fontSize={12} tickLine={false} domain={[0, 150]} />
                                    <RechartsTooltip content={<CustomAnalyticsTooltip />} />
                                    <Area type="monotone" dataKey="amount" stroke="#b3b52d" strokeWidth={3} fillOpacity={1} fill="url(#colorLime)" dot={{ r: 4, fill: '#d6d750', strokeWidth: 2, stroke: '#09090b' }} activeDot={{ r: 6, fill: '#09090b' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Performance Bar Chart with #d6d750 Active Cell */}
                <Col xs={24} lg={8}>
                    <Card
                        className="incircle-card"
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text strong style={{ fontSize: '18px', color: '#09090b', fontWeight: 700 }}>
                                    Performance
                                </Text>
                                <Select
                                    defaultValue="Year"
                                    style={{ width: 90 }}
                                    options={[
                                        { value: 'year', label: 'Year' },
                                        { value: 'month', label: 'Month' },
                                    ]}
                                    onChange={(value) => setPerformanceTimeframe(value)}
                                />
                            </div>
                        }
                        bordered={false}
                    >
                        <div style={{ width: '100%', height: 280, marginTop: 10 }}>
                            <ResponsiveContainer>
                                <BarChart data={performanceData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="day" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                                    <YAxis tickFormatter={(val) => `$${val}`} stroke="#a1a1aa" fontSize={12} tickLine={false} />
                                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                                        {performanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.active ? '#d6d750' : '#e4e4e7'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Bottom Order List Section */}
            <Card
                className="incircle-card"
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <Text strong style={{ fontSize: '18px', color: '#09090b', fontWeight: 700 }}>
                            Order List
                        </Text>
                        <Space size="middle">
                            <Input
                                prefix={<SearchOutlined style={{ color: '#a1a1aa' }} />}
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 220, borderRadius: 10, border: '1px solid #e4e4e7' }}
                            />
                            <Button icon={<FilterOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>
                                Filter
                            </Button>
                        </Space>
                    </div>
                }
                bordered={false}
            >
                {filteredSales.length > 0 ? (
                    <Table
                        className="incircle-table"
                        columns={columns}
                        dataSource={filteredSales}
                        rowKey="id"
                        pagination={false}
                        loading={isLoadingSales}
                    />
                ) : (
                    <Empty description="No orders found. Process checkout sales to build your order list!" />
                )}
            </Card>
        </Space>
    );
};

export default DashboardPage;

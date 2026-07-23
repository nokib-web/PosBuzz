import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Space, Drawer, Tag, Avatar } from 'antd';
import {
    DashboardOutlined,
    ShoppingOutlined,
    PlusCircleOutlined,
    HistoryOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    ShopOutlined,
    GiftOutlined,
    ThunderboltOutlined,
    CloudServerOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setMobileDrawerOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/dashboard" onClick={() => setMobileDrawerOpen(false)}>Dashboard</Link>,
        },
        {
            key: '/products',
            icon: <ShoppingOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/products" onClick={() => setMobileDrawerOpen(false)}>Products & Inventory</Link>,
        },
        {
            key: '/sales/new',
            icon: <PlusCircleOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/sales/new" onClick={() => setMobileDrawerOpen(false)}>POS Checkout</Link>,
        },
        {
            key: '/sales',
            icon: <HistoryOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/sales" onClick={() => setMobileDrawerOpen(false)}>Sales History</Link>,
        },
        {
            key: '/customers',
            icon: <UserOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/customers" onClick={() => setMobileDrawerOpen(false)}>Customers</Link>,
        },
        {
            key: '/suppliers',
            icon: <ShopOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/suppliers" onClick={() => setMobileDrawerOpen(false)}>Suppliers</Link>,
        },
        {
            key: '/promotions',
            icon: <GiftOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/promotions" onClick={() => setMobileDrawerOpen(false)}>Promotions</Link>,
        },
    ];

    const SidebarContent = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
            {/* Logo Header */}
            <div style={{
                height: 70,
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
                    }}>
                        🐝
                    </div>
                    {(isMobile || !collapsed) && (
                        <div>
                            <Title level={4} style={{ color: '#ffffff', margin: 0, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
                                POSBuzz
                            </Title>
                            <Text style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500 }}>Pro POS Edition</Text>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ background: 'transparent', borderRight: 0, fontWeight: 500 }}
                />
            </div>

            {/* Logout Footer */}
            <div style={{ padding: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Button
                    type="text"
                    icon={<LogoutOutlined style={{ color: '#f43f5e' }} />}
                    onClick={handleLogout}
                    style={{
                        color: '#cbd5e1',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        height: 42,
                        borderRadius: 8
                    }}
                >
                    {(isMobile || !collapsed) && <span style={{ fontWeight: 600 }}>Sign Out</span>}
                </Button>
            </div>
        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {!isMobile && (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    breakpoint="lg"
                    collapsedWidth={80}
                    width={260}
                    style={{
                        background: '#0f172a',
                        boxShadow: '4px 0 20px rgba(15, 23, 42, 0.05)',
                        position: 'sticky',
                        top: 0,
                        height: '100vh'
                    }}
                >
                    {SidebarContent}
                </Sider>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setMobileDrawerOpen(false)}
                    open={mobileDrawerOpen}
                    width={260}
                    styles={{ body: { padding: 0, background: '#0f172a' }, header: { display: 'none' } }}
                    closable={false}
                >
                    {SidebarContent}
                </Drawer>
            )}

            <Layout style={{ background: '#f8fafc' }}>
                {/* Header Navbar */}
                <Header style={{
                    padding: '0 24px',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 70,
                    boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 9
                }}>
                    <Space size="large">
                        <Button
                            type="text"
                            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
                            onClick={() => isMobile ? setMobileDrawerOpen(true) : setCollapsed(!collapsed)}
                            style={{ fontSize: '18px', width: 40, height: 40, color: '#475569' }}
                        />
                        <div className="pulse-badge">
                            <span className="pulse-dot"></span>
                            <CloudServerOutlined /> Live Cloud Sync
                        </div>
                    </Space>

                    <Space size="middle" align="center">
                        <Button
                            type="primary"
                            icon={<ThunderboltOutlined />}
                            onClick={() => navigate('/sales/new')}
                            style={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                                height: 38,
                                padding: '0 20px',
                                fontWeight: 600
                            }}
                        >
                            Quick POS Checkout
                        </Button>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '4px 12px 4px 6px',
                            background: '#f1f5f9',
                            borderRadius: 999,
                            border: '1px solid #e2e8f0'
                        }}>
                            <Avatar style={{ backgroundColor: '#4f46e5' }} icon={<UserOutlined />} size={30} />
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                <Text strong style={{ fontSize: '13px', color: '#0f172a' }}>{user?.email?.split('@')[0] || 'Admin'}</Text>
                                <Tag color="indigo" style={{ fontSize: '10px', padding: '0 6px', margin: 0, width: 'fit-content', border: 'none' }}>
                                    {user?.role || 'ADMIN'}
                                </Tag>
                            </div>
                        </div>
                    </Space>
                </Header>

                {/* Main Body Content */}
                <Content style={{ margin: '24px', minHeight: 280 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;

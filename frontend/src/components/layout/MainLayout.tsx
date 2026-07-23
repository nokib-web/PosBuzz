import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Space, Drawer, Input, Badge, Avatar } from 'antd';
import {
    HomeOutlined,
    ShoppingOutlined,
    PlusCircleOutlined,
    HistoryOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    ShopOutlined,
    GiftOutlined,
    SearchOutlined,
    BellOutlined,
    ThunderboltOutlined,
    AppstoreOutlined,
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

    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
            if (window.innerWidth >= 992) {
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
            icon: <HomeOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/dashboard" onClick={() => setMobileDrawerOpen(false)}>Home</Link>,
        },
        {
            key: '/products',
            icon: <ShoppingOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/products" onClick={() => setMobileDrawerOpen(false)}>Item / Products</Link>,
        },
        {
            key: '/sales/new',
            icon: <PlusCircleOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/sales/new" onClick={() => setMobileDrawerOpen(false)}>POS Checkout</Link>,
        },
        {
            key: '/sales',
            icon: <HistoryOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/sales" onClick={() => setMobileDrawerOpen(false)}>Transactions</Link>,
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
            {/* Logo Brand */}
            <div style={{
                height: 80,
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                borderBottom: '1px solid #e4e4e7'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: '#d6d750',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#09090b',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 14px rgba(214, 215, 80, 0.4)'
                    }}>
                        <AppstoreOutlined />
                    </div>
                    {(isMobile || !collapsed) && (
                        <Title level={3} style={{ color: '#09090b', margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                            POSBuzz
                        </Title>
                    )}
                </div>
            </div>

            {/* Menu Items */}
            <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
                <Menu
                    className="incircle-menu"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ borderRight: 0, background: 'transparent' }}
                />
            </div>

            {/* Bottom Upgrade Card */}
            {(isMobile || !collapsed) && (
                <div className="sidebar-upgrade-card">
                    <div className="rocket-icon-bg">
                        ⚡
                    </div>
                    <Text strong style={{ display: 'block', fontSize: '14px', color: '#09090b', marginBottom: 4 }}>
                        Get premium features
                    </Text>
                    <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: 14, lineHeight: 1.4, color: '#71717a' }}>
                        Get premium for access all features in there.
                    </Text>
                    <Button
                        type="primary"
                        className="btn-purple-primary"
                        block
                        onClick={() => navigate('/sales/new')}
                    >
                        New Sale POS
                    </Button>
                </div>
            )}

            {/* Logout Footer */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #e4e4e7' }}>
                <Button
                    type="text"
                    icon={<LogoutOutlined style={{ color: '#ef4444' }} />}
                    onClick={handleLogout}
                    style={{
                        color: '#71717a',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        height: 40,
                        fontWeight: 600
                    }}
                >
                    {(isMobile || !collapsed) && 'Logout Account'}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="app-workspace-container">
            <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
                {!isMobile && (
                    <Sider
                        className="incircle-sidebar"
                        trigger={null}
                        collapsible
                        collapsed={collapsed}
                        collapsedWidth={80}
                        width={250}
                        style={{
                            background: '#ffffff',
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
                        width={250}
                        styles={{ body: { padding: 0, background: '#ffffff' }, header: { display: 'none' } }}
                        closable={false}
                    >
                        {SidebarContent}
                    </Drawer>
                )}

                <Layout style={{ background: '#ffffff' }}>
                    {/* Top Navbar Header */}
                    <Header style={{
                        padding: '0 32px',
                        background: '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 80,
                        borderBottom: '1px solid #e4e4e7',
                        position: 'sticky',
                        top: 0,
                        zIndex: 9
                    }}>
                        <Space size="middle">
                            <Button
                                type="text"
                                icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
                                onClick={() => isMobile ? setMobileDrawerOpen(true) : setCollapsed(!collapsed)}
                                style={{ fontSize: '18px', color: '#71717a' }}
                            />
                            {!isMobile && (
                                <Input
                                    prefix={<SearchOutlined style={{ color: '#a1a1aa' }} />}
                                    placeholder="Search products, orders, customers..."
                                    style={{ width: 280, borderRadius: 12, background: '#f4f4f5', border: '1px solid #e4e4e7' }}
                                />
                            )}
                        </Space>

                        <Space size="large" align="center">
                            <Badge dot color="#d6d750">
                                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: '20px', color: '#71717a' }} />} />
                            </Badge>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Brandon" size={40} style={{ background: '#f9fae6', border: '2px solid #ecee91' }} />
                                {!isMobile && (
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                        <Text strong style={{ fontSize: '14px', color: '#09090b' }}>{user?.email?.split('@')[0] || 'Brandon Lubin'}</Text>
                                        <Text type="secondary" style={{ fontSize: '11px', textTransform: 'capitalize', color: '#71717a' }}>{user?.role || 'Store Manager'}</Text>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="primary"
                                className="btn-purple-primary"
                                icon={<ThunderboltOutlined />}
                                size="large"
                                onClick={() => navigate('/sales/new')}
                                style={{ height: 44, padding: '0 24px' }}
                            >
                                Create Order
                            </Button>
                        </Space>
                    </Header>

                    {/* Main Content View */}
                    <Content style={{ padding: '32px', background: '#ffffff', minHeight: 280 }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </div>
    );
};

export default MainLayout;

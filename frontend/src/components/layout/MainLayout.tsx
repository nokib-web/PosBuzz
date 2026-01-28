import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Space, theme, Drawer } from 'antd';
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
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

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
            icon: <DashboardOutlined />,
            label: <Link to="/dashboard" onClick={() => setMobileDrawerOpen(false)}>Dashboard</Link>,
        },
        {
            key: '/products',
            icon: <ShoppingOutlined />,
            label: <Link to="/products" onClick={() => setMobileDrawerOpen(false)}>Products</Link>,
        },
        {
            key: '/sales/new',
            icon: <PlusCircleOutlined />,
            label: <Link to="/sales/new" onClick={() => setMobileDrawerOpen(false)}>Create Sale</Link>,
        },
        {
            key: '/sales',
            icon: <HistoryOutlined />,
            label: <Link to="/sales" onClick={() => setMobileDrawerOpen(false)}>Sales History</Link>,
        },
        {
            key: '/customers',
            icon: <UserOutlined />,
            label: <Link to="/customers" onClick={() => setMobileDrawerOpen(false)}>Customers</Link>,
        },
        {
            key: '/suppliers',
            icon: <ShopOutlined />,
            label: <Link to="/suppliers" onClick={() => setMobileDrawerOpen(false)}>Suppliers</Link>,
        },
        {
            key: '/promotions',
            icon: <GiftOutlined />,
            label: <Link to="/promotions" onClick={() => setMobileDrawerOpen(false)}>Promotions</Link>,
        },
    ];

    const SidebarContent = (
        <>
            <div style={{
                height: 64,
                margin: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
                overflow: 'hidden'
            }}>
                {collapsed && !isMobile ? (
                    <img src="/favicon.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src="/favicon.png" alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                        <h2 style={{ color: isMobile ? '#000' : 'white', margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>POSBuzz</h2>
                    </div>
                )}
            </div>
            <Menu
                theme={isMobile ? "light" : "dark"}
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                style={{ borderRight: 0 }}
            />
            <div style={{ position: 'absolute', bottom: 16, width: '100%', padding: '0 16px' }}>
                <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{
                        color: isMobile ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.65)',
                        width: '100%',
                        textAlign: 'left',
                        padding: '4px 15px'
                    }}
                >
                    {(isMobile || !collapsed) && 'Logout'}
                </Button>
            </div>
        </>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {!isMobile && (
                <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg" collapsedWidth={80}>
                    {SidebarContent}
                </Sider>
            )}

            {/* Mobile Drawer Sidebar */}
            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setMobileDrawerOpen(false)}
                    open={mobileDrawerOpen}
                    width={250}
                    styles={{ body: { padding: 0 }, header: { display: 'none' } }}
                    closable={false}
                >
                    {SidebarContent}
                </Drawer>
            )}

            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
                    <Button
                        type="text"
                        icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
                        onClick={() => isMobile ? setMobileDrawerOpen(true) : setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <Space>
                        <UserOutlined />
                        <Text strong>{user?.email}</Text>
                    </Space>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        overflowX: 'hidden'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;

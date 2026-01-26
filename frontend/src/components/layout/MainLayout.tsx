import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Space, theme } from 'antd';
import {
    DashboardOutlined,
    ShoppingOutlined,
    PlusCircleOutlined,
    HistoryOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/dashboard">Dashboard</Link>,
        },
        {
            key: '/products',
            icon: <ShoppingOutlined />,
            label: <Link to="/products">Products</Link>,
        },
        {
            key: '/sales/new',
            icon: <PlusCircleOutlined />,
            label: <Link to="/sales/new">Create Sale</Link>,
        },
        {
            key: '/sales',
            icon: <HistoryOutlined />,
            label: <Link to="/sales">Sales History</Link>,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg">
                <div style={{
                    height: 64,
                    margin: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 8
                }}>
                    <h2 style={{ color: 'white', margin: 0 }}>{collapsed ? 'PB' : 'POSBuzz'}</h2>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                />
                <div style={{ position: 'absolute', bottom: 16, width: '100%', padding: '0 16px' }}>
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        style={{ color: 'rgba(255,255,255,0.65)', width: '100%', textAlign: 'left', padding: 0 }}
                    >
                        {!collapsed && 'Logout'}
                    </Button>
                </div>
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
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
                        overflow: 'initial'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;

import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Typography, Space, Tooltip, Drawer, Tag, Modal, Form, InputNumber, Input, message, Select, Card, Grid } from 'antd';
import {
    HomeOutlined,
    ShoppingCartOutlined,
    HistoryOutlined,
    UserOutlined,
    ShopOutlined,
    GiftOutlined,
    LogoutOutlined,
    SunOutlined,
    MoonOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PlusCircleOutlined,
    CalculatorOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    LockOutlined,
    PlusOutlined,
    DeleteOutlined,
    SettingOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useBranch } from '../../contexts/BranchContext';
import { useQuery } from '@tanstack/react-query';
import { saleService } from '../../services/sale.service';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { Option } = Select;

export interface StaffUser {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'CASHIER';
    branchId: string;
}

interface MainLayoutProps {
    children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { formatAmount } = useCurrency();
    const { branches, activeBranch, setActiveBranchById, addBranch, deleteBranch } = useBranch();
    const location = useLocation();
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    // Role Based Access Control Flags
    const isAdmin = user?.role === 'ADMIN';
    const isManager = user?.role === 'MANAGER';
    const isCashier = user?.role === 'CASHIER';
    const canSwitchStore = isAdmin || isManager;

    // Branch Store Modal State
    const [isStoreManagerOpen, setIsStoreManagerOpen] = useState(false);
    const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
    const [branchForm] = Form.useForm();

    // Cash Till Shift Management State
    const [isTillModalOpen, setIsTillModalOpen] = useState(false);
    const [shiftStatus, setShiftStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
    const [openingFloat] = useState<number>(10000);
    const [tillForm] = Form.useForm();

    // Fetch real sales count and total sum for cash till calculation
    const { data: salesData } = useQuery({
        queryKey: ['sales-till-calc'],
        queryFn: () => saleService.getSales(1, 200),
    });

    const totalCashSalesInShift = (salesData?.data || []).reduce((acc: number, sale: any) => acc + Number(sale.total_amount || 0), 0);
    const expectedTillBalance = openingFloat + totalCashSalesInShift;

    const isMobile = !screens.md;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCreateBranchSubmit = (values: { name: string; address: string; phone: string; manager: string }) => {
        addBranch(values);
        setIsAddBranchModalOpen(false);
        branchForm.resetFields();
        message.success(`Branch outlet "${values.name}" created successfully!`);
    };

    const handleCloseShiftSubmit = (values: { countAmount: number }) => {
        const difference = values.countAmount - expectedTillBalance;
        setShiftStatus('CLOSED');
        setIsTillModalOpen(false);

        Modal.info({
            title: 'Till Shift Closed & Reconciled',
            content: (
                <div>
                    <p>Branch: <strong>{activeBranch.name}</strong></p>
                    <p>Opening Cash Float: <strong>{formatAmount(openingFloat)}</strong></p>
                    <p>Total Cash Sales: <strong>{formatAmount(totalCashSalesInShift)}</strong></p>
                    <p>Expected Till Balance: <strong>{formatAmount(expectedTillBalance)}</strong></p>
                    <p>Actual Counted Cash: <strong>{formatAmount(values.countAmount)}</strong></p>
                    {difference === 0 ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>Perfect Match! Zero Discrepancy</Tag>
                    ) : difference > 0 ? (
                        <Tag color="blue">Surplus: +{formatAmount(difference)}</Tag>
                    ) : (
                        <Tag color="red">Shortage: -{formatAmount(Math.abs(difference))}</Tag>
                    )}
                </div>
            )
        });
    };

    const menuItems = isCashier ? [
        {
            key: '/sales/new',
            icon: <PlusCircleOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/sales/new" onClick={() => setMobileDrawerOpen(false)}>POS Checkout</Link>,
        },
        {
            key: '/products',
            icon: <ShoppingCartOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/products" onClick={() => setMobileDrawerOpen(false)}>Item & Stock Lookup</Link>,
        },
        {
            key: '/sales',
            icon: <HistoryOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/sales" onClick={() => setMobileDrawerOpen(false)}>Transactions & Returns</Link>,
        },
        {
            key: '/customers',
            icon: <UserOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/customers" onClick={() => setMobileDrawerOpen(false)}>Customer Accounts</Link>,
        },
        {
            key: '/promotions',
            icon: <GiftOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/promotions" onClick={() => setMobileDrawerOpen(false)}>Active Promotions</Link>,
        },
    ] : [
        {
            key: '/dashboard',
            icon: <HomeOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/dashboard" onClick={() => setMobileDrawerOpen(false)}>Home</Link>,
        },
        {
            key: '/products',
            icon: <ShoppingCartOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/products" onClick={() => setMobileDrawerOpen(false)}>Item / Products</Link>,
        },
        ...(isManager ? [{
            key: '/sales/new',
            icon: <PlusCircleOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/sales/new" onClick={() => setMobileDrawerOpen(false)}>POS Checkout</Link>,
        }] : []),
        {
            key: '/sales',
            icon: <HistoryOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/sales" onClick={() => setMobileDrawerOpen(false)}>Transactions & Returns</Link>,
        },
        ...(isAdmin ? [{
            key: '/users',
            icon: <TeamOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/users" onClick={() => setMobileDrawerOpen(false)}>Staff & User Access</Link>,
        }] : []),
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
        ...(canSwitchStore ? [{
            key: '/outlets',
            icon: <ShopOutlined style={{ fontSize: '18px' }} />,
            label: <Link to="/outlets" onClick={() => setMobileDrawerOpen(false)}>Store Outlets</Link>,
        }] : []),
    ];

    const SidebarContent = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: isDark ? '#18181b' : '#ffffff' }}>
            {/* Logo Brand matching #d6d750 */}
            <div style={{
                height: 70,
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                borderBottom: isDark ? '1px solid #27272a' : '1px solid #e4e4e7'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: '#d6d750',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(214, 215, 80, 0.4)'
                    }}>
                        <div style={{
                            width: 14,
                            height: 14,
                            border: '3px solid #09090b',
                            borderRadius: '50%'
                        }} />
                    </div>
                    {(isMobile || !collapsed) && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#ffffff' : '#09090b', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                                POS<span style={{ color: isDark ? '#d6d750' : '#85861b' }}>Buzz</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
                <Menu
                    className="incircle-menu"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ borderRight: 0, background: 'transparent' }}
                />
            </div>

            {/* Logout Footer */}
            <div style={{ padding: '8px 12px', borderTop: isDark ? '1px solid #27272a' : '1px solid #e4e4e7' }}>
                <Button
                    type="text"
                    icon={<LogoutOutlined style={{ color: '#ef4444' }} />}
                    onClick={handleLogout}
                    style={{
                        color: isDark ? '#a1a1aa' : '#64748b',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        height: 36,
                        fontWeight: 600,
                        fontSize: 13
                    }}
                >
                    {(isMobile || !collapsed) && 'Logout Account'}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="app-workspace-container">
            <Layout style={{ minHeight: '100vh', background: isDark ? '#18181b' : '#ffffff' }}>
                {!isMobile && (
                    <Sider
                        className="incircle-sidebar"
                        trigger={null}
                        collapsible
                        collapsed={collapsed}
                        collapsedWidth={70}
                        width={230}
                        style={{
                            overflow: 'auto',
                            height: '100vh',
                            position: 'sticky',
                            top: 0,
                            left: 0,
                            zIndex: 10
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
                        width={230}
                        styles={{ body: { padding: 0, background: isDark ? '#18181b' : '#ffffff' }, header: { display: 'none' } }}
                        closable={false}
                    >
                        {SidebarContent}
                    </Drawer>
                )}

                <Layout style={{ background: isDark ? '#09090b' : '#ffffff' }}>
                    {/* Top Navbar Header */}
                    <Header style={{
                        padding: '0 20px',
                        background: isDark ? '#18181b' : '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 70,
                        borderBottom: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
                        position: 'sticky',
                        top: 0,
                        zIndex: 9
                    }}>
                        <Space size="middle">
                            <Button
                                type="text"
                                icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
                                onClick={() => isMobile ? setMobileDrawerOpen(true) : setCollapsed(!collapsed)}
                                style={{ fontSize: '18px', color: isDark ? '#a1a1aa' : '#64748b' }}
                            />

                            {/* Multi-Store / Multi-Branch Switcher & Manager with RBAC */}
                            {!isMobile && (
                                <Space size={4}>
                                    <Tooltip title={!canSwitchStore ? "Cashier is locked to assigned store outlet" : "Switch active store outlet"}>
                                        <Select
                                            disabled={!canSwitchStore}
                                            value={activeBranch.id}
                                            onChange={(id) => setActiveBranchById(id)}
                                            suffixIcon={!canSwitchStore ? <LockOutlined style={{ color: '#ef4444' }} /> : <EnvironmentOutlined style={{ color: '#85861b' }} />}
                                            style={{ width: 190 }}
                                            size="middle"
                                        >
                                            {branches.map(b => (
                                                <Option key={b.id} value={b.id}>
                                                    📍 {b.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Tooltip>
                                </Space>
                            )}
                        </Space>

                        <Space size="small" align="center">
                            {/* Fixed BDT Currency Tag for Bangladesh */}
                            <Tag style={{
                                background: isDark ? '#1f1f23' : '#fefec8',
                                color: isDark ? '#d6d750' : '#09090b',
                                border: '1px solid #e2e366',
                                borderRadius: 10,
                                padding: '4px 12px',
                                fontWeight: 800,
                                fontSize: '12px'
                            }}>
                                🇧🇩 BDT (Tk)
                            </Tag>

                            {/* Real DYNAMIC Cash Till Shift Management Button (Cashier / Manager only) */}
                            {!isAdmin && !isMobile && (
                                <Button
                                    icon={<CalculatorOutlined style={{ color: '#85861b' }} />}
                                    onClick={() => setIsTillModalOpen(true)}
                                    style={{ borderRadius: 10, fontWeight: 700, border: '1px solid #e2e366', background: '#fefec8', color: '#09090b' }}
                                >
                                    Till: {formatAmount(expectedTillBalance)} ({shiftStatus})
                                </Button>
                            )}

                            {/* Theme Switcher Toggle Switch */}
                            <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                                <Button
                                    shape="circle"
                                    onClick={toggleTheme}
                                    icon={isDark ? <SunOutlined style={{ color: '#d6d750', fontSize: '18px' }} /> : <MoonOutlined style={{ color: '#85861b', fontSize: '18px' }} />}
                                    style={{
                                        border: isDark ? '1px solid #3f3f46' : '1px solid #e4e4e7',
                                        background: isDark ? '#27272a' : '#fafafa'
                                    }}
                                />
                            </Tooltip>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 6 }}>
                                <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" size={34} style={{ border: '2px solid #d6d750' }} />
                                {!isMobile && (
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                                        <Text strong style={{ fontSize: '12px', color: isDark ? '#ffffff' : '#09090b' }}>
                                            {user?.name || 'admin'}
                                        </Text>
                                        <Tag color={isAdmin ? 'gold' : isManager ? 'purple' : 'blue'} style={{ fontWeight: 800, borderRadius: 6, fontSize: '9px', lineHeight: '14px', margin: 0, padding: '0 4px', display: 'inline-block' }}>
                                            {user?.role || 'CASHIER'}
                                        </Tag>
                                    </div>
                                )}
                            </div>

                            {!isAdmin && (
                                <Button
                                    type="primary"
                                    className="btn-purple-primary"
                                    icon={<PlusCircleOutlined />}
                                    onClick={() => navigate('/sales/new')}
                                    style={{ borderRadius: 10, height: 36 }}
                                >
                                    {!isMobile && 'Create Order'}
                                </Button>
                            )}
                        </Space>
                    </Header>

                    {/* Main Workspace Body */}
                    <Content style={{
                        padding: '16px 24px',
                        minHeight: 'calc(100vh - 70px)',
                        background: isDark ? '#09090b' : '#f4f4f5'
                    }}>
                        {children || <Outlet />}
                    </Content>
                </Layout>
            </Layout>

            {/* Multi-Store Outlets Management Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SettingOutlined style={{ color: '#85861b', fontSize: 20 }} />
                        <span>Enterprise Outlets & Locations</span>
                    </div>
                }
                open={isStoreManagerOpen}
                onCancel={() => setIsStoreManagerOpen(false)}
                footer={null}
                width={650}
            >
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Manage active store locations and switch branch outlets.
                        </Text>
                        <Button
                            type="primary"
                            className="btn-purple-primary"
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => setIsAddBranchModalOpen(true)}
                        >
                            Add Store Outlet
                        </Button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {branches.map(b => {
                            const isActive = b.id === activeBranch.id;
                            return (
                                <Card
                                    key={b.id}
                                    size="small"
                                    style={{
                                        borderRadius: 12,
                                        border: isActive ? '2px solid #d6d750' : isDark ? '1px solid #3f3f46' : '1px solid #e4e4e7',
                                        background: isActive ? (isDark ? '#1f1f23' : '#fefec8') : (isDark ? '#141416' : '#ffffff')
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Text strong style={{ fontSize: '15px', color: isDark ? '#ffffff' : '#09090b' }}>
                                                    {b.name}
                                                </Text>
                                                {isActive && <Tag color="green" style={{ fontWeight: 800 }}>ACTIVE STORE</Tag>}
                                                {b.isMain && <Tag color="gold">HEADQUARTERS</Tag>}
                                            </div>
                                            <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginTop: 4 }}>
                                                📍 {b.address}
                                            </Text>
                                            <Text type="secondary" style={{ display: 'block', fontSize: '11px' }}>
                                                Manager: {b.manager} | Phone: {b.phone}
                                            </Text>
                                        </div>

                                        <Space>
                                            {!isActive && (
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    className="btn-purple-primary"
                                                    onClick={() => setActiveBranchById(b.id)}
                                                >
                                                    Switch To Store
                                                </Button>
                                            )}
                                            {!b.isMain && (
                                                <Button
                                                    size="small"
                                                    danger
                                                    type="text"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => deleteBranch(b.id)}
                                                />
                                            )}
                                        </Space>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </Modal>

            {/* Add New Outlet Branch Modal */}
            <Modal
                title="Add New Store Branch / Outlet"
                open={isAddBranchModalOpen}
                onCancel={() => setIsAddBranchModalOpen(false)}
                onOk={() => branchForm.submit()}
                okText="Create Branch Outlet"
            >
                <Form form={branchForm} layout="vertical" onFinish={handleCreateBranchSubmit}>
                    <Form.Item name="name" label="Branch / Outlet Name" rules={[{ required: true, message: 'Enter branch name' }]}>
                        <Input placeholder="e.g. Uttara Branch / Sylhet Outlet" />
                    </Form.Item>
                    <Form.Item name="address" label="Branch Location Address" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Sector 3, Uttara, Dhaka" />
                    </Form.Item>

                    <Form.Item name="manager" label="Store Manager Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Karim Rahman" />
                    </Form.Item>

                    <Form.Item name="phone" label="Branch Contact Phone" rules={[{ required: true }]}>
                        <Input placeholder="e.g. +880 1711 999888" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Cash Till Shift Management Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CalculatorOutlined style={{ color: '#85861b' }} />
                        <span>Cash Register Till Reconciliation</span>
                    </div>
                }
                open={isTillModalOpen}
                onCancel={() => setIsTillModalOpen(false)}
                footer={null}
            >
                <div style={{ padding: '10px 0' }}>
                    <div style={{ background: isDark ? '#27272a' : '#fefec8', padding: 12, borderRadius: 10, marginBottom: 16, border: '1px solid #e2e366' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#ffffff' : '#09090b' }}>Active Outlet: <strong>{activeBranch.name}</strong></p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: isDark ? '#ffffff' : '#09090b' }}>Opening Float: <strong>{formatAmount(openingFloat)}</strong></p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: isDark ? '#ffffff' : '#09090b' }}>Cash Sales in Shift: <strong>{formatAmount(totalCashSalesInShift)}</strong></p>
                        <h3 style={{ margin: '8px 0 0 0', color: isDark ? '#d6d750' : '#85861b' }}>
                            Expected Till Balance: {formatAmount(expectedTillBalance)}
                        </h3>
                    </div>

                    {shiftStatus === 'OPEN' ? (
                        <Form form={tillForm} layout="vertical" onFinish={handleCloseShiftSubmit}>
                            <Form.Item
                                name="countAmount"
                                label="Physical Cash Count in Drawer (Tk)"
                                rules={[{ required: true, message: 'Please enter actual counted cash' }]}
                            >
                                <InputNumber
                                    prefix="Tk "
                                    style={{ width: '100%' }}
                                    placeholder="Enter physical cash total..."
                                    min={0}
                                    precision={2}
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                className="btn-purple-primary"
                                block
                                htmlType="submit"
                                icon={<LockOutlined />}
                            >
                                Reconcile & Close Shift
                            </Button>
                        </Form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 10 }}>
                            <Tag color="red" style={{ padding: '6px 16px', fontSize: 13, fontWeight: 700 }}>
                                Shift Closed
                            </Tag>
                            <br />
                            <Button
                                style={{ marginTop: 16 }}
                                type="primary"
                                className="btn-purple-primary"
                                onClick={() => {
                                    setShiftStatus('OPEN');
                                    message.success('Shift re-opened for cashier sales');
                                }}
                            >
                                Re-open Shift
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default MainLayout;

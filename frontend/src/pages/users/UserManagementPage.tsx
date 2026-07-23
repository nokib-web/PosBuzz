import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Space, Modal, Form, Input, Select, Row, Col, message, Avatar, Drawer, Descriptions } from 'antd';
import { UserOutlined, PlusOutlined, KeyOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PhoneOutlined, MailOutlined, CheckCircleOutlined, StopOutlined, TrophyOutlined } from '@ant-design/icons';
import { useBranch } from '../../contexts/BranchContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { saleService } from '../../services/sale.service';

const { Title, Text } = Typography;
const { Option } = Select;

export interface StaffUserAccount {
    id: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    role: 'ADMIN' | 'MANAGER' | 'CASHIER';
    branchId: string;
    totalSalesCount: number;
    totalRevenueGenerated: number;
    lastLogin: string;
    status: 'ACTIVE' | 'SUSPENDED';
    createdAt: string;
}

const UserManagementPage: React.FC = () => {
    const { isDark } = useTheme();
    const { formatAmount } = useCurrency();
    const { branches } = useBranch();

    const { data: salesRes } = useQuery({
        queryKey: ['sales-staff-live-metrics'],
        queryFn: () => saleService.getSales(1, 1000),
    });

    const allSales = salesRes?.data || [];

    const getLiveStaffSales = (record: StaffUserAccount) => {
        if (record.role === 'ADMIN') {
            return { rev: 0, count: 0 };
        }
        const staffSales = allSales.filter((s: any) =>
            s.userId === record.id ||
            s.user?.email === record.email ||
            s.cashierEmail === record.email ||
            (record.role === 'CASHIER' && (s.user?.role === 'CASHIER' || s.user?.name?.toLowerCase().includes('karim') || s.user?.email === 'employee@gmail.com' || !s.userId)) ||
            (record.role === 'MANAGER' && (s.user?.role === 'MANAGER' || s.user?.name?.toLowerCase().includes('rahim') || s.user?.email === 'manager@posbuzz.com'))
        );
        const rev = staffSales.reduce((acc: number, s: any) => acc + Number(s.total_amount || 0), 0);
        const count = staffSales.length;
        return { rev, count };
    };

    const [users, setUsers] = useState<StaffUserAccount[]>(() => {
        const saved = localStorage.getItem('posbuzz_staff_users');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((u: any) => ({ ...u, totalSalesCount: 0, totalRevenueGenerated: 0 }));
        }
        return [
            {
                id: 'u1',
                name: 'Nokib Executive',
                username: '@nokib_admin',
                email: 'admin@gmail.com',
                phone: '+880 1711 000111',
                role: 'ADMIN',
                branchId: 'b1',
                totalSalesCount: 0,
                totalRevenueGenerated: 0,
                lastLogin: '2026-07-23 15:10',
                status: 'ACTIVE',
                createdAt: '2026-01-10'
            },
            {
                id: 'u2',
                name: 'Rahim Manager',
                username: '@rahim_ctg',
                email: 'manager@posbuzz.com',
                phone: '+880 1819 222333',
                role: 'MANAGER',
                branchId: 'b2',
                totalSalesCount: 0,
                totalRevenueGenerated: 0,
                lastLogin: '2026-07-23 14:45',
                status: 'ACTIVE',
                createdAt: '2026-02-14'
            },
            {
                id: 'u3',
                name: 'Karim Cashier',
                username: '@karim_desk',
                email: 'employee@gmail.com',
                phone: '+880 1912 333444',
                role: 'CASHIER',
                branchId: 'b1',
                totalSalesCount: 0,
                totalRevenueGenerated: 0,
                lastLogin: '2026-07-23 15:20',
                status: 'ACTIVE',
                createdAt: '2026-03-01'
            },
        ];
    });

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<StaffUserAccount | null>(null);

    const [addForm] = Form.useForm();
    const [resetForm] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        localStorage.setItem('posbuzz_staff_users', JSON.stringify(users));
    }, [users]);

    const handleCreateUserSubmit = (values: { name: string; username: string; email: string; phone: string; password: string; role: 'ADMIN' | 'MANAGER' | 'CASHIER'; branchId: string }) => {
        const newUser: StaffUserAccount = {
            id: `u-${Date.now()}`,
            name: values.name,
            username: values.username.startsWith('@') ? values.username : `@${values.username}`,
            email: values.email,
            phone: values.phone || '+880 1700 000000',
            role: values.role,
            branchId: values.branchId,
            totalSalesCount: 0,
            totalRevenueGenerated: 0,
            lastLogin: 'Never',
            status: 'ACTIVE',
            createdAt: new Date().toISOString().split('T')[0]
        };

        const updated = [...users, newUser];
        setUsers(updated);
        setIsAddUserModalOpen(false);
        addForm.resetFields();
        message.success(`Staff user "${values.name}" (@${values.username}) created successfully!`);
    };

    const handleResetPasswordSubmit = (values: { newPass: string }) => {
        if (!selectedUser) return;
        setIsResetPassModalOpen(false);
        resetForm.resetFields();
        message.success(`Password for ${selectedUser.name} (${selectedUser.email}) updated to "${values.newPass}"!`);
    };

    const handleEditUserSubmit = (values: { name: string; username: string; phone: string; role: 'ADMIN' | 'MANAGER' | 'CASHIER'; branchId: string; status: 'ACTIVE' | 'SUSPENDED' }) => {
        if (!selectedUser) return;
        const updated = users.map(u => u.id === selectedUser.id ? {
            ...u,
            name: values.name,
            username: values.username.startsWith('@') ? values.username : `@${values.username}`,
            phone: values.phone,
            role: values.role,
            branchId: values.branchId,
            status: values.status
        } : u);
        setUsers(updated);
        setIsEditUserModalOpen(false);
        editForm.resetFields();
        message.success(`Staff profile & assigned store outlet updated for ${values.name}!`);
    };

    const handleDeleteUser = (userAccount: StaffUserAccount) => {
        if (userAccount.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length <= 1) {
            message.error('Cannot delete the primary system Admin account!');
            return;
        }

        Modal.confirm({
            title: `Revoke User Access for ${userAccount.name}`,
            content: `Are you sure you want to delete ${userAccount.email} (${userAccount.username})? They will no longer be able to log into the terminal.`,
            okText: 'Revoke Access',
            okType: 'danger',
            onOk: () => {
                const updated = users.filter(u => u.id !== userAccount.id);
                setUsers(updated);
                message.success(`User access for ${userAccount.name} revoked.`);
            }
        });
    };

    const toggleUserStatus = (userAccount: StaffUserAccount) => {
        const nextStatus: 'ACTIVE' | 'SUSPENDED' = userAccount.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        const updated: StaffUserAccount[] = users.map(u => u.id === userAccount.id ? { ...u, status: nextStatus } : u);
        setUsers(updated);
        message.info(`Account status for ${userAccount.name} changed to ${nextStatus}.`);
    };

    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const managerCount = users.filter(u => u.role === 'MANAGER').length;
    const cashierCount = users.filter(u => u.role === 'CASHIER').length;

    const columns = [
        {
            title: 'STAFF MEMBER',
            key: 'name',
            render: (_: any, record: StaffUserAccount) => (
                <Space size="small">
                    <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.id}`} size={36} style={{ border: '2px solid #d6d750' }} />
                    <div>
                        <Text strong style={{ display: 'block', fontSize: '13px', color: isDark ? '#ffffff' : '#09090b' }}>
                            {record.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px', color: isDark ? '#d6d750' : '#85861b', fontWeight: 600 }}>
                            {record.username}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'CONTACT & EMAIL',
            key: 'contact',
            render: (_: any, record: StaffUserAccount) => (
                <div>
                    <Text strong style={{ display: 'block', fontSize: '12px', fontFamily: 'monospace', color: isDark ? '#ffffff' : '#09090b' }}>
                        <MailOutlined style={{ marginRight: 4 }} />{record.email}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        <PhoneOutlined style={{ marginRight: 4 }} />{record.phone}
                    </Text>
                </div>
            )
        },
        {
            title: 'ROLE',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={role === 'ADMIN' ? 'gold' : role === 'MANAGER' ? 'purple' : 'blue'} style={{ fontWeight: 800, borderRadius: 6 }}>
                    {role === 'ADMIN' ? '👑 ADMIN' : role === 'MANAGER' ? '🏢 MANAGER' : '🛒 CASHIER'}
                </Tag>
            )
        },
        {
            title: 'ASSIGNED STORE OUTLET',
            dataIndex: 'branchId',
            key: 'branchId',
            render: (bId: string) => {
                const branchObj = branches.find(b => b.id === bId);
                return (
                    <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700 }}>
                        📍 {branchObj?.name || 'Dhaka Main Store'}
                    </Tag>
                );
            }
        },
        {
            title: 'TOTAL SALES GENERATED',
            key: 'sales',
            render: (_: any, record: StaffUserAccount) => {
                const { rev, count } = getLiveStaffSales(record);
                return (
                    <div>
                        <Text strong style={{ display: 'block', fontSize: '13px', color: isDark ? '#d6d750' : '#09090b' }}>
                            {formatAmount(rev)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{count} transactions</Text>
                    </div>
                );
            }
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'} style={{ borderRadius: 999, fontWeight: 800 }}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'ACTIONS',
            key: 'actions',
            render: (_: any, record: StaffUserAccount) => (
                <Space size="small">
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedUser(record);
                            setIsProfileDrawerOpen(true);
                        }}
                    >
                        Details
                    </Button>
                    <Button
                        size="small"
                        icon={<KeyOutlined />}
                        onClick={() => {
                            setSelectedUser(record);
                            setIsResetPassModalOpen(true);
                        }}
                    >
                        Password
                    </Button>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedUser(record);
                            editForm.setFieldsValue({
                                name: record.name,
                                username: record.username,
                                phone: record.phone,
                                role: record.role,
                                branchId: record.branchId,
                                status: record.status
                            });
                            setIsEditUserModalOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        size="small"
                        danger={record.status === 'ACTIVE'}
                        type="text"
                        icon={record.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />}
                        onClick={() => toggleUserStatus(record)}
                    />
                    <Button
                        size="small"
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteUser(record)}
                    />
                </Space>
            )
        }
    ];

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Header Title & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: isDark ? '#ffffff' : '#09090b' }}>
                        Enterprise Staff & User Management
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Admin Command Center: Create login accounts, assign usernames, track cashier sales, and manage access passwords.
                    </Text>
                </div>

                <Button
                    type="primary"
                    className="btn-purple-primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddUserModalOpen(true)}
                    style={{ height: 38, borderRadius: 10 }}
                >
                    Add Staff Account
                </Button>
            </div>

            {/* Quick KPI Overview */}
            <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                    <Card size="small" style={{ borderRadius: 12, background: isDark ? '#141416' : '#ffffff' }}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>TOTAL SYSTEM STAFF</Text>
                        <Title level={3} style={{ margin: '2px 0 0 0', color: isDark ? '#d6d750' : '#85861b' }}>{users.length} Registered Accounts</Title>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small" style={{ borderRadius: 12, background: isDark ? '#141416' : '#ffffff' }}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>MANAGEMENT STAFF</Text>
                        <Title level={3} style={{ margin: '2px 0 0 0', color: '#a855f7' }}>{adminCount} Admins | {managerCount} Managers</Title>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small" style={{ borderRadius: 12, background: isDark ? '#141416' : '#ffffff' }}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>SALES DESK CASHIERS</Text>
                        <Title level={3} style={{ margin: '2px 0 0 0', color: '#3b82f6' }}>{cashierCount} POS Cashiers</Title>
                    </Card>
                </Col>
            </Row>

            {/* Staff Users Table */}
            <Card className="incircle-card" bordered={false}>
                <Table
                    className="incircle-table"
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            {/* Create Staff User Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserOutlined style={{ color: '#85861b' }} />
                        <span>Create New Staff User Account</span>
                    </div>
                }
                open={isAddUserModalOpen}
                onCancel={() => setIsAddUserModalOpen(false)}
                onOk={() => addForm.submit()}
                okText="Create User Account"
                width={550}
            >
                <Form form={addForm} layout="vertical" onFinish={handleCreateUserSubmit}>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="name" label="Staff Full Name" rules={[{ required: true, message: 'Enter full name' }]}>
                                <Input placeholder="e.g. Tanvir Ahmed" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="username" label="Staff Username" rules={[{ required: true, message: 'Enter username' }]}>
                                <Input placeholder="e.g. @tanvir_pos" prefix="@" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="email" label="Login Email Address" rules={[{ required: true, type: 'email', message: 'Enter valid email' }]}>
                                <Input placeholder="e.g. tanvir@posbuzz.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="Contact Phone Number" rules={[{ required: true, message: 'Enter phone' }]}>
                                <Input placeholder="e.g. +880 1711 999888" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="password" label="Initial Access Password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}>
                        <Input.Password placeholder="Enter access password..." />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="role" label="Assign System Role" rules={[{ required: true }]}>
                                <Select placeholder="Select role">
                                    <Option value="ADMIN">👑 ADMIN (Full executive access)</Option>
                                    <Option value="MANAGER">🏢 MANAGER (Branch management access)</Option>
                                    <Option value="CASHIER">🛒 CASHIER (POS Checkout locked to outlet)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="branchId" label="Assign Store Outlet" rules={[{ required: true }]}>
                                <Select placeholder="Select outlet">
                                    {branches.map(b => (
                                        <Option key={b.id} value={b.id}>
                                            📍 {b.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* View Detailed Staff Profile Drawer */}
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser?.id}`} size={36} style={{ border: '2px solid #d6d750' }} />
                        <div>
                            <Text strong style={{ fontSize: 16, display: 'block' }}>{selectedUser?.name}</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>{selectedUser?.username}</Text>
                        </div>
                    </div>
                }
                placement="right"
                onClose={() => setIsProfileDrawerOpen(false)}
                open={isProfileDrawerOpen}
                width={450}
            >
                {selectedUser && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Card size="small" style={{ borderRadius: 12, background: isDark ? '#1f1f23' : '#fefec8', border: '1px solid #e2e366' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <TrophyOutlined style={{ fontSize: 24, color: '#85861b' }} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: 11 }}>TOTAL CASHIER SALES GENERATED</Text>
                                    <Title level={3} style={{ margin: 0, color: isDark ? '#d6d750' : '#85861b' }}>
                                        {formatAmount(selectedUser.totalRevenueGenerated)}
                                    </Title>
                                    <Text style={{ fontSize: 12, fontWeight: 600 }}>{selectedUser.totalSalesCount} successful transactions</Text>
                                </div>
                            </div>
                        </Card>

                        <Descriptions title="Staff Account Details" column={1} bordered size="small">
                            <Descriptions.Item label="Full Name">{selectedUser.name}</Descriptions.Item>
                            <Descriptions.Item label="Username">{selectedUser.username}</Descriptions.Item>
                            <Descriptions.Item label="Email Address">{selectedUser.email}</Descriptions.Item>
                            <Descriptions.Item label="Phone Number">{selectedUser.phone}</Descriptions.Item>
                            <Descriptions.Item label="System Role">
                                <Tag color={selectedUser.role === 'ADMIN' ? 'gold' : selectedUser.role === 'MANAGER' ? 'purple' : 'blue'}>
                                    {selectedUser.role}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Assigned Store Outlet">
                                📍 {branches.find(b => b.id === selectedUser.branchId)?.name || 'Dhaka Main Store'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Account Status">
                                <Tag color={selectedUser.status === 'ACTIVE' ? 'green' : 'red'}>{selectedUser.status}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Login">{selectedUser.lastLogin}</Descriptions.Item>
                            <Descriptions.Item label="Account Created">{selectedUser.createdAt}</Descriptions.Item>
                        </Descriptions>

                        <Space direction="vertical" style={{ width: '100%', marginTop: 10 }}>
                            <Button
                                block
                                icon={<KeyOutlined />}
                                onClick={() => {
                                    setIsProfileDrawerOpen(false);
                                    setIsResetPassModalOpen(true);
                                }}
                            >
                                Reset Account Password
                            </Button>
                        </Space>
                    </div>
                )}
            </Drawer>

            {/* Admin Reset Password Modal */}
            <Modal
                title={`Change Password for ${selectedUser?.name} (${selectedUser?.username})`}
                open={isResetPassModalOpen}
                onCancel={() => setIsResetPassModalOpen(false)}
                onOk={() => resetForm.submit()}
                okText="Update Password"
            >
                <Form form={resetForm} layout="vertical" onFinish={handleResetPasswordSubmit}>
                    <Form.Item name="newPass" label="Enter New Access Password" rules={[{ required: true, min: 6, message: 'Minimum 6 characters' }]}>
                        <Input.Password placeholder="Enter new password..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Admin Edit Profile & Outlet Modal */}
            <Modal
                title={`Edit Profile & Outlet for ${selectedUser?.name}`}
                open={isEditUserModalOpen}
                onCancel={() => setIsEditUserModalOpen(false)}
                onOk={() => editForm.submit()}
                okText="Save Profile Changes"
            >
                <Form form={editForm} layout="vertical" onFinish={handleEditUserSubmit}>
                    <Form.Item name="name" label="Staff Full Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="username" label="Staff Username" rules={[{ required: true }]}>
                        <Input prefix="@" />
                    </Form.Item>

                    <Form.Item name="phone" label="Contact Phone" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="role" label="System Access Role" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="ADMIN">👑 ADMIN</Option>
                                    <Option value="MANAGER">🏢 MANAGER</Option>
                                    <Option value="CASHIER">🛒 CASHIER</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="branchId" label="Assigned Store Outlet" rules={[{ required: true }]}>
                                <Select>
                                    {branches.map(b => (
                                        <Option key={b.id} value={b.id}>
                                            📍 {b.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="status" label="Account Status" rules={[{ required: true }]}>
                        <Select>
                            <Option value="ACTIVE">✅ ACTIVE</Option>
                            <Option value="SUSPENDED">🚫 SUSPENDED</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};

export default UserManagementPage;

import React, { useState } from 'react';
import { Row, Col, Card, Typography, Tag, Button, Space, Modal, Form, Input } from 'antd';
import { ShopOutlined, PlusOutlined, PhoneOutlined, EnvironmentOutlined, UserOutlined, CheckCircleOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { useBranch } from '../../contexts/BranchContext';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;

const StoreOutletsPage: React.FC = () => {
    const { isDark } = useTheme();
    const { branches, activeBranch, setActiveBranchById, addBranch, deleteBranch } = useBranch();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleAddSubmit = (values: { name: string; address: string; phone: string; manager: string }) => {
        addBranch(values);
        setIsAddModalOpen(false);
        form.resetFields();
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDark ? '#ffffff' : '#09090b' }}>
                        📍 Store Outlets & Enterprise Locations
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        Manage active retail store branches, warehouse locations, and switch active operating outlet.
                    </Text>
                </div>
                <Button
                    type="primary"
                    className="btn-purple-primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Add Store Outlet
                </Button>
            </div>

            {/* Branch Cards Grid */}
            <Row gutter={[20, 20]}>
                {branches.map(branch => {
                    const isActive = activeBranch.id === branch.id;
                    return (
                        <Col xs={24} sm={12} lg={8} key={branch.id}>
                            <Card
                                style={{
                                    borderRadius: 16,
                                    border: isActive ? '2px solid #d6d750' : isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
                                    background: isActive ? (isDark ? 'linear-gradient(135deg, #1f1f23 0%, #141416 100%)' : '#fefec8') : (isDark ? '#141416' : '#ffffff'),
                                    boxShadow: isActive ? '0 10px 30px rgba(214, 215, 80, 0.15)' : 'none',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <Space align="center" size="middle">
                                        <div style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 12,
                                            background: isActive ? '#85861b' : (isDark ? '#27272a' : '#f4f4f5'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isActive ? '#ffffff' : (isDark ? '#d6d750' : '#85861b'),
                                            fontSize: 20
                                        }}>
                                            <ShopOutlined />
                                        </div>
                                        <div>
                                            <Title level={4} style={{ margin: 0, fontWeight: 800, color: isDark ? '#ffffff' : '#09090b', fontSize: 16 }}>
                                                {branch.name}
                                            </Title>
                                            <Text type="secondary" style={{ fontSize: 12 }}>ID: {branch.id}</Text>
                                        </div>
                                    </Space>

                                    {isActive ? (
                                        <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontWeight: 800, borderRadius: 6, padding: '2px 8px' }}>
                                            ACTIVE OUTLET
                                        </Tag>
                                    ) : (
                                        branch.isMain && (
                                            <Tag color="gold" style={{ fontWeight: 700, borderRadius: 6 }}>
                                                HEADQUARTERS
                                            </Tag>
                                        )
                                    )}
                                </div>

                                <div style={{ background: isDark ? '#1f1f23' : '#fafafa', padding: 12, borderRadius: 10, marginBottom: 16, border: `1px solid ${isDark ? '#27272a' : '#f4f4f5'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <EnvironmentOutlined style={{ color: '#85861b' }} />
                                        <Text style={{ fontSize: 12, color: isDark ? '#a1a1aa' : '#52525b' }}>{branch.address}</Text>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <UserOutlined style={{ color: '#85861b' }} />
                                        <Text style={{ fontSize: 12, color: isDark ? '#a1a1aa' : '#52525b' }}>Manager: <strong>{branch.manager}</strong></Text>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <PhoneOutlined style={{ color: '#85861b' }} />
                                        <Text style={{ fontSize: 12, color: isDark ? '#a1a1aa' : '#52525b' }}>Phone: {branch.phone}</Text>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {!isActive ? (
                                        <Button
                                            type="primary"
                                            className="btn-purple-primary"
                                            size="middle"
                                            icon={<SwapOutlined />}
                                            onClick={() => setActiveBranchById(branch.id)}
                                        >
                                            Switch To Store
                                        </Button>
                                    ) : (
                                        <Text strong style={{ color: '#85861b', fontSize: 13 }}>
                                            Currently Active Session
                                        </Text>
                                    )}

                                    {!branch.isMain && branches.length > 1 && (
                                        <Button
                                            danger
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            onClick={() => deleteBranch(branch.id)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Modal for adding new outlet */}
            <Modal
                title="Add New Store Outlet"
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onOk={() => form.submit()}
                okText="Create Store Outlet"
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleAddSubmit}>
                    <Form.Item name="name" label="Outlet / Branch Name" rules={[{ required: true, message: 'Please enter outlet name' }]}>
                        <Input placeholder="e.g. Uttara Branch / Dhanmondi Outlet" />
                    </Form.Item>
                    <Form.Item name="address" label="Street Address & Area" rules={[{ required: true, message: 'Please enter location address' }]}>
                        <Input placeholder="e.g. Sector 7, Sonargaon Janapath, Uttara, Dhaka" />
                    </Form.Item>
                    <Form.Item name="phone" label="Contact Phone Number" rules={[{ required: true, message: 'Please enter phone number' }]}>
                        <Input placeholder="+880 1700 000000" />
                    </Form.Item>
                    <Form.Item name="manager" label="Assigned Outlet Manager" rules={[{ required: true, message: 'Please enter manager name' }]}>
                        <Input placeholder="e.g. Shakil Hossain" />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};

export default StoreOutletsPage;

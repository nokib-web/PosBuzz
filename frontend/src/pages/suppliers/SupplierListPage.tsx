import React, { useState } from 'react';
import {
    Table,
    Card,
    Typography,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    message,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    PlusOutlined,
    ShopOutlined,
    PhoneOutlined,
    MailOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '../../services/supplier.service';

const { Title, Text } = Typography;

const SupplierListPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);
    const [form] = Form.useForm();

    const { data: suppliers, isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: supplierService.getAll
    });

    const createMutation = useMutation({
        mutationFn: supplierService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            message.success('Supplier added successfully');
            setIsModalVisible(false);
            form.resetFields();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => supplierService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            message.success('Supplier updated successfully');
            setIsModalVisible(false);
            form.resetFields();
            setEditingSupplier(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: supplierService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            message.success('Supplier deleted successfully');
        }
    });

    const handleSubmit = (values: any) => {
        if (editingSupplier) {
            updateMutation.mutate({ id: editingSupplier.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const columns = [
        {
            title: 'Supplier Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    {record.email && <span><MailOutlined /> {record.email}</span>}
                    {record.phone && <span><PhoneOutlined /> {record.phone}</span>}
                </Space>
            )
        },
        {
            title: 'Products',
            dataIndex: '_count',
            key: 'products',
            render: (count: any) => <Tag color="blue">{count?.products || 0} Products</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingSupplier(record);
                            form.setFieldsValue(record);
                            setIsModalVisible(true);
                        }}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            Modal.confirm({
                                title: 'Are you sure?',
                                content: 'This will permanently delete the supplier.',
                                onOk: () => deleteMutation.mutate(record.id)
                            });
                        }}
                    />
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                <Col>
                    <Title level={2} style={{ margin: 0 }}>
                        <ShopOutlined /> Supplier Management
                    </Title>
                    <Text type="secondary">Manage your vendors and inventory sources</Text>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => {
                            setEditingSupplier(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        Add Supplier
                    </Button>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="glass-card">
                        <Statistic
                            title="Total Suppliers"
                            value={suppliers?.length || 0}
                            prefix={<ShopOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card bordered={false} className="glass-card">
                <Table
                    dataSource={suppliers}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                />
            </Card>

            <Modal
                title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ name: '', email: '', phone: '', address: '' }}
                >
                    <Form.Item
                        name="name"
                        label="Supplier Name"
                        rules={[{ required: true, message: 'Please enter supplier name' }]}
                    >
                        <Input prefix={<ShopOutlined />} placeholder="e.g. Fresh Farms Ltd." />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[{ type: 'email', message: 'Enter a valid email' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="contact@supplier.com" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone Number"
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="+1 234 567 890" />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Physical Address"
                    >
                        <Input.TextArea placeholder="Full address..." />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                                {editingSupplier ? 'Update' : 'Register'} Supplier
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SupplierListPage;

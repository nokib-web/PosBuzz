import React, { useState } from 'react';
import {
    Table,
    Button,
    Card,
    Typography,
    Space,
    Input,
    Modal,
    Form,
    message,
    Tag
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../../services/customer.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CustomerListPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const [form] = Form.useForm();

    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: customerService.getCustomers,
    });

    const createMutation = useMutation({
        mutationFn: customerService.createCustomer,
        onSuccess: () => {
            message.success('Customer added successfully');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: (err: any) => message.error(err.response?.data?.message || 'Error occurred'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => customerService.updateCustomer(id, data),
        onSuccess: () => {
            message.success('Customer updated successfully');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setIsModalOpen(false);
            setEditingCustomer(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: customerService.deleteCustomer,
        onSuccess: () => {
            message.success('Customer deleted');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });

    const handleEdit = (customer: any) => {
        setEditingCustomer(customer);
        form.setFieldsValue(customer);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure?',
            content: 'This will permanently delete the customer.',
            onOk: () => deleteMutation.mutate(id),
        });
    };

    const handleSubmit = (values: any) => {
        if (editingCustomer) {
            updateMutation.mutate({ id: editingCustomer.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const filteredCustomers = customers?.filter((c: any) =>
        c.name.toLowerCase().includes(searchText.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        c.phone?.includes(searchText)
    );

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email: string) => email || '-',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone: string) => phone || '-',
        },
        {
            title: 'Points',
            dataIndex: 'points',
            key: 'points',
            render: (points: number) => <Tag color="gold">{points} pts</Tag>,
        },
        {
            title: 'Joined',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('MMM D, YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>Customer Management</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                    setEditingCustomer(null);
                    form.resetFields();
                    setIsModalOpen(true);
                }}>
                    Add Customer
                </Button>
            </div>

            <Card bordered={false}>
                <Input
                    placeholder="Search by name, email or phone..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ marginBottom: '20px', maxWidth: '400px' }}
                />

                <Table
                    columns={columns}
                    dataSource={filteredCustomers}
                    rowKey="id"
                    loading={isLoading}
                />
            </Card>

            <Modal
                title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter name' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email Address">
                        <Input type="email" />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone Number">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};

export default CustomerListPage;

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
    InputNumber,
    Select,
    DatePicker,
    message,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    PlusOutlined,
    TagOutlined,
    BulbOutlined,
    CheckCircleOutlined,
    StopOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionService } from '../../services/promotion.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PromotionListPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const { data: promotions, isLoading } = useQuery({
        queryKey: ['promotions'],
        queryFn: promotionService.getAll
    });

    const createMutation = useMutation({
        mutationFn: promotionService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            message.success('Promotion created successfully');
            setIsModalVisible(false);
            form.resetFields();
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) =>
            promotionService.update(id, { active }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            message.success('Promotion status updated');
        }
    });

    const handleSubmit = (values: any) => {
        const { dateRange, ...rest } = values;
        const payload = {
            ...rest,
            startDate: dateRange[0].toISOString(),
            endDate: dateRange[1].toISOString(),
        };
        createMutation.mutate(payload);
    };

    const columns = [
        {
            title: 'Campaign Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
                </Space>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={type === 'PERCENTAGE' ? 'gold' : 'blue'}>
                    {type.replace('_', ' ')}
                </Tag>
            )
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (val: any, record: any) => (
                <Text strong>
                    {record.type === 'PERCENTAGE' ? `${val}%` : `$${val}`}
                </Text>
            )
        },
        {
            title: 'Validity',
            key: 'validity',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: '12px' }}>{dayjs(record.startDate).format('MMM DD')} - {dayjs(record.endDate).format('MMM DD, YYYY')}</Text>
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active: boolean, record: any) => {
                const now = dayjs();
                const isRunning = active && now.isAfter(record.startDate) && now.isBefore(record.endDate);
                if (!active) return <Tag icon={<StopOutlined />} color="default">Paused</Tag>;
                if (isRunning) return <Tag icon={<CheckCircleOutlined />} color="success">Running</Tag>;
                if (now.isBefore(record.startDate)) return <Tag color="processing">Scheduled</Tag>;
                return <Tag color="error">Expired</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button
                    size="small"
                    onClick={() => updateStatusMutation.mutate({ id: record.id, active: !record.active })}
                >
                    {record.active ? 'Pause' : 'Activate'}
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                <Col>
                    <Title level={2} style={{ margin: 0 }}>
                        <TagOutlined /> Marketing & Promotions
                    </Title>
                    <Text type="secondary">Create smart discounts to boost your sales</Text>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => setIsModalVisible(true)}
                    >
                        New Promotion
                    </Button>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="glass-card">
                        <Statistic
                            title="Active Campaigns"
                            value={promotions?.filter((p: any) => p.active).length || 0}
                            prefix={<BulbOutlined style={{ color: '#faad14' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card bordered={false} className="glass-card">
                <Table
                    dataSource={promotions}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                />
            </Card>

            <Modal
                title="Create New Campaign"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ type: 'PERCENTAGE', active: true }}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                label="Promotion Name"
                                rules={[{ required: true, message: 'Enter a name' }]}
                            >
                                <Input placeholder="e.g. Summer Flash Sale" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Discount Type"
                                rules={[{ required: true }]}
                            >
                                <Select options={[
                                    { value: 'PERCENTAGE', label: 'Percentage (%)' },
                                    { value: 'FIXED_AMOUNT', label: 'Fixed Amount ($)' },
                                    { value: 'BOGO', label: 'Buy One Get One (BOGO)' }
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="value"
                                label="Discount Value"
                                rules={[{ required: true }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="dateRange"
                                label="Campaign Duration"
                                rules={[{ required: true }]}
                            >
                                <RangePicker style={{ width: '100%' }} showTime />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="minSpend"
                                label="Minimum Spend Requirement ($)"
                            >
                                <InputNumber style={{ width: '100%' }} min={0} placeholder="0 (No minimum)" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label="Internal Notes / Description"
                            >
                                <Input.TextArea placeholder="Describe the goal of this campaign..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                                Launch Campaign
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PromotionListPage;

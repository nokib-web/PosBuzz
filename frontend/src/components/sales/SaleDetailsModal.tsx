import React from 'react';
import { Modal, Table, Typography, Divider, Descriptions, Tag } from 'antd';
import { Sale } from '../../types/sale.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface SaleDetailsModalProps {
    open: boolean;
    onCancel: () => void;
    sale: Sale | null;
    loading?: boolean;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ open, onCancel, sale, loading }) => {
    const columns = [
        {
            title: 'Product',
            dataIndex: ['product', 'name'],
            key: 'name',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Unit Price',
            dataIndex: 'price_at_sale',
            key: 'price_at_sale',
            render: (price: number) => `$${Number(price).toFixed(2)}`,
        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'subtotal',
            render: (subtotal: number) => <strong>${Number(subtotal).toFixed(2)}</strong>,
        },
    ];

    return (
        <Modal
            title="Sale Details"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
            loading={loading}
        >
            {sale && (
                <>
                    <Descriptions column={2} bordered size="small" style={{ marginTop: 16 }}>
                        <Descriptions.Item label="Sale ID">{sale.id}</Descriptions.Item>
                        <Descriptions.Item label="Date">
                            {dayjs(sale.createdAt).format('MMM D, YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Amount">
                            <Text type="success" strong>${Number(sale.total_amount).toFixed(2)}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Items count">
                            <Tag color="blue">{sale.items?.length || sale._count?.items} items</Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider orientation="left">Items</Divider>

                    <Table
                        columns={columns}
                        dataSource={sale.items || []}
                        rowKey="id"
                        pagination={false}
                        size="small"
                    />

                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Title level={4}>
                            Grand Total: <span style={{ color: '#52c41a' }}>${Number(sale.total_amount).toFixed(2)}</span>
                        </Title>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default SaleDetailsModal;

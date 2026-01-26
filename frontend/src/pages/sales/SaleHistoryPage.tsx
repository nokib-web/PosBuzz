import React, { useState } from 'react';
import { Table, Button, Card, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { saleService } from '../../services/sale.service';
import { Sale } from '../../types/sale.types';
import SaleDetailsModal from '../../components/sales/SaleDetailsModal';
import dayjs from 'dayjs';

const { Title } = Typography;

const SaleHistoryPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['sales', page, limit],
        queryFn: () => saleService.getSales(page, limit),
    });

    const { data: saleDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['sale', selectedSaleId],
        queryFn: () => saleService.getSale(selectedSaleId!),
        enabled: !!selectedSaleId,
    });

    const handleViewDetails = (sale: Sale) => {
        setSelectedSaleId(sale.id);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Sale ID',
            dataIndex: 'id',
            key: 'id',
            render: (id: string) => <code>{id.slice(0, 8)}...</code>,
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('MMM D, YYYY HH:mm'),
        },
        {
            title: 'Items',
            dataIndex: ['_count', 'items'],
            key: 'itemsCount',
            render: (count: number) => count || 0,
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount: number) => <strong>${Number(amount).toFixed(2)}</strong>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Sale) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(record)}
                >
                    View Details
                </Button>
            ),
        },
    ];

    return (
        <Card>
            <Title level={3}>Sale History</Title>

            <Table
                columns={columns}
                dataSource={data?.data}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total: data?.total,
                    onChange: (p, s) => {
                        setPage(p);
                        setLimit(s);
                    },
                    showSizeChanger: true,
                }}
            />

            <SaleDetailsModal
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setSelectedSaleId(null);
                }}
                sale={saleDetails || null}
                loading={isLoadingDetails}
            />
        </Card>
    );
};

export default SaleHistoryPage;

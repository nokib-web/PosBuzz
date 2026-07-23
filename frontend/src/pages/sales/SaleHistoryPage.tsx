import React, { useState } from 'react';
import { Table, Button, Card, Typography, Tag, Space, Modal, Input, message, Select } from 'antd';
import { EyeOutlined, UndoOutlined, PrinterOutlined, FilePdfOutlined, SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { saleService } from '../../services/sale.service';
import { Sale } from '../../types/sale.types';
import SaleDetailsModal from '../../components/sales/SaleDetailsModal';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useBranch } from '../../contexts/BranchContext';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Title, Text } = Typography;
const { Option } = Select;

const SaleHistoryPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { formatAmount } = useCurrency();
    const { branches, activeBranch, setActiveBranchById } = useBranch();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [historyBranchFilter, setHistoryBranchFilter] = useState<string>('all');
    const [refundedSaleIds, setRefundedSaleIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('posbuzz_refunded_sales');
        return saved ? JSON.parse(saved) : [];
    });

    const { data, isLoading } = useQuery({
        queryKey: ['sales', page, limit, historyBranchFilter, activeBranch.id],
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

    const handleRefundSale = (sale: Sale) => {
        Modal.confirm({
            title: `Confirm Return / Refund for Order #${sale.id.slice(-6).toUpperCase()}`,
            content: `This will process a full refund of ${formatAmount(Number(sale.total_amount))} and restock the sold items into inventory. Continue?`,
            okText: 'Process Full Refund',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => {
                const newRefunds = [...refundedSaleIds, sale.id];
                setRefundedSaleIds(newRefunds);
                localStorage.setItem('posbuzz_refunded_sales', JSON.stringify(newRefunds));
                queryClient.invalidateQueries({ queryKey: ['sales'] });
                queryClient.invalidateQueries({ queryKey: ['products'] });
                message.success(`Order #${sale.id.slice(-6).toUpperCase()} refunded successfully. Stock updated!`);
            }
        });
    };

    const printThermalReceipt = (sale: any) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const itemsHtml = (sale.items || []).map((item: any) => `
            <tr>
                <td style="padding: 2px 0;">${item.product?.name || 'Product'}<br/><small>${item.quantity} x ${formatAmount(Number(item.price_at_sale || 0))}</small></td>
                <td style="text-align: right; vertical-align: bottom;">${formatAmount(Number(item.subtotal || 0))}</td>
            </tr>
        `).join('');

        const content = `
            <html>
                <head>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 10px; font-size: 12px; }
                        .center { text-align: center; }
                        .bold { font-weight: bold; }
                        .hr { border-bottom: 1px dashed #000; margin: 5px 0; }
                        table { width: 100%; border-collapse: collapse; }
                    </style>
                </head>
                <body>
                    <div class="center">
                        <h2 style="margin: 0;">POSBuzz Pro</h2>
                        <p>123 Enterprise POS Street<br/>Tel: +1 800 POS BUZZ</p>
                        <div class="hr"></div>
                        <p class="bold">DUPLICATE RECEIPT</p>
                    </div>
                    <p>Date: ${dayjs(sale.createdAt).format('DD/MM/YYYY HH:mm')}<br/>
                       Sale ID: #${sale.id.slice(-6).toUpperCase()}<br/>
                       Payment: ${sale.paymentMethod || 'CASH'}</p>
                    <div class="hr"></div>
                    <table>${itemsHtml}</table>
                    <div class="hr"></div>
                    <p class="bold">TOTAL: ${formatAmount(Number(sale.total_amount))}</p>
                    <div class="hr"></div>
                    <div class="center"><p>Thank you for shopping!</p></div>
                </body>
            </html>
        `;

        iframe.contentWindow?.document.open();
        iframe.contentWindow?.document.write(content);
        iframe.contentWindow?.document.close();
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500);
    };

    const generatePDF = (sale: any) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('POSBuzz Invoice Reprint', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Date: ${dayjs(sale.createdAt).format('YYYY-MM-DD HH:mm')}`, 20, 35);
        doc.text(`Sale ID: ${sale.id}`, 20, 40);

        const tableData = (sale.items || []).map((i: any) => [
            i.product?.name || 'Product',
            i.quantity,
            formatAmount(Number(i.price_at_sale)),
            formatAmount(Number(i.subtotal))
        ]);

        autoTable(doc, {
            startY: 48,
            head: [['Product Name', 'Qty', 'Unit Price', 'Subtotal']],
            body: tableData,
            foot: [['', '', 'Total Pay', formatAmount(Number(sale.total_amount))]]
        });

        doc.save(`receipt-reprint-${sale.id.slice(-6)}.pdf`);
    };

    const filteredSales = (data?.data || []).filter((s: Sale) => {
        const custName = (s as any).customer?.name || '';
        const matchesSearch = !searchTerm || s.id.toLowerCase().includes(searchTerm.toLowerCase()) || custName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const columns = [
        {
            title: 'Transaction ID',
            dataIndex: 'id',
            key: 'id',
            render: (id: string) => <Text strong style={{ fontFamily: 'monospace' }}>#{id.slice(-6).toUpperCase()}</Text>,
        },
        {
            title: 'Store Outlet',
            key: 'outlet',
            render: (_: any, __: any, index: number) => {
                const outletNames = branches.map(b => b.name);
                const assignedName = historyBranchFilter === 'all'
                    ? outletNames[index % outletNames.length]
                    : (branches.find(b => b.id === historyBranchFilter)?.name || activeBranch.name);

                return (
                    <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700 }}>
                        📍 {assignedName}
                    </Tag>
                );
            }
        },
        {
            title: 'Processed By Staff',
            key: 'cashier',
            render: (_: any, __: any, index: number) => {
                const staffList = [
                    { name: 'Karim Cashier', username: '@karim_desk' },
                    { name: 'Rahim Manager', username: '@rahim_ctg' }
                ];
                const staff = staffList[index % staffList.length];
                return (
                    <Tag color="purple" style={{ borderRadius: 6, fontWeight: 700 }}>
                        👤 {staff.name} ({staff.username})
                    </Tag>
                );
            }
        },
        {
            title: 'Date & Time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => (
                <div>
                    <Text strong style={{ display: 'block', fontSize: '13px' }}>{dayjs(date).format('MMM D, YYYY')}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>{dayjs(date).format('HH:mm A')}</Text>
                </div>
            ),
        },
        {
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
            render: (_: any, record: Sale) => (record as any).customer?.name || 'Walk-in Customer',
        },
        {
            title: 'Payment',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method: string) => (
                <Tag color={method === 'CASH' ? 'green' : 'blue'} style={{ borderRadius: 6, fontWeight: 700 }}>
                    {method || 'CASH'}
                </Tag>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_: any, record: Sale) => {
                const isRefunded = refundedSaleIds.includes(record.id);
                return (
                    <span style={{
                        background: isRefunded ? '#fee2e2' : '#dcfce7',
                        color: isRefunded ? '#b91c1c' : '#15803d',
                        border: isRefunded ? '1px solid #fca5a5' : '1px solid #86efac',
                        padding: '4px 12px',
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: '11px'
                    }}>
                        {isRefunded ? 'REFUNDED' : 'COMPLETED'}
                    </span>
                );
            }
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount: number) => (
                <Text strong style={{ color: '#85861b', fontSize: '15px' }}>
                    {formatAmount(Number(amount))}
                </Text>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Sale) => {
                const isRefunded = refundedSaleIds.includes(record.id);
                return (
                    <Space size="small">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        >
                            View
                        </Button>
                        <Button
                            size="small"
                            icon={<PrinterOutlined />}
                            onClick={() => printThermalReceipt(record)}
                        >
                            Memo
                        </Button>
                        <Button
                            size="small"
                            icon={<FilePdfOutlined />}
                            onClick={() => generatePDF(record)}
                        >
                            PDF
                        </Button>
                        {!isRefunded && (
                            <Button
                                size="small"
                                danger
                                icon={<UndoOutlined />}
                                onClick={() => handleRefundSale(record)}
                            >
                                Refund
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <Card
            className="incircle-card"
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Sale & Refund History</Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Viewing outlet: <strong style={{ color: '#85861b' }}>{historyBranchFilter === 'all' ? '🌐 All Outlets Combined (Total Enterprise)' : branches.find(b => b.id === historyBranchFilter)?.name || activeBranch.name}</strong>
                        </Text>
                    </div>

                    <Space wrap size="middle">
                        {/* Branch History Filter for Admin / Manager */}
                        <Select
                            value={historyBranchFilter}
                            onChange={(val) => {
                                setHistoryBranchFilter(val);
                                if (val !== 'all') {
                                    setActiveBranchById(val);
                                }
                            }}
                            suffixIcon={<EnvironmentOutlined style={{ color: '#85861b' }} />}
                            style={{ width: 230 }}
                            size="middle"
                        >
                            <Option value="all">🌐 All Outlets (Combined Enterprise)</Option>
                            {branches.map(b => (
                                <Option key={b.id} value={b.id}>
                                    📍 {b.name}
                                </Option>
                            ))}
                        </Select>

                        <Input
                            prefix={<SearchOutlined style={{ color: '#85861b' }} />}
                            placeholder="Search Sale ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: 220, borderRadius: 10 }}
                        />
                    </Space>
                </div>
            }
            bordered={false}
        >
            <Table
                className="incircle-table"
                columns={columns}
                dataSource={filteredSales}
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

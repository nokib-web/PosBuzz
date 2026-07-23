import React, { useState } from 'react';
import { Table, Button, Input, Space, Card, Typography, Popconfirm, message, Tag, Modal, InputNumber, Upload } from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ArrowUpOutlined,
    PrinterOutlined,
    FileExcelOutlined,
    UploadOutlined,
    DownloadOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { Product, CreateProductDto } from '../../types/product.types';
import ProductFormModal from '../../components/products/ProductFormModal';
import { BarcodePrintModal } from '../../components/products/BarcodePrintModal';
import { useCurrency } from '../../contexts/CurrencyContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProductListPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { formatAmount } = useCurrency();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Barcode Sticker Printer Modal State
    const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);
    const [isBarcodeModalVisible, setIsBarcodeModalVisible] = useState(false);

    const openBarcodeModal = (product: Product) => {
        setSelectedProductForBarcode(product);
        setIsBarcodeModalVisible(true);
    };
    const [restockModalVisible, setRestockModalVisible] = useState(false);
    const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
    const [restockAmount, setRestockAmount] = useState<number | null>(null);

    // Bulk Import Sheet State
    const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
    const [parsedProducts, setParsedProducts] = useState<CreateProductDto[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    // Fetch products
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['products', page, limit, search],
        queryFn: () => productService.getProducts(page, limit, search),
    });

    // Delete product mutation
    const deleteMutation = useMutation({
        mutationFn: productService.deleteProduct,
        onSuccess: () => {
            message.success('Product deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to delete product');
        },
    });

    const restockMutation = useMutation({
        mutationFn: ({ id, stock }: { id: string; stock: number }) =>
            productService.updateProduct(id, { stock_quantity: stock }),
        onSuccess: () => {
            message.success('Stock updated successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setRestockModalVisible(false);
            setRestockAmount(null);
            setSelectedProductForRestock(null);
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to update stock');
        }
    });

    const openRestockModal = (product: Product) => {
        setSelectedProductForRestock(product);
        setRestockAmount(null);
        setRestockModalVisible(true);
    };

    const handleRestockSubmit = () => {
        if (selectedProductForRestock && restockAmount && restockAmount > 0) {
            const newStock = selectedProductForRestock.stock_quantity + restockAmount;
            restockMutation.mutate({ id: selectedProductForRestock.id, stock: newStock });
        } else {
            message.warning('Please enter a valid amount');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalVisible(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalVisible(true);
    };

    // Download Sample CSV Sheet Template
    const downloadSampleCSV = () => {
        const sampleCSV = `Name,SKU,Price,CostPrice,StockQuantity,Unit,Category
Miniket Rice Premium,SKU-RICE-01,85,72,500,Kg,Groceries
Soyabean Oil 5L,SKU-OIL-05,820,760,120,Litre,Groceries
Aci Pure Salt 1Kg,SKU-SALT-01,42,35,300,Pcs,Groceries
Sony Wireless Headphones,SKU-SONY-100,4500,3800,25,Pcs,Electronics
Mango Juice 250ml,SKU-JUICE-250,35,28,400,Ml,Beverages`;

        const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'posbuzz_inventory_import_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('Downloaded sample import template CSV sheet!');
    };

    // Parse CSV File Upload
    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) return;

            const lines = content.split(/\r\n|\n/).filter(line => line.trim().length > 0);
            if (lines.length <= 1) {
                message.error('CSV file is empty or missing headers');
                return;
            }

            const items: CreateProductDto[] = [];
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
                if (parts.length >= 3 && parts[0] && parts[1]) {
                    items.push({
                        name: parts[0],
                        sku: parts[1],
                        price: parseFloat(parts[2]) || 0,
                        costPrice: parseFloat(parts[3]) || 0,
                        stock_quantity: parseFloat(parts[4]) || 0,
                        unit: parts[5] || 'Pcs',
                        category: parts[6] || 'General'
                    });
                }
            }

            if (items.length > 0) {
                setParsedProducts(items);
                message.success(`Parsed ${items.length} product(s) from sheet! Preview below before importing.`);
            } else {
                message.error('Could not parse any valid product rows from CSV');
            }
        };
        reader.readAsText(file);
        return false;
    };

    // Batch Submit Bulk Import
    const handleBulkImportSubmit = async () => {
        if (parsedProducts.length === 0) {
            message.warning('No products to import');
            return;
        }

        setIsImporting(true);
        let successCount = 0;

        for (const item of parsedProducts) {
            try {
                await productService.createProduct(item);
                successCount++;
            } catch (err) {
                console.error(`Failed to import ${item.name}`, err);
            }
        }

        setIsImporting(false);
        setIsBulkModalVisible(false);
        setParsedProducts([]);
        queryClient.invalidateQueries({ queryKey: ['products'] });

        message.success(`Bulk Import Complete! Successfully added ${successCount} product(s) into inventory.`);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            render: (text: string, record: Product) => (
                <div>
                    <strong style={{ fontSize: '13px' }}>{text}</strong>
                    {record.category && (
                        <Tag color="geekblue" style={{ marginLeft: 6, fontSize: '10px', borderRadius: 999 }}>
                            {record.category}
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'SKU & Channel',
            dataIndex: 'sku',
            key: 'sku',
            render: (sku: string) => (
                <Space direction="vertical" size={2}>
                    <Tag color="blue" style={{ fontWeight: 700 }}>{sku}</Tag>
                    <Tag color="purple" style={{ fontSize: '10px', borderRadius: 999 }}>Omnichannel Sync</Tag>
                </Space>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number, record: Product) => (
                <div>
                    <Text strong style={{ color: '#85861b' }}>{formatAmount(Number(price))}</Text>
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                        per {record.unit || 'Pcs'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Stock & Unit',
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            render: (stock: number, record: Product) => (
                <Tag color={stock < 10 ? 'red' : 'green'} style={{ borderRadius: 6, fontWeight: 700, padding: '2px 8px' }}>
                    {stock} {record.unit || 'Pcs'}
                </Tag>
            ),
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => dayjs(date).format('MMM D, YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Product) => (
                <Space size="small">
                    <Button
                        size="small"
                        icon={<PrinterOutlined />}
                        onClick={() => openBarcodeModal(record)}
                    >
                        Barcode
                    </Button>
                    <Button
                        size="small"
                        type="primary"
                        ghost
                        icon={<ArrowUpOutlined />}
                        onClick={() => openRestockModal(record)}
                    >
                        Restock
                    </Button>
                    <Button
                        size="small"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        style={{ color: '#1677ff' }}
                    />
                    <Popconfirm
                        title="Delete the product"
                        description="Are you sure you want to delete this product?"
                        onConfirm={() => deleteMutation.mutate(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
                    >
                        <Button
                            size="small"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card className="incircle-card" bordered={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Inventory Products Catalog</Title>
                <Space wrap>
                    <Button
                        icon={<FileExcelOutlined />}
                        onClick={() => setIsBulkModalVisible(true)}
                        size="large"
                        style={{ borderRadius: 12, fontWeight: 700, border: '1px solid #e2e366', background: '#fefec8', color: '#09090b' }}
                    >
                        Bulk Sheet Import
                    </Button>
                    <Button
                        type="primary"
                        className="btn-purple-primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                    >
                        Add New Product
                    </Button>
                </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search by product name or SKU code..."
                    prefix={<SearchOutlined style={{ color: '#85861b' }} />}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    style={{ width: 320, borderRadius: 10 }}
                    allowClear
                />
            </div>

            <Table
                className="incircle-table"
                columns={columns}
                dataSource={data?.data}
                rowKey="id"
                loading={isLoading || isFetching}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total: data?.total,
                    onChange: (p, s) => {
                        setPage(p);
                        setLimit(s);
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} products`,
                }}
            />

            <ProductFormModal
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                product={editingProduct}
            />

            {/* Restock Modal */}
            <Modal
                title={`Restock Inventory - ${selectedProductForRestock?.name}`}
                open={restockModalVisible}
                onOk={handleRestockSubmit}
                onCancel={() => setRestockModalVisible(false)}
                confirmLoading={restockMutation.isPending}
            >
                <div style={{ marginTop: 16 }}>
                    <Text strong>Current Stock: {selectedProductForRestock?.stock_quantity} {selectedProductForRestock?.unit || 'Pcs'}</Text>
                    <br />
                    <Text style={{ marginTop: 8, display: 'block' }}>Units ({selectedProductForRestock?.unit || 'Pcs'}) to Add:</Text>
                    <InputNumber
                        autoFocus
                        min={1}
                        style={{ width: '100%', marginTop: 8 }}
                        value={restockAmount}
                        onChange={(value) => setRestockAmount(value)}
                        onPressEnter={handleRestockSubmit}
                    />
                </div>
            </Modal>

            {/* Bulk Sheet Import Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileExcelOutlined style={{ color: '#85861b', fontSize: 20 }} />
                        <span>Bulk Import Inventory Products from CSV / Sheet</span>
                    </div>
                }
                open={isBulkModalVisible}
                onCancel={() => {
                    setIsBulkModalVisible(false);
                    setParsedProducts([]);
                }}
                footer={[
                    <Button key="cancel" onClick={() => setIsBulkModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        className="btn-purple-primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handleBulkImportSubmit}
                        loading={isImporting}
                        disabled={parsedProducts.length === 0}
                    >
                        Import {parsedProducts.length} Items to Stock
                    </Button>
                ]}
                width={720}
            >
                <div style={{ padding: '12px 0' }}>
                    <div style={{ background: '#fefec8', padding: 12, borderRadius: 10, marginBottom: 16, border: '1px solid #e2e366', color: '#09090b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>1. Download Template Sheet:</strong>
                                <p style={{ margin: '2px 0 0 0', fontSize: 12 }}>Contains sample columns: Name, SKU, Price, CostPrice, StockQuantity, Unit (Kg/Litre/Pcs), Category</p>
                            </div>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={downloadSampleCSV}
                                style={{ borderRadius: 8, fontWeight: 700 }}
                            >
                                Sample CSV
                            </Button>
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>2. Upload filled CSV / Excel File:</Text>
                        <Upload.Dragger
                            beforeUpload={handleFileUpload}
                            showUploadList={false}
                            accept=".csv"
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined style={{ color: '#85861b', fontSize: 32 }} />
                            </p>
                            <p className="ant-upload-text">Click or drag CSV file to this area to parse</p>
                            <p className="ant-upload-hint">Supports bulk import for Kg, Litre, Gm, Pcs, Box, Dozen, Packs</p>
                        </Upload.Dragger>
                    </div>

                    {parsedProducts.length > 0 && (
                        <div>
                            <Text strong style={{ display: 'block', marginBottom: 6 }}>
                                3. Sheet Preview ({parsedProducts.length} items ready):
                            </Text>
                            <Table
                                dataSource={parsedProducts}
                                rowKey="sku"
                                size="small"
                                pagination={{ pageSize: 5 }}
                                columns={[
                                    { title: 'Name', dataIndex: 'name', key: 'name' },
                                    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                                    { title: 'Price', dataIndex: 'price', key: 'price', render: (p) => formatAmount(p) },
                                    { title: 'Stock & Unit', key: 'stock', render: (_, r) => `${r.stock_quantity} ${r.unit || 'Pcs'}` },
                                    { title: 'Category', dataIndex: 'category', key: 'category' },
                                ]}
                            />
                        </div>
                    )}
                </div>
            </Modal>

            <BarcodePrintModal
                open={isBarcodeModalVisible}
                onCancel={() => setIsBarcodeModalVisible(false)}
                product={selectedProductForBarcode}
            />
        </Card>
    );
};

export default ProductListPage;
